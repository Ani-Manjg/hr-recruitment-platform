import { BriefcaseBusiness, Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react'
import { FormEvent, useState } from 'react'
import Badge from '../components/ui/Badge'
import { jobs as initialJobs } from '../data/mockData'
import type { Job, JobStatus } from '../types'

const emptyJob = { title:'', department:'', location:'', employmentType:'Full-time', description:'', status:'Draft' as JobStatus }
const statusStyles: Record<JobStatus, string> = { Open:'bg-emerald-100 text-emerald-700', Closed:'bg-slate-100 text-slate-600', Draft:'bg-amber-100 text-amber-700' }

export default function JobManagement() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [form, setForm] = useState(emptyJob)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | JobStatus>('All')

  const openNewForm = () => { setEditingJob(null); setForm(emptyJob); setIsFormOpen(true) }
  const openEditForm = (job: Job) => { setEditingJob(job); setForm({ title:job.title, department:job.department, location:job.location, employmentType:job.employmentType, description:job.description, status:job.status }); setIsFormOpen(true) }
  const closeForm = () => { setIsFormOpen(false); setEditingJob(null) }
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (editingJob) setJobs(current => current.map(job => job.id === editingJob.id ? { ...job, ...form } : job))
    else setJobs(current => [...current, { ...form, id:Date.now(), applicants:0 }])
    closeForm()
  }
  const updateForm = (field:keyof typeof form, value:string) => setForm(current => ({ ...current, [field]:value }))
  const visibleJobs = jobs.filter(job => {
    const search = searchQuery.trim().toLowerCase()
    return (job.title.toLowerCase().includes(search) || job.department.toLowerCase().includes(search)) && (statusFilter === 'All' || job.status === statusFilter)
  })

  return <main className="p-8">
    <div className="flex items-start justify-between gap-4"><div><h1 className="page-title">Job Management</h1><p className="muted mt-2">Create and manage your open positions.</p></div><button onClick={openNewForm} className="grad-accent inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"><Plus className="size-4"/>New job</button></div>
    <div className="mt-7 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/><span className="sr-only">Search jobs</span><input value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search by title or department" className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"/></label><label className="flex items-center gap-2 text-sm font-medium text-slate-600">Status<select value={statusFilter} onChange={event => setStatusFilter(event.target.value as 'All' | JobStatus)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-blue-500"><option>All</option><option>Open</option><option>Closed</option><option>Draft</option></select></label></div>
    <section className="mt-5 grid gap-5 lg:grid-cols-2">
      {visibleJobs.map(job => <article key={job.id} className="card p-6"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><BriefcaseBusiness className="size-5 text-blue-600"/><h2 className="font-bold text-slate-900">{job.title}</h2></div><p className="muted mt-2">{job.department} · {job.location} · {job.employmentType}</p></div><div className="flex flex-col items-end gap-2"><Badge className={statusStyles[job.status]}>{job.status}</Badge><label className="sr-only" htmlFor={`job-status-${job.id}`}>Change job status</label><select id={`job-status-${job.id}`} value={job.status} onChange={event => setJobs(current => current.map(item => item.id === job.id ? { ...item, status:event.target.value as JobStatus } : item))} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 outline-none focus:border-blue-500"><option>Open</option><option>Closed</option><option>Draft</option></select></div></div><p className="mt-4 text-sm leading-6 text-slate-600">{job.description}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="inline-flex items-center gap-1.5 text-sm text-slate-500"><Users className="size-4"/>{job.applicants} applicants</span><div className="flex items-center gap-2"><button onClick={() => openEditForm(job)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"><Pencil className="size-4"/>Edit</button><button onClick={() => setJobs(current => current.filter(item => item.id !== job.id))} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${job.title}`}><Trash2 className="size-4"/></button></div></div></article>)}
    </section>
    {visibleJobs.length === 0 && <div className="card mt-5 p-10 text-center text-sm text-slate-500">No jobs match your search.</div>}
    {isFormOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4"><form onSubmit={handleSubmit} className="card w-full max-w-2xl p-6 sm:p-8"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">{editingJob ? 'Edit job' : 'New job'}</h2><p className="muted mt-1">{editingJob ? 'Update the role details below.' : 'Add a role to your hiring pipeline.'}</p></div><button type="button" onClick={closeForm} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="size-5"/></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Job title" value={form.title} onChange={value => updateForm('title', value)} required/><Field label="Department" value={form.department} onChange={value => updateForm('department', value)} required/><Field label="Location" value={form.location} onChange={value => updateForm('location', value)} required/><label className="text-sm font-medium text-slate-700">Employment type<select value={form.employmentType} onChange={event => updateForm('employmentType', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-blue-500"><option>Full-time</option><option>Part-time</option><option>Contract</option></select></label><label className="sm:col-span-2 text-sm font-medium text-slate-700">Description<textarea value={form.description} onChange={event => updateForm('description', event.target.value)} required rows={4} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"/></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={closeForm} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button className="grad-accent rounded-lg px-4 py-2.5 text-sm font-semibold text-white">{editingJob ? 'Save changes' : 'Create job'}</button></div></form></div>}
  </main>
}

function Field({ label, value, onChange, required=false }:{label:string;value:string;onChange:(value:string)=>void;required?:boolean}) { return <label className="text-sm font-medium text-slate-700">{label}<input value={value} onChange={event => onChange(event.target.value)} required={required} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"/></label> }
