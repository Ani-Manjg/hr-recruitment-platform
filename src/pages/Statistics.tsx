import { BriefcaseBusiness, Loader2, UserCheck, UserMinus, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api, apiErrorMessage } from '../api/client'
import type { DashboardStats, PipelinePoint } from '../types'

export default function Statistics(){
  const[stats,setStats]=useState<DashboardStats|null>(null),[pipeline,setPipeline]=useState<PipelinePoint[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('')
  useEffect(()=>{Promise.all([api.stats.dashboard(),api.stats.pipeline()]).then(([summary,history])=>{setStats(summary);setPipeline(history)}).catch(caught=>setError(apiErrorMessage(caught))).finally(()=>setLoading(false))},[])
  if(loading)return <main className="grid min-h-96 place-items-center"><Loader2 className="size-8 animate-spin text-blue-600"/></main>
  const cards=stats?[{label:'Candidates',value:stats.totalCandidates,icon:Users},{label:'Shortlisted',value:stats.shortlisted,icon:UserCheck},{label:'Rejected',value:stats.rejected,icon:UserMinus},{label:'Open Positions',value:stats.openPositions,icon:BriefcaseBusiness}]:[]
  return <main className="p-8"><div><h1 className="page-title">Recruitment Statistics</h1><p className="muted mt-1">Live performance data from the recruitment API.</p></div>{error&&<p className="mt-4 rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>}<section className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{cards.map(({label,value,icon:Icon})=><div className="card p-6" key={label}><div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon className="size-5"/></div><p className="mt-6 text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>)}</section><section className="card mt-6 p-7"><h2 className="text-xl font-bold">Annual Pipeline Performance</h2><p className="muted mt-1">Screened and shortlisted candidates by month</p><div className="mt-7 h-96"><ResponsiveContainer width="100%" height="100%"><BarChart data={pipeline} barGap={4}><CartesianGrid stroke="#e8ebf0" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="month" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false}/><Tooltip/><Bar dataKey="screened" fill="#2563eb" radius={[5,5,0,0]}/><Bar dataKey="shortlisted" fill="#7c3aed" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></section></main>
}
