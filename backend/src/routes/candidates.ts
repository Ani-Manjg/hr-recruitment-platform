import { Router } from 'express'
import { z } from 'zod'
import { config } from '../config.js'
import { db } from '../db.js'
import { HttpError } from '../errors.js'
import { authenticate, requireRole } from '../middleware.js'
import { candidateView } from '../serializers.js'
import { audit, dbError, notify } from '../services.js'
import type { AuthRequest } from '../types.js'

const router=Router(),locationType=z.enum(['Remote','Hybrid','On-site']),resumeStatus=z.enum(['New','Screened','Shortlisted','Rejected','Interviewing'])
const timeline=z.object({role:z.string(),company:z.string(),period:z.string()})
const input=z.object({
  name:z.string().trim().min(1),positionApplied:z.string().trim().min(1),jobId:z.string().uuid(),yearsExperience:z.number().nonnegative(),
  skills:z.array(z.string()),education:z.string(),languages:z.array(z.string()),location:z.string(),locationType,email:z.string().email(),
  phone:z.string(),resumeStatus,matchScore:z.number().min(0).max(100),availability:z.string(),summary:z.string(),strengths:z.array(z.string()),
  weaknesses:z.array(z.string()),experienceTimeline:z.array(timeline),certificates:z.array(z.string()),portfolio:z.string().url().optional(),notes:z.string(),
})
const mapped=(body:z.infer<typeof input>)=>({
  job_id:body.jobId,name:body.name,position_applied:body.positionApplied,years_experience:body.yearsExperience,skills:body.skills,
  education:body.education,languages:body.languages,location:body.location,location_type:body.locationType,email:body.email.toLowerCase(),
  phone:body.phone,resume_status:body.resumeStatus,match_score:body.matchScore,availability:body.availability,summary:body.summary,
  strengths:body.strengths,weaknesses:body.weaknesses,experience_timeline:body.experienceTimeline,certificates:body.certificates,
  portfolio:body.portfolio||null,notes:body.notes,
})
router.use(authenticate)
router.get('/',async(request,response)=>{
  const user=(request as AuthRequest).auth,query=z.object({
    jobId:z.string().uuid().optional(),minMatchScore:z.coerce.number().min(0).max(100).optional(),skills:z.string().optional(),
    locationType:locationType.optional(),status:resumeStatus.optional(),search:z.string().optional(),
    sortBy:z.enum(['matchScore','name','experience']).default('matchScore'),page:z.coerce.number().int().positive().default(1),limit:z.coerce.number().int().min(1).max(100).default(20),
  }).parse(request.query)
  let builder=db.from('candidates').select('*',{count:'exact'}).eq('company_id',user.companyId)
  if(query.jobId)builder=builder.eq('job_id',query.jobId)
  if(query.minMatchScore!==undefined)builder=builder.gte('match_score',query.minMatchScore)
  if(query.skills)builder=builder.contains('skills',query.skills.split(',').map(value=>value.trim()).filter(Boolean))
  if(query.locationType)builder=builder.eq('location_type',query.locationType)
  if(query.status)builder=builder.eq('resume_status',query.status)
  if(query.search){const safe=query.search.replaceAll(',','');builder=builder.or(`name.ilike.%${safe}%,email.ilike.%${safe}%,position_applied.ilike.%${safe}%`)}
  const sortColumn={matchScore:'match_score',name:'name',experience:'years_experience'}[query.sortBy]
  const start=(query.page-1)*query.limit,{data,error,count}=await builder.order(sortColumn,{ascending:query.sortBy==='name'}).range(start,start+query.limit-1);dbError(error)
  const total=count||0
  return response.json({data:(data||[]).map(candidateView),pagination:{page:query.page,limit:query.limit,total,totalPages:Math.ceil(total/query.limit)}})
})
router.delete('/retention/purge',requireRole('ADMIN'),async(request,response)=>{
  const user=(request as AuthRequest).auth,cutoff=new Date(Date.now()-config.CANDIDATE_RETENTION_DAYS*86400000).toISOString()
  const{data,error}=await db.from('candidates').delete().eq('company_id',user.companyId).lt('created_at',cutoff).select('id');dbError(error)
  await audit(user,'candidate.retention_purged','candidate',undefined,{deleted:data?.length||0,cutoff})
  return response.json({deleted:data?.length||0,cutoff})
})
router.get('/:id',async(request,response)=>{
  const user=(request as AuthRequest).auth,{data,error}=await db.from('candidates').select('*').eq('id',request.params.id).eq('company_id',user.companyId).maybeSingle();dbError(error)
  if(!data)throw new HttpError(404,'The requested record was not found.')
  return response.json(candidateView(data))
})
router.post('/',async(request,response)=>{
  const body=input.parse(request.body),user=(request as AuthRequest).auth
  const{data:job}=await db.from('jobs').select('id').eq('id',body.jobId).eq('company_id',user.companyId).maybeSingle()
  if(!job)throw new HttpError(404,'The requested record was not found.')
  const{data,error}=await db.from('candidates').insert({company_id:user.companyId,...mapped(body)}).select().single();dbError(error)
  await Promise.all([audit(user,'candidate.created','candidate',String(data?.id)),notify(user.companyId,'candidate','New candidate',`${body.name} was added to ${body.positionApplied}.`,undefined,String(data?.id),body.jobId)])
  return response.status(201).json(candidateView(data??{}))
})
router.put('/:id',async(request,response)=>{
  const body=input.parse(request.body),user=(request as AuthRequest).auth
  const{data:job}=await db.from('jobs').select('id').eq('id',body.jobId).eq('company_id',user.companyId).maybeSingle()
  if(!job)throw new HttpError(404,'The requested record was not found.')
  const{data,error}=await db.from('candidates').update({...mapped(body),updated_at:new Date().toISOString()}).eq('id',request.params.id).eq('company_id',user.companyId).select().maybeSingle();dbError(error)
  if(!data)throw new HttpError(404,'The requested record was not found.')
  await audit(user,'candidate.updated','candidate',String(data.id));return response.json(candidateView(data))
})
router.patch('/:id/status',async(request,response)=>{
  const{status}=z.object({status:z.enum(['Screened','Shortlisted','Rejected'])}).parse(request.body),user=(request as AuthRequest).auth
  const{data,error}=await db.from('candidates').update({resume_status:status,updated_at:new Date().toISOString()}).eq('id',request.params.id).eq('company_id',user.companyId).select().maybeSingle();dbError(error)
  if(!data)throw new HttpError(404,'The requested record was not found.')
  const notificationType=status==='Shortlisted'?'shortlist':status==='Rejected'?'reject':'application'
  await Promise.all([audit(user,`candidate.${status.toLowerCase()}`,'candidate',String(data.id)),notify(user.companyId,notificationType,`Candidate ${status.toLowerCase()}`,`${data.name} was marked as ${status}.`,undefined,String(data.id),String(data.job_id))])
  return response.json(candidateView(data))
})
router.delete('/:id',requireRole('ADMIN'),async(request,response)=>{
  const user=(request as AuthRequest).auth,{data,error}=await db.from('candidates').delete().eq('id',request.params.id).eq('company_id',user.companyId).select('id').maybeSingle();dbError(error)
  if(!data)throw new HttpError(404,'The requested record was not found.')
  await audit(user,'candidate.deleted','candidate',String(data.id));return response.status(204).send()
})
export default router
