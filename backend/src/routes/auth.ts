import { Router, type Response } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { config } from '../config.js'
import { db } from '../db.js'
import { HttpError } from '../errors.js'
import { authenticate, requireRole } from '../middleware.js'
import { accessToken, hashToken, opaqueToken, passwordHash, passwordMatches, safeEqual } from '../security.js'
import { dbError } from '../services.js'
import { userView } from '../serializers.js'
import type { AuthRequest, AuthUser, Role } from '../types.js'

const router=Router()
const authLimiter=rateLimit({windowMs:15*60_000,limit:30,standardHeaders:'draft-8',legacyHeaders:false})
const strongPassword=z.string().min(12).max(128).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/)
const email=z.string().email().transform(value=>value.trim().toLowerCase())
const refreshCookie='talentflow_refresh'
const cookieOptions={httpOnly:true,secure:config.COOKIE_SECURE,sameSite:config.COOKIE_SAME_SITE,path:'/api/auth',maxAge:30*24*60*60*1000} as const

async function completeUser(row:Record<string,unknown>){
  const{data:company,error}=await db.from('companies').select('name').eq('id',String(row.company_id)).single()
  dbError(error)
  return userView(row,String(company?.name||''))
}
async function createSession(user:AuthUser,response:Response){
  const refresh=opaqueToken(),csrf=opaqueToken()
  const{error}=await db.from('refresh_sessions').insert({
    user_id:user.id,token_hash:hashToken(refresh,config.JWT_REFRESH_SECRET),
    csrf_hash:hashToken(csrf,config.JWT_REFRESH_SECRET),expires_at:new Date(Date.now()+30*24*60*60*1000).toISOString(),
  })
  dbError(error)
  response.cookie(refreshCookie,refresh,cookieOptions)
  return{user:await getUser(user.id),accessToken:accessToken(user),csrfToken:csrf,expiresIn:'15m'}
}
async function getUser(id:string){
  const{data,error}=await db.from('users').select('*').eq('id',id).single()
  dbError(error)
  if(!data)throw new HttpError(404,'The requested record was not found.')
  return completeUser(data)
}

router.post('/register',authLimiter,async(request,response)=>{
  const body=z.object({email,password:strongPassword,name:z.string().trim().min(1).max(120),companyName:z.string().trim().min(1).max(150).optional(),invitationToken:z.string().min(20).optional()}).parse(request.body)
  let companyId:string,role:Role='RECRUITER',invitationId:string|undefined
  if(body.invitationToken){
    const{data,error}=await db.from('invitations').select('*').eq('token_hash',hashToken(body.invitationToken)).is('used_at',null).gt('expires_at',new Date().toISOString()).single()
    if(error||!data||String(data.email)!==body.email)throw new HttpError(400,'This invitation is invalid or expired.')
    companyId=String(data.company_id);role=data.role as Role;invitationId=String(data.id)
  }else{
    if(!body.companyName)throw new HttpError(400,'Company name is required.')
    const{data,error}=await db.from('companies').insert({name:body.companyName}).select().single()
    dbError(error);companyId=String(data?.id)
  }
  const{data:user,error}=await db.from('users').insert({company_id:companyId,email:body.email,name:body.name,password_hash:await passwordHash(body.password),role}).select().single()
  if(error){
    if(!body.invitationToken)await db.from('companies').delete().eq('id',companyId)
    dbError(error)
  }
  if(invitationId)await db.from('invitations').update({used_at:new Date().toISOString()}).eq('id',invitationId)
  const authUser:AuthUser={id:String(user?.id),companyId,email:body.email,name:body.name,role}
  return response.status(201).json(await createSession(authUser,response))
})

router.post('/login',authLimiter,async(request,response)=>{
  const body=z.object({email,password:z.string().min(1).max(128)}).parse(request.body)
  const{data:user}=await db.from('users').select('*').eq('email',body.email).maybeSingle()
  if(!user||!await passwordMatches(body.password,String(user.password_hash)))throw new HttpError(401,'Invalid email or password')
  const authUser:AuthUser={id:String(user.id),companyId:String(user.company_id),email:String(user.email),name:String(user.name),role:user.role as Role}
  return response.json(await createSession(authUser,response))
})

