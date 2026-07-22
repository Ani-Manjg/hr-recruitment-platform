import type { LucideIcon } from 'lucide-react'

export type PipelinePoint = { month:string; screened:number; shortlisted:number }
export type Stat = { label:string; value:string; change:string; trend:'up'|'down'; icon:LucideIcon; tone:'blue'|'purple'|'slate' }
export type Candidate = { id:number; name:string; role:string; location:string; experience:string; score:number; skills:string[]; status:'active'|'shortlisted'|'archived' }
export type JobStatus = 'Open' | 'Closed' | 'Draft'
export type Job = { id:number; title:string; department:string; location:string; employmentType:string; description:string; status:JobStatus; applicants:number }
export type NotificationType = 'Candidates' | 'Applications' | 'Shortlisted' | 'Rejected'
export type Notification = { id:number; type:NotificationType; title:string; message:string; createdAt:string; read:boolean }
