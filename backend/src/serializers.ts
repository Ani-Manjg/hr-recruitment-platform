export const userView=(row:Record<string,unknown>,companyName?:string)=>({
  id:row.id,email:row.email,name:row.name,jobTitle:row.job_title??null,phone:row.phone??null,
  avatarUrl:row.avatar_url??null,role:row.role,companyId:row.company_id,
  companyName:companyName??row.company_name??'',createdAt:row.created_at,
})
export const companyView=(row:Record<string,unknown>)=>({
  id:row.id,name:row.name,website:row.website??null,location:row.location??null,size:row.size??null,createdAt:row.created_at,
})
export const jobView=(row:Record<string,unknown>)=>({
  id:row.id,title:row.title,department:row.department,location:row.location,locationType:row.location_type,
  requiredSkills:row.required_skills,requiredExperience:row.required_experience,education:row.education,
  languages:row.languages,status:row.status,applicants:row.applicants??0,postedDate:row.posted_date,
})
export const candidateView=(row:Record<string,unknown>)=>({
  id:row.id,name:row.name,positionApplied:row.position_applied,jobId:row.job_id,yearsExperience:Number(row.years_experience),
  skills:row.skills,education:row.education,languages:row.languages,location:row.location,locationType:row.location_type,
  email:row.email,phone:row.phone,resumeStatus:row.resume_status,matchScore:Number(row.match_score),
  availability:row.availability,summary:row.summary,strengths:row.strengths,weaknesses:row.weaknesses,
  experienceTimeline:row.experience_timeline,certificates:row.certificates,portfolio:row.portfolio??undefined,notes:row.notes,
})
export const notificationView=(row:Record<string,unknown>)=>({
  id:row.id,type:row.type,title:row.title,detail:row.detail,read:row.read,time:row.created_at,
  candidateId:row.candidate_id??null,jobId:row.job_id??null,
})
