import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db.js'
import { HttpError } from '../errors.js'
import { authenticate } from '../middleware.js'
import { notificationView } from '../serializers.js'
import { dbError } from '../services.js'
import type { AuthRequest } from '../types.js'

const router=Router()
router.use(authenticate)
router.get('/',async(request,response)=>{
  const query=z.object({unread:z.enum(['true','false']).transform(v=>v==='true').optional(),type:z.string().optional()}).parse(request.query)
  const user=(request as AuthRequest).auth
  let builder=db.from('notifications').select('*').eq('company_id',user.companyId).or(`user_id.is.null,user_id.eq.${user.id}`)
  if(query.unread!==undefined)builder=builder.eq('read',!query.unread?true:false)
  if(query.type)builder=builder.eq('type',query.type)
  const{data,error}=await builder.order('created_at',{ascending:false}).limit(100);dbError(error)
  return response.json((data||[]).map(notificationView))
})
router.patch('/read-all',async(request,response)=>{
  const user=(request as AuthRequest).auth,{data,error}=await db.from('notifications').update({read:true}).eq('company_id',user.companyId).or(`user_id.is.null,user_id.eq.${user.id}`).eq('read',false).select('id');dbError(error)
  return response.json({updated:data?.length||0})
})
router.patch('/:id/read',async(request,response)=>{
  const user=(request as AuthRequest).auth,{data,error}=await db.from('notifications').update({read:true}).eq('id',request.params.id).eq('company_id',user.companyId).or(`user_id.is.null,user_id.eq.${user.id}`).select().maybeSingle();dbError(error)
  if(!data)throw new HttpError(404,'The requested record was not found.')
  return response.json(notificationView(data))
})
export default router
