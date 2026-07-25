import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db.js'
import { HttpError } from '../errors.js'
import { authenticate, requireRole } from '../middleware.js'
import { jobView } from '../serializers.js'
import { audit, dbError } from '../services.js'
import type { AuthRequest } from '../types.js'

const router=Router(),status=z.enum(['Open','Closed','Draft']),locationType=z.enum(['Remote','Hybrid','On-site'])
const input=z.object({title:z.string().trim().min(1),department:z.string().trim().min(1),location:z.string().trim().min(1),locationType,requiredSkills:z.array(z.string()),requiredExperience:z.string(),education:z.string(),languages:z.array(z.string()),status,applicants:z.number().optional(),postedDate:z.string().datetime().optional()})
router.use(authenticate)
router.get('/',async(request,response)=>{
  const user=(request as AuthRequest).auth,query=z.object({status:status.optional(),search:z.string().optional()}).parse(request.query)
  let builder=db.from('jobs').select('*,candidates(count)').eq('company_id',user.companyId)
  if(query.status)builder=builder.eq('status',query.status)
  if(query.search)builder=builder.or(`title.ilike.%${query.search.replaceAll(',','')}%,department.ilike.%${query.search.replaceAll(',','')}%`)
  const{data,error}=await builder.order('posted_date',{ascending:false});dbError(error)
  return response.json((data||[]).map(row=>jobView({...row,applicants:Array.isArray(row.candidates)?row.candidates[0]?.count:0})))
})
router.get('/:id',async(request,response)=>{
  const user=(request as AuthRequest).auth,{data,error}=await db.from('jobs').select('*,candidates(count)').eq('id',request.params.id).eq('company_id',user.companyId).maybeSingle();dbError(error)
  if(!data)throw new HttpError(404,'The requested record was not found.')
  return response.json(jobView({...data,applicants:Array.isArray(data.candidates)?data.candidates[0]?.count:0}))
})
router.post('/',async(request,response)=>{
  const body=input.parse(request.body),user=(request as AuthRequest).auth
  const{data,error}=await db.from('jobs').insert({company_id:user.companyId,title:body.title,department:body.department,location:body.location,location_type:body.locationType,required_skills:body.requiredSkills,required_experience:body.requiredExperience,education:body.education,languages:body.languages,status:body.status,posted_date:body.postedDate}).select().single();dbError(error)
  await audit(user,'job.created','job',String(data?.id));return response.status(201).json(jobView({...data,applicants:0}))
})
router.put('/:id',async(request,response)=>{
  const body=input.partial().parse(request.body),user=(request as AuthRequest).auth
  const mapped={title:body.title,department:body.department,location:body.location,location_type:body.locationType,required_skills:body.requiredSkills,required_experience:body.requiredExperience,education:body.education,languages:body.languages,status:body.status,posted_date:body.postedDate,updated_at:new Date().toISOString()}
  const{data,error}=await db.from('jobs').update(mapped).eq('id',request.params.id).eq('company_id',user.companyId).select().maybeSingle();dbError(error)
  if(!data)throw new HttpError(404,'The requested record was not found.')
  await audit(user,'job.updated','job',String(data.id));return response.json(jobView(data))
})
router.delete('/:id',requireRole('ADMIN'),async(request,response)=>{
  const user=(request as AuthRequest).auth,{data,error}=await db.from('jobs').delete().eq('id',request.params.id).eq('company_id',user.companyId).select('id').maybeSingle();dbError(error)
  if(!data)throw new HttpError(404,'The requested record was not found.')
  await audit(user,'job.deleted','job',String(data.id));return response.status(204).send()
})
export default router
