import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db.js'
import { HttpError } from '../errors.js'
import { authenticate } from '../middleware.js'
import { audit, dbError, notify } from '../services.js'
import type { AuthRequest } from '../types.js'

const router=Router()
router.use(authenticate)
const view=(row:Record<string,unknown>)=>{
  const starts=new Date(String(row.starts_at)),candidate=row.candidate as Record<string,unknown>
  return{id:row.id,companyId:row.company_id,candidateId:row.candidate_id,interviewerId:row.interviewer_id??null,interviewer:row.interviewer,
    startsAt:row.starts_at,date:starts.toISOString().slice(0,10),time:starts.toISOString().slice(11,16),type:row.type,
    locationOrLink:row.location_or_link??null,notes:row.notes,createdAt:row.created_at,updatedAt:row.updated_at,
    candidate:{id:candidate?.id,name:candidate?.name,positionApplied:candidate?.position_applied,jobId:candidate?.job_id}}
}
router.get('/',async(request,response)=>{
  const query=z.object({upcoming:z.enum(['true','false']).transform(v=>v==='true').optional(),candidateId:z.string().uuid().optional()}).parse(request.query),user=(request as AuthRequest).auth
  let builder=db.from('interviews').select('*,candidate:candidates(id,name,position_applied,job_id)').eq('company_id',user.companyId)
  if(query.upcoming)builder=builder.gte('starts_at',new Date().toISOString())
  if(query.candidateId)builder=builder.eq('candidate_id',query.candidateId)
  const{data,error}=await builder.order('starts_at');dbError(error)
  return response.json((data||[]).map(view))
})
router.post('/',async(request,response)=>{
  const body=z.object({candidateId:z.string().uuid(),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),time:z.string().regex(/^\d{2}:\d{2}$/),interviewer:z.string().trim().min(1),interviewerId:z.string().uuid().optional(),type:z.enum(['Phone','Video','On-site']),locationOrLink:z.string().max(500).optional(),notes:z.string().max(5000).default('')}).parse(request.body)
  const user=(request as AuthRequest).auth,startsAt=new Date(`${body.date}T${body.time}:00.000Z`)
  if(Number.isNaN(startsAt.getTime()))throw new HttpError(400,'The interview date or time is invalid.')
  const{data:candidate}=await db.from('candidates').select('id,name').eq('id',body.candidateId).eq('company_id',user.companyId).maybeSingle()
  if(!candidate)throw new HttpError(404,'The requested record was not found.')
  if(body.interviewerId){const{data:member}=await db.from('users').select('id').eq('id',body.interviewerId).eq('company_id',user.companyId).maybeSingle();if(!member)throw new HttpError(400,'The selected interviewer is invalid.')}
  const{data,error}=await db.from('interviews').insert({company_id:user.companyId,candidate_id:body.candidateId,interviewer_id:body.interviewerId,interviewer:body.interviewer,starts_at:startsAt.toISOString(),type:body.type,location_or_link:body.locationOrLink||null,notes:body.notes}).select('*,candidate:candidates(id,name,position_applied,job_id)').single();dbError(error)
  await db.from('candidates').update({resume_status:'Interviewing',updated_at:new Date().toISOString()}).eq('id',body.candidateId).eq('company_id',user.companyId)
  await Promise.all([audit(user,'interview.created','interview',String(data?.id),{candidateId:body.candidateId}),notify(user.companyId,'application','Interview scheduled',`${candidate.name} has an interview scheduled.`,undefined,body.candidateId)])
  return response.status(201).json(view(data??{}))
})
router.delete('/:id',async(request,response)=>{
  const user=(request as AuthRequest).auth,{data,error}=await db.from('interviews').delete().eq('id',request.params.id).eq('company_id',user.companyId).select('id').maybeSingle();dbError(error)
  if(!data)throw new HttpError(404,'The requested record was not found.')
  await audit(user,'interview.deleted','interview',String(data.id));return response.status(204).send()
})
export default router
