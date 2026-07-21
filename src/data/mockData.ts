import { FileText, UserCheck, UserMinus, Users } from 'lucide-react'
import type { Candidate, Job, Notification, PipelinePoint, Stat } from '../types'

export const pipelineHistory: PipelinePoint[] = [
  { month:'Jul', screened:38, shortlisted:21 }, { month:'Aug', screened:44, shortlisted:27 },
  { month:'Sep', screened:41, shortlisted:24 }, { month:'Oct', screened:56, shortlisted:33 },
  { month:'Nov', screened:51, shortlisted:31 }, { month:'Dec', screened:62, shortlisted:39 },
  { month:'Jan', screened:45, shortlisted:30 }, { month:'Feb', screened:52, shortlisted:35 },
  { month:'Mar', screened:49, shortlisted:32 }, { month:'Apr', screened:70, shortlisted:45 },
  { month:'May', screened:65, shortlisted:40 }, { month:'Jun', screened:85, shortlisted:55 },
]
export const dashboardStats: Stat[] = [
  {label:'Total Candidates',value:'300',change:'+12%',trend:'up',icon:Users,tone:'blue'},
  {label:'Screened',value:'200',change:'+8%',trend:'up',icon:FileText,tone:'purple'},
  {label:'Shortlisted',value:'100',change:'+5%',trend:'up',icon:UserCheck,tone:'blue'},
  {label:'Rejected',value:'45',change:'-2%',trend:'down',icon:UserMinus,tone:'slate'},
]
export const matchCriteria = [{label:'Technical Skills',value:88},{label:'Experience',value:92},{label:'Culture Fit',value:75},{label:'Soft Skills',value:82},{label:'Education',value:95}]
export const candidates: Candidate[] = [
  {id:1,name:'Sarah Jenkins',role:'Senior Frontend Engineer',location:'New York, NY',experience:'7 years',score:94,skills:['React','TypeScript','Node.js'],status:'shortlisted'},
  {id:2,name:'Marcus Chen',role:'Full Stack Developer',location:'Remote',experience:'5 years',score:88,skills:['Python','React','PostgreSQL'],status:'active'},
  {id:3,name:'Elena Rodriguez',role:'DevOps Engineer',location:'San Francisco, CA',experience:'8 years',score:91,skills:['AWS','Kubernetes','Python'],status:'active'},
  {id:4,name:'David Wilson',role:'UI/UX Designer',location:'Austin, TX',experience:'4 years',score:82,skills:['Figma','React','Storybook'],status:'archived'},
  {id:5,name:'Priya Sharma',role:'Backend Architect',location:'London, UK',experience:'12 years',score:96,skills:['Go','Rust','Java'],status:'shortlisted'},
  {id:6,name:"James O'Connell",role:'Data Scientist',location:'Remote',experience:'6 years',score:85,skills:['Python','PyTorch','SQL'],status:'active'},
]
export const jobs: Job[] = [
  { id:1, title:'Senior Frontend Engineer', department:'Engineering', location:'New York, NY', employmentType:'Full-time', description:'Lead the development of polished, accessible recruiting experiences.', status:'Open', applicants:42 },
  { id:2, title:'Product Designer', department:'Design', location:'Remote', employmentType:'Full-time', description:'Shape intuitive candidate and recruiter workflows across TalentFlow HR.', status:'Open', applicants:28 },
  { id:3, title:'People Operations Specialist', department:'Human Resources', location:'Austin, TX', employmentType:'Contract', description:'Support a thoughtful, high-touch employee experience.', status:'Draft', applicants:0 },
  { id:4, title:'Data Analyst', department:'Analytics', location:'Remote', employmentType:'Full-time', description:'Turn recruiting data into clear, actionable insights for hiring teams.', status:'Closed', applicants:65 },
]
export const notifications: Notification[] = [
  { id:1, type:'Candidates', title:'New candidate added', message:'Maya Patel was added to the Senior Frontend Engineer pipeline.', createdAt:'5 min ago', read:false },
  { id:2, type:'Applications', title:'New application received', message:'A new application was submitted for Product Designer.', createdAt:'32 min ago', read:false },
  { id:3, type:'Shortlisted', title:'Candidate shortlisted', message:'Sarah Jenkins has been shortlisted for the next interview.', createdAt:'2 hrs ago', read:true },
  { id:4, type:'Rejected', title:'Application update', message:'David Wilson was marked as not moving forward.', createdAt:'Yesterday', read:true },
]
