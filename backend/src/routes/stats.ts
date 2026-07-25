import { Router } from 'express'
import { db } from '../db.js'
import { authenticate } from '../middleware.js'
import { dbError } from '../services.js'
import type { AuthRequest } from '../types.js'

const router=Router()
router.use(authenticate)
router.get('/dashboard',async(request,response)=>{
  const user=(request as AuthRequest).auth,jobId=typeof request.query.jobId==='string'?request.query.jobId:undefined
  let candidates=db.from('candidates').select('resume_status',{count:'exact'}).eq('company_id',user.companyId)
  if(jobId)candidates=candidates.eq('job_id',jobId)
  const[candidateResult,jobResult]=await Promise.all([candidates,db.from('jobs').select('id',{count:'exact',head:true}).eq('company_id',user.companyId).eq('status','Open')])
  dbError(candidateResult.error);dbError(jobResult.error)
  const rows=candidateResult.data||[]
  return response.json({
    totalCandidates:candidateResult.count||0,filteredCandidates:rows.filter(row=>row.resume_status!=='New').length,
    shortlisted:rows.filter(row=>row.resume_status==='Shortlisted').length,rejected:rows.filter(row=>row.resume_status==='Rejected').length,
    openPositions:jobResult.count||0,
  })
})
router.get('/pipeline',async(request,response)=>{
  const user=(request as AuthRequest).auth,start=new Date();start.setUTCMonth(start.getUTCMonth()-11);start.setUTCDate(1);start.setUTCHours(0,0,0,0)
  const{data,error}=await db.from('candidates').select('created_at,resume_status').eq('company_id',user.companyId).gte('created_at',start.toISOString());dbError(error)
  const months=Array.from({length:12},(_,index)=>{const date=new Date(start);date.setUTCMonth(start.getUTCMonth()+index);const key=date.toISOString().slice(0,7);return{key,month:key,screened:0,shortlisted:0}})
  for(const row of data||[]){const point=months.find(value=>value.key===String(row.created_at).slice(0,7));if(point){if(row.resume_status!=='New')point.screened++;if(row.resume_status==='Shortlisted')point.shortlisted++}}
  return response.json(months.map(({key:_key,...point})=>point))
})
export default router
