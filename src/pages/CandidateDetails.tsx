import { BrainCircuit, CheckCircle2, Pencil } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { candidates } from '../data/mockData'

export default function CandidateDetails() {
  const { id } = useParams()
  const candidate = candidates.find(item => item.id === Number(id)) ?? candidates[0]
  const [profile, setProfile] = useState({ name: candidate.name, role: candidate.role, location: candidate.location, experience: candidate.experience })
  const [savedProfile, setSavedProfile] = useState(profile)
  const [notes, setNotes] = useState('')
  const [editing, setEditing] = useState(false)
  const update = (field: keyof typeof profile, value: string) => setProfile(current => ({ ...current, [field]: value }))
  const cancel = () => { setProfile(savedProfile); setEditing(false) }
  const save = () => { setSavedProfile(profile); setEditing(false) }

  return <main className="p-8">
    <div className="card border-l-4 border-l-blue-600 p-7">
      <div className="flex items-start justify-between gap-5"><div className="flex items-center gap-5"><div className="grid size-20 place-items-center rounded-full bg-violet-100 text-xl font-bold text-violet-700">{profile.name.split(' ').map(part => part[0]).join('')}</div><div><div className="flex items-center gap-3"><h1 className="page-title">{profile.name}</h1><span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white">AI Verified</span></div><p className="mt-1 text-slate-500">{profile.role}</p></div></div>{!editing && <button onClick={() => setEditing(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-[#f7f8fb]"><Pencil className="size-4 text-blue-600"/>Edit</button>}</div>
      {editing && <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 md:grid-cols-2"><label className="text-sm font-semibold">Name<input value={profile.name} onChange={event => update('name', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal outline-none focus:border-blue-500"/></label><label className="text-sm font-semibold">Position applied<input value={profile.role} onChange={event => update('role', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal outline-none focus:border-blue-500"/></label><label className="text-sm font-semibold">Location<input value={profile.location} onChange={event => update('location', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal outline-none focus:border-blue-500"/></label><label className="text-sm font-semibold">Years of experience<input value={profile.experience} onChange={event => update('experience', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal outline-none focus:border-blue-500"/></label><div className="flex gap-3 md:col-span-2"><button onClick={save} className="grad-accent rounded-xl px-5 py-2 text-sm font-semibold text-white">Save</button><button onClick={cancel} className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold hover:bg-[#f7f8fb]">Cancel</button></div></div>}
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[.8fr_2fr]"><div className="card p-7"><h2 className="text-xl font-bold">Global Ranking</h2><p className="mt-3 text-5xl font-bold text-blue-600">#2</p><p className="text-sm text-slate-500">of 145 applicants</p><div className="mt-8 h-2 rounded-full bg-slate-100"><div className="grad-accent h-full w-[92%] rounded-full"/></div><div className="mt-7 space-y-2 text-sm text-slate-600"><p><span className="font-semibold">Location:</span> {profile.location}</p><p><span className="font-semibold">Experience:</span> {profile.experience}</p></div></div><div className="card p-7"><h2 className="flex items-center gap-2 text-xl font-bold"><BrainCircuit className="text-blue-600"/>Automated Profile Overview</h2><p className="mt-5 leading-7 text-slate-600">{profile.name} is a highly skilled {profile.role} with a strong record of delivering scalable solutions. Their profile demonstrates excellent technical depth, collaboration, and leadership potential.</p><div className="mt-7 border-t border-slate-100 pt-6"><h3 className="font-semibold">Key Strengths</h3>{candidate.skills.map(skill => <p key={skill} className="mt-3 flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="size-4 text-emerald-500"/>{skill} expertise</p>)}</div></div></div>
    <section className="card mt-6 p-7"><h2 className="text-xl font-bold">Notes</h2><textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="Add interview notes or follow-up details..." className="mt-4 min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"/></section>
  </main>
}
