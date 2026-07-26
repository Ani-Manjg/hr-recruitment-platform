import type {
  AuthResponse, Candidate, CandidateInput, CandidateQuery, Company, DashboardStats, Interview,
  InterviewInput, InvitationResponse, Job, JobInput, NotificationItem, NotificationPreferences,
  PaginatedAudit, PaginatedCandidates, PipelinePoint, RefreshResponse, ResumeAnalysis,
  ResumeStatus, User, UserRole,
} from '../types'

export const CSRF_STORAGE_KEY='talentflow-csrf-token'
const apiBaseUrl=(import.meta.env.VITE_API_URL||'http://localhost:3000').replace(/\/+$/,'')
type QueryValue=string|number|boolean|undefined
type RequestOptions=Omit<RequestInit,'body'|'credentials'>&{body?:unknown;authenticated?:boolean;retryAfterRefresh?:boolean}
type ApiErrorBody={error?:string;details?:unknown}
type SessionListener=(session:{accessToken:string;csrfToken:string}|null)=>void

let accessToken:string|null=null
let csrfToken:string|null=null
let refreshPromise:Promise<RefreshResponse>|null=null
const sessionListeners=new Set<SessionListener>()

export class ApiError extends Error{
  constructor(message:string,public status:number,public details?:unknown){super(message);this.name='ApiError'}
}

export function setApiSession(nextAccessToken:string,nextCsrfToken:string){
  accessToken=nextAccessToken;csrfToken=nextCsrfToken
  sessionStorage.setItem(CSRF_STORAGE_KEY,nextCsrfToken)
  sessionListeners.forEach(listener=>listener({accessToken:nextAccessToken,csrfToken:nextCsrfToken}))
}
export function seedCsrfToken(value:string|null){csrfToken=value}
export function clearApiSession(){
  accessToken=null;csrfToken=null;sessionStorage.removeItem(CSRF_STORAGE_KEY)
  sessionListeners.forEach(listener=>listener(null))
}
export function subscribeApiSession(listener:SessionListener){sessionListeners.add(listener);return()=>{sessionListeners.delete(listener)}}

function queryString(values:Record<string,QueryValue>){
  const params=new URLSearchParams()
  Object.entries(values).forEach(([key,value])=>{if(value!==undefined&&value!=='')params.set(key,String(value))})
  return params.size?`?${params.toString()}`:''
}

async function parseResponse<T>(response:Response):Promise<T>{
  if(response.status===204)return undefined as T
  const contentType=response.headers.get('content-type')||''
  if(!contentType.includes('application/json'))return undefined as T
  return response.json() as Promise<T>
}

async function backendError(response:Response):Promise<never>{
  let body:ApiErrorBody={}
  try{body=await response.json() as ApiErrorBody}catch{body={}}
  throw new ApiError(body.error||statusMessage(response.status),response.status,body.details)
}

function statusMessage(status:number){
  if(status===400)return'Please check the submitted information.'
  if(status===401)return'Your session has expired. Please sign in again.'
  if(status===403)return'You do not have permission to perform this action.'
  if(status===404)return'The requested record was not found.'
  if(status===409)return'That value is already in use or conflicts with an existing record.'
  if(status===413)return'The uploaded document is too large.'
  if(status===422)return'This résumé could not be read. Convert legacy DOC files to PDF or DOCX.'
  if(status===429)return'Too many requests. Please wait before trying again.'
  if(status===502)return'The AI service returned an invalid response. Please try again later.'
  if(status===503)return'The AI analysis service is temporarily unavailable.'
  return`Request failed with status ${status}.`
}

async function performRefresh():Promise<RefreshResponse>{
  if(!csrfToken)throw new ApiError('No restorable session is available.',401)
  const response=await fetch(`${apiBaseUrl}/api/auth/refresh`,{method:'POST',credentials:'include',headers:{'X-CSRF-Token':csrfToken}})
  if(!response.ok){clearApiSession();return backendError(response)}
  const result=await parseResponse<RefreshResponse>(response)
  setApiSession(result.accessToken,result.csrfToken)
  return result
}

