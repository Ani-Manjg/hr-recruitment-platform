import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db.js'
import { authenticate, requireRole } from '../middleware.js'
import { dbError } from '../services.js'
import type { AuthRequest } from '../types.js'

const router=Router()
router.use(authenticate,requireRole('ADMIN'))
router.get('/',async(request,response)=>{
  const query=z.object({resourceType:z.string().optional(),resourceId:z.string().uuid().optional(),action:z.string().optional(),page:z.coerce.number().int().positive().default(1),limit:z.coerce.number().int().min(1).max(100).default(20)}).parse(request.query),user=(request as AuthRequest).auth
  let builder=db.from('audit_logs').select('*,actor:users(id,name,email)',{count:'exact'}).eq('company_id',user.companyId)
  if(query.resourceType)builder=builder.eq('resource_type',query.resourceType)
  if(query.resourceId)builder=builder.eq('resource_id',query.resourceId)
  if(query.action)builder=builder.eq('action',query.action)
  const start=(query.page-1)*query.limit,{data,error,count}=await builder.order('created_at',{ascending:false}).range(start,start+query.limit-1);dbError(error)
  const total=count||0
  return response.json({data:(data||[]).map(row=>({id:row.id,action:row.action,resourceType:row.resource_type,resourceId:row.resource_id??undefined,metadata:row.metadata,createdAt:row.created_at,actor:row.actor})),pagination:{page:query.page,limit:query.limit,total,totalPages:Math.ceil(total/query.limit)}})
})
export default router
