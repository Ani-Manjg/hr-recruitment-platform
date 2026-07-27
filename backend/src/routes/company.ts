import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db.js'
import { authenticate } from '../middleware.js'
import { companyView } from '../serializers.js'
import { audit, dbError } from '../services.js'
import type { AuthRequest } from '../types.js'

const router=Router()
router.use(authenticate)
router.get('/',async(request,response)=>{
  const{data,error}=await db.from('companies').select('*').eq('id',(request as AuthRequest).auth.companyId).single();dbError(error)
  return response.json(companyView(data??{}))
})
router.put('/',async(request,response)=>{
  const body=z.object({name:z.string().trim().min(1).max(150).optional(),website:z.string().url().nullable().optional(),location:z.string().trim().max(150).nullable().optional(),size:z.string().trim().max(50).nullable().optional()}).refine(value=>Object.keys(value).length>0).parse(request.body)
  const user=(request as AuthRequest).auth
  const{data,error}=await db.from('companies').update(body).eq('id',user.companyId).select().single();dbError(error)
  await audit(user,'company.updated','company',user.companyId)
  return response.json(companyView(data??{}))
})
export default router