export function refreshSessionRequest(){
  if(!refreshPromise)refreshPromise=performRefresh().finally(()=>{refreshPromise=null})
  return refreshPromise
}

async function request<T>(path:string,options:RequestOptions={}):Promise<T>{
  const headers=new Headers(options.headers)
  const isFormData=options.body instanceof FormData
  if(options.body!==undefined&&!isFormData)headers.set('Content-Type','application/json')
  if(options.authenticated&&accessToken)headers.set('Authorization',`Bearer ${accessToken}`)
  let requestBody:BodyInit|undefined
  if(options.body instanceof FormData)requestBody=options.body
  else if(options.body!==undefined)requestBody=JSON.stringify(options.body)
  const response=await fetch(`${apiBaseUrl}${path}`,{...options,credentials:'include',headers,body:requestBody})
  if(response.status===401&&options.authenticated&&options.retryAfterRefresh!==false){
    try{
      await refreshSessionRequest()
      return request<T>(path,{...options,retryAfterRefresh:false})
    }catch{
      clearApiSession()
      window.dispatchEvent(new Event('talentflow:unauthorized'))
      throw new ApiError('Your session has expired. Please sign in again.',401)
    }
  }
  if(!response.ok)return backendError(response)
  return parseResponse<T>(response)
}

export const api={
  health:()=>request<unknown>('/health'),
  auth:{
    login:(body:{email:string;password:string})=>request<AuthResponse>('/api/auth/login',{method:'POST',body}),
    register:(body:{email:string;password:string;name:string;companyName?:string;invitationToken?:string})=>request<AuthResponse>('/api/auth/register',{method:'POST',body}),
    me:()=>request<User>('/api/auth/me',{authenticated:true}),
    refresh:refreshSessionRequest,
    logout:async()=>{const response=await fetch(`${apiBaseUrl}/api/auth/logout`,{method:'POST',credentials:'include',headers:csrfToken?{'X-CSRF-Token':csrfToken}:{}});if(!response.ok&&response.status!==401)return backendError(response)},
    invite:(body:{email:string;role:UserRole})=>request<InvitationResponse>('/api/auth/invitations',{method:'POST',body,authenticated:true}),
    changePassword:(body:{currentPassword:string;newPassword:string})=>request<void>('/api/auth/change-password',{method:'PUT',body,authenticated:true}),
    forgotPassword:(email:string)=>request<{message:string;developmentResetToken?:string}>('/api/auth/forgot-password',{method:'POST',body:{email}}),
    resetPassword:(body:{token:string;newPassword:string})=>request<void>('/api/auth/reset-password',{method:'POST',body}),
  },
  users:{
    me:()=>request<User>('/api/users/me',{authenticated:true}),
    updateMe:(body:{name?:string;email?:string;jobTitle?:string|null;phone?:string|null;avatarUrl?:string|null})=>request<User>('/api/users/me',{method:'PUT',body,authenticated:true}),
    preferences:()=>request<NotificationPreferences>('/api/users/me/notification-preferences',{authenticated:true}),
    updatePreferences:(body:NotificationPreferences)=>request<NotificationPreferences>('/api/users/me/notification-preferences',{method:'PUT',body,authenticated:true}),
  },
  company:{
    get:()=>request<Company>('/api/company',{authenticated:true}),
    update:(body:{name?:string;website?:string|null;location?:string|null;size?:string|null})=>request<Company>('/api/company',{method:'PUT',body,authenticated:true}),
  },
  jobs:{
    list:(filters:{status?:string;search?:string}={})=>request<Job[]>(`/api/jobs${queryString(filters)}`,{authenticated:true}),
    get:(id:string)=>request<Job>(`/api/jobs/${encodeURIComponent(id)}`,{authenticated:true}),
    create:(body:JobInput)=>request<Job>('/api/jobs',{method:'POST',body,authenticated:true}),
    update:(id:string,body:JobInput)=>request<Job>(`/api/jobs/${encodeURIComponent(id)}`,{method:'PUT',body,authenticated:true}),
    remove:(id:string)=>request<void>(`/api/jobs/${encodeURIComponent(id)}`,{method:'DELETE',authenticated:true}),
  },
  candidates:{
    list:(filters:CandidateQuery={})=>request<PaginatedCandidates>(`/api/candidates${queryString(filters)}`,{authenticated:true}),
    get:(id:string)=>request<Candidate>(`/api/candidates/${encodeURIComponent(id)}`,{authenticated:true}),
    create:(body:CandidateInput)=>request<Candidate>('/api/candidates',{method:'POST',body,authenticated:true}),
    update:(id:string,body:CandidateInput)=>request<Candidate>(`/api/candidates/${encodeURIComponent(id)}`,{method:'PUT',body,authenticated:true}),
    updateStatus:(id:string,status:Extract<ResumeStatus,'Screened'|'Shortlisted'|'Rejected'>)=>request<Candidate>(`/api/candidates/${encodeURIComponent(id)}/status`,{method:'PATCH',body:{status},authenticated:true}),
    remove:(id:string)=>request<void>(`/api/candidates/${encodeURIComponent(id)}`,{method:'DELETE',authenticated:true}),
    purgeRetention:()=>request<{deleted:number;cutoff:string}>('/api/candidates/retention/purge',{method:'DELETE',authenticated:true}),
  },
  ai:{
    analyzeResume:(file:File,jobId:string)=>{const body=new FormData();body.append('file',file);body.append('jobId',jobId);return request<ResumeAnalysis>('/api/ai/analyze-resume',{method:'POST',body,authenticated:true})},
    saveCandidate:(body:{jobId:string;name:string;email:string;phone:string;analysis:ResumeAnalysis;education:string;languages:string[];location:string;locationType:'Remote'|'Hybrid'|'On-site';availability:string;experienceTimeline:[];certificates:[];portfolio?:string;notes:string})=>request<Candidate>('/api/ai/save-analyzed-candidate',{method:'POST',body,authenticated:true}),
  },
  notifications:{
    list:(filters:{unread?:boolean;type?:string}={})=>request<NotificationItem[]>(`/api/notifications${queryString(filters)}`,{authenticated:true}),
    markRead:(id:string)=>request<NotificationItem>(`/api/notifications/${encodeURIComponent(id)}/read`,{method:'PATCH',authenticated:true}),
    markAllRead:()=>request<void>('/api/notifications/read-all',{method:'PATCH',authenticated:true}),
  },
  stats:{
    dashboard:(jobId?:string)=>request<DashboardStats>(`/api/stats/dashboard${queryString({jobId})}`,{authenticated:true}),
    pipeline:()=>request<PipelinePoint[]>('/api/stats/pipeline',{authenticated:true}),
  },
  interviews:{
    list:(filters:{upcoming?:boolean;candidateId?:string}={})=>request<Interview[]>(`/api/interviews${queryString(filters)}`,{authenticated:true}),
    create:(body:InterviewInput)=>request<Interview>('/api/interviews',{method:'POST',body,authenticated:true}),
    remove:(id:string)=>request<void>(`/api/interviews/${encodeURIComponent(id)}`,{method:'DELETE',authenticated:true}),
  },
  audit:{
    list:(filters:{resourceType?:string;resourceId?:string;action?:string;page?:number;limit?:number}={})=>request<PaginatedAudit>(`/api/audit${queryString(filters)}`,{authenticated:true}),
  },
}

export const apiErrorMessage=(error:unknown)=>error instanceof ApiError?statusMessage(error.status):error instanceof Error?error.message:'Something went wrong. Please try again.'
