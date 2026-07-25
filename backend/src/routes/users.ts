import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db.js'
import { authenticate } from '../middleware.js'
import { companyView, userView } from '../serializers.js'
import { dbError } from '../services.js'
import type { AuthRequest } from '../types.js'

const router=Router()
router.use(authenticate)

async function current(id:string){
  const{data:user,error}=await db.from('users').select('*').eq('id',id).single();dbError(error)
  const{data:company,error:companyError}=await db.from('companies').select('name').eq('id',user?.company_id).single();dbError(companyError)
  return userView(user??{},String(company?.name||''))
}
router.get('/me',async(request,response)=>response.json(await current((request as AuthRequest).auth.id)))
router.put('/me',async(request,response)=>{
  const body=z.object({
    name:z.string().trim().min(1).max(120).optional(),email:z.string().email().transform(value=>value.trim().toLowerCase()).optional(),
    jobTitle:z.string().trim().max(150).nullable().optional(),phone:z.string().trim().max(40).nullable().optional(),
    avatarUrl:z.string().url().nullable().optional(),
  }).refine(value=>Object.keys(value).length>0).parse(request.body)
  const mapped={name:body.name,email:body.email,job_title:body.jobTitle,phone:body.phone,avatar_url:body.avatarUrl}
  dbError((await db.from('users').update(mapped).eq('id',(request as AuthRequest).auth.id)).error)
  return response.json(await current((request as AuthRequest).auth.id))
})
router.get('/me/notification-preferences',async(request,response)=>{
  const userId=(request as AuthRequest).auth.id
  let{data}=await db.from('notification_preferences').select('*').eq('user_id',userId).maybeSingle()
  if(!data){
    const result=await db.from('notification_preferences').insert({user_id:userId}).select().single();dbError(result.error);data=result.data
  }
  return response.json({newCandidate:data?.new_candidate,application:data?.application,weeklyDigest:data?.weekly_digest,productUpdate:data?.product_update})
})
router.put('/me/notification-preferences',async(request,response)=>{
  const body=z.object({newCandidate:z.boolean(),application:z.boolean(),weeklyDigest:z.boolean(),productUpdate:z.boolean()}).parse(request.body)
  const{data,error}=await db.from('notification_preferences').upsert({
    user_id:(request as AuthRequest).auth.id,new_candidate:body.newCandidate,application:body.application,
    weekly_digest:body.weeklyDigest,product_update:body.productUpdate,updated_at:new Date().toISOString(),
  }).select().single();dbError(error)
  return response.json({newCandidate:data?.new_candidate,application:data?.application,weeklyDigest:data?.weekly_digest,productUpdate:data?.product_update})
})
export default router