router.post('/refresh',authLimiter,async(request,response)=>{
  const refresh=String(request.cookies[refreshCookie]||''),csrf=String(request.headers['x-csrf-token']||'')
  if(!refresh||!csrf)throw new HttpError(401,'A valid refresh session is required.')
  const tokenHash=hashToken(refresh,config.JWT_REFRESH_SECRET)
  const{data:session}=await db.from('refresh_sessions').select('*').eq('token_hash',tokenHash).maybeSingle()
  if(!session||session.revoked_at||new Date(String(session.expires_at))<=new Date()||!safeEqual(String(session.csrf_hash),hashToken(csrf,config.JWT_REFRESH_SECRET))){
    response.clearCookie(refreshCookie,{...cookieOptions,maxAge:undefined})
    throw new HttpError(401,'A valid refresh session is required.')
  }
  const{data:user,error}=await db.from('users').select('*').eq('id',session.user_id).single();dbError(error)
  const{data:claimed,error:claimError}=await db.from('refresh_sessions').update({revoked_at:new Date().toISOString()}).eq('id',session.id).is('revoked_at',null).select('id').maybeSingle()
  dbError(claimError)
  if(!claimed)throw new HttpError(401,'This refresh token has already been used.')
  const nextRefresh=opaqueToken(),nextCsrf=opaqueToken()
  const{data:replacement,error:insertError}=await db.from('refresh_sessions').insert({
    user_id:user?.id,token_hash:hashToken(nextRefresh,config.JWT_REFRESH_SECRET),csrf_hash:hashToken(nextCsrf,config.JWT_REFRESH_SECRET),
    expires_at:new Date(Date.now()+30*24*60*60*1000).toISOString(),
  }).select('id').single();dbError(insertError)
  await db.from('refresh_sessions').update({replaced_by:replacement?.id}).eq('id',session.id)
  response.cookie(refreshCookie,nextRefresh,cookieOptions)
  const authUser:AuthUser={id:String(user?.id),companyId:String(user?.company_id),email:String(user?.email),name:String(user?.name),role:user?.role as Role}
  return response.json({accessToken:accessToken(authUser),csrfToken:nextCsrf,expiresIn:'15m'})
})

router.post('/logout',async(request,response)=>{
  const refresh=String(request.cookies[refreshCookie]||''),csrf=String(request.headers['x-csrf-token']||'')
  if(refresh&&csrf){
    const{data:session}=await db.from('refresh_sessions').select('id,csrf_hash').eq('token_hash',hashToken(refresh,config.JWT_REFRESH_SECRET)).maybeSingle()
    if(session&&safeEqual(String(session.csrf_hash),hashToken(csrf,config.JWT_REFRESH_SECRET)))await db.from('refresh_sessions').update({revoked_at:new Date().toISOString()}).eq('id',session.id)
  }
  response.clearCookie(refreshCookie,{...cookieOptions,maxAge:undefined})
  return response.status(204).send()
})

router.get('/me',authenticate,async(request,response)=>response.json(await getUser((request as AuthRequest).auth.id)))

router.post('/invitations',authenticate,requireRole('ADMIN'),async(request,response)=>{
  const body=z.object({email,role:z.enum(['ADMIN','RECRUITER'])}).parse(request.body),user=(request as AuthRequest).auth,token=opaqueToken()
  const{error}=await db.from('invitations').insert({company_id:user.companyId,email:body.email,role:body.role,token_hash:hashToken(token),invited_by:user.id,expires_at:new Date(Date.now()+72*60*60*1000).toISOString()})
  dbError(error);return response.status(201).json({invitationToken:token,expiresInHours:72})
})

router.put('/change-password',authenticate,async(request,response)=>{
  const body=z.object({currentPassword:z.string().min(1),newPassword:strongPassword}).parse(request.body),user=(request as AuthRequest).auth
  const{data}=await db.from('users').select('password_hash').eq('id',user.id).single()
  if(!data||!await passwordMatches(body.currentPassword,String(data.password_hash)))throw new HttpError(400,'The current password is incorrect.')
  dbError((await db.from('users').update({password_hash:await passwordHash(body.newPassword)}).eq('id',user.id)).error)
  await db.from('refresh_sessions').update({revoked_at:new Date().toISOString()}).eq('user_id',user.id).is('revoked_at',null)
  response.clearCookie(refreshCookie,{...cookieOptions,maxAge:undefined});return response.status(204).send()
})

router.post('/forgot-password',authLimiter,async(request,response)=>{
  const body=z.object({email}).parse(request.body),message='If an account exists for that email, password reset instructions have been created.'
  const{data:user}=await db.from('users').select('id').eq('email',body.email).maybeSingle()
  if(!user)return response.json({message})
  const token=opaqueToken()
  await db.from('password_resets').insert({user_id:user.id,token_hash:hashToken(token),expires_at:new Date(Date.now()+60*60*1000).toISOString()})
  return response.json(config.NODE_ENV==='development'?{message,developmentResetToken:token}:{message})
})

router.post('/reset-password',authLimiter,async(request,response)=>{
  const body=z.object({token:z.string().min(20),newPassword:strongPassword}).parse(request.body)
  const{data:reset}=await db.from('password_resets').select('*').eq('token_hash',hashToken(body.token)).is('used_at',null).gt('expires_at',new Date().toISOString()).maybeSingle()
  if(!reset)throw new HttpError(400,'This password-reset token is invalid or expired.')
  dbError((await db.from('users').update({password_hash:await passwordHash(body.newPassword)}).eq('id',reset.user_id)).error)
  await db.from('password_resets').update({used_at:new Date().toISOString()}).eq('id',reset.id)
  await db.from('refresh_sessions').update({revoked_at:new Date().toISOString()}).eq('user_id',reset.user_id).is('revoked_at',null)
  return response.status(204).send()
})

export default router
