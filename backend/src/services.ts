import { db } from './db.js'
import { HttpError } from './errors.js'
import type { AuthUser } from './types.js'

export async function audit(user:AuthUser,action:string,resourceType:string,resourceId?:string,metadata?:unknown){
  const{error}=await db.from('audit_logs').insert({company_id:user.companyId,actor_id:user.id,action,resource_type:resourceType,resource_id:resourceId,metadata})
  if(error)console.error('Audit write failed:',error.message)
}
export async function notify(companyId:string,type:'candidate'|'application'|'shortlist'|'reject',title:string,detail:string,userId?:string,candidateId?:string,jobId?:string){
  const{error}=await db.from('notifications').insert({company_id:companyId,user_id:userId??null,candidate_id:candidateId??null,job_id:jobId??null,type,title,detail})
  if(error)console.error('Notification write failed:',error.message)
}
export function dbError(error:{message:string;code?:string}|null){
  if(!error)return
  if(error.code==='23505')throw new HttpError(409,'That value is already in use.')
  if(error.code==='23503')throw new HttpError(400,'A referenced record does not exist.')
  throw new Error(error.message)
}
