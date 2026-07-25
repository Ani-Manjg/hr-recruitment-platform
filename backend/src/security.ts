import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from './config.js'
import type { AuthUser } from './types.js'

export const passwordHash=(password:string)=>bcrypt.hash(password,12)
export const passwordMatches=(password:string,hash:string)=>bcrypt.compare(password,hash)
export const opaqueToken=()=>randomBytes(32).toString('base64url')
export const hashToken=(value:string,secret=config.TOKEN_HASH_SECRET)=>createHmac('sha256',secret).update(value).digest('hex')
export function safeEqual(left:string,right:string){
  const a=Buffer.from(left),b=Buffer.from(right)
  return a.length===b.length&&timingSafeEqual(a,b)
}
export const accessToken=(user:AuthUser)=>jwt.sign(
  {companyId:user.companyId,role:user.role,email:user.email,name:user.name},
  config.JWT_ACCESS_SECRET,{subject:user.id,expiresIn:'15m',issuer:'talentflow-api',audience:'talentflow-web'},
)
export function verifyAccess(token:string):AuthUser{
  const payload=jwt.verify(token,config.JWT_ACCESS_SECRET,{issuer:'talentflow-api',audience:'talentflow-web'})
  if(typeof payload==='string'||!payload.sub||typeof payload.companyId!=='string'||(payload.role!=='ADMIN'&&payload.role!=='RECRUITER'))throw new Error('Invalid token.')
  return{id:payload.sub,companyId:payload.companyId,role:payload.role,email:String(payload.email||''),name:String(payload.name||'')}
}
