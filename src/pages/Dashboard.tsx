import { BrainCircuit, CalendarDays, Clock3, Trash2, UserRound, X } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import StatCard from '../components/ui/StatCard'
import { candidates, dashboardStats, matchCriteria, pipelineHistory } from '../data/mockData'

type Interview = {
  id: number
  candidate: string
  date: string
  time: string
  interviewer: string
  type: string
  notes: string
}

const emptyInterview = { candidate: '', date: '', time: '', interviewer: '', type: 'Video interview', notes: '' }

export default function Dashboard() {
  const [monthRange, setMonthRange] = useState(6)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [form, setForm] = useState(emptyInterview)
  const [formError, setFormError] = useState('')
  const [interviews, setInterviews] = useState<Interview[]>(() => {
    try { return JSON.parse(localStorage.getItem('talentflow-interviews') ?? '[]') as Interview[] }
    catch { return [] }
  })
  const navigate = useNavigate()
  const chartData = pipelineHistory.slice(-monthRange)

  function statDestination(label: string) {
    if (label === 'Total Candidates') return '/candidates'
    if (label === 'Shortlisted') return '/candidates?tab=shortlisted'
    if (label === 'Rejected') return '/candidates?tab=rejected'
  }

  function saveInterviews(next: Interview[]) {
    setInterviews(next)
    localStorage.setItem('talentflow-interviews', JSON.stringify(next))
  }

  function scheduleInterview(event: FormEvent) {
    event.preventDefault()
    if (!form.candidate || !form.date || !form.time || !form.interviewer.trim()) {
      setFormError('Candidate, date, time, and interviewer are required.')
      return
    }
    const next = [...interviews, { ...form, interviewer: form.interviewer.trim(), id: Date.now() }]
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    saveInterviews(next)
    setForm(emptyInterview)
    setFormError('')
  }

  return <main className="p-8">
    <section className="card relative overflow-hidden bg-gradient-to-r from-white to-blue-50 px-9 py-8">
      <div className="absolute -right-16 -top-16 size-60 rounded-full bg-violet-100/30 blur-2xl" />
      <div className="relative">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, TalentFlow Admin</h1>
        <p className="mt-2 max-w-3xl text-slate-500">Your AI recruitment agent has processed <strong className="text-blue-600">48 new candidates</strong> since your last login. View the latest high-match scores below.</p>
        <div className="mt-5 flex gap-3">
          <Link to="/ai-analysis" className="grad-accent flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"><BrainCircuit className="size-4" />Run AI Analysis</Link>
          <button onClick={() => setScheduleOpen(true)} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"><CalendarDays className="size-4" />Schedule Interviews</button>
        </div>
      </div>
    </section>

    <section className="my-9 grid grid-cols-2 divide-x divide-slate-100 lg:grid-cols-4">
      {dashboardStats.map(stat => {
        const destination = statDestination(stat.label)
        return <StatCard key={stat.label} stat={stat} onClick={destination ? () => {
          /* CandidateManagement.tsx should read the tab query parameter and select its matching tab. */
          navigate(destination)
        } : undefined} />
      })}
    </section>

    <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <div className="card p-7">
        <div className="mb-6 flex items-start justify-between">
          <div><h2 className="text-xl font-bold">Recruitment Pipeline</h2><p className="muted">Historical view of candidate progression</p></div>
          <label className="relative"><span className="sr-only">Chart date range</span><select value={monthRange} onChange={event => setMonthRange(Number(event.target.value))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs font-medium text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"><option value={3}>Last 3 Months</option><option value={6}>Last 6 Months</option><option value={12}>Last 12 Months</option></select></label>
        </div>
        <div className="h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><defs><linearGradient id="screened" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={.2} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0} /></linearGradient><linearGradient id="shortlisted" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" stopOpacity={.18} /><stop offset="100%" stopColor="#7c3aed" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#e8ebf0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#7b8493', fontSize: 12 }} /><YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: '#7b8493', fontSize: 12 }} /><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} /><Area type="monotone" dataKey="screened" stroke="#2563eb" strokeWidth={2.5} fill="url(#screened)" /><Area type="monotone" dataKey="shortlisted" stroke="#7c3aed" strokeWidth={2.5} fill="url(#shortlisted)" /></AreaChart></ResponsiveContainer></div>
      </div>
      <div className="card p-7"><h2 className="text-xl font-bold">AI Match Criteria</h2><p className="muted mb-8">Weighted analysis of top candidates</p><div className="space-y-6">{matchCriteria.map(item => <div key={item.label}><div className="mb-2 flex justify-between text-sm font-medium"><span>{item.label}</span><span className="text-blue-600">{item.value}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="grad-accent h-full rounded-full" style={{ width: `${item.value}%` }} /></div></div>)}</div></div>
    </section>

    {scheduleOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget) setScheduleOpen(false) }}>
      <section role="dialog" aria-modal="true" aria-labelledby="schedule-title" className="card max-h-[90vh] w-full max-w-4xl overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 id="schedule-title" className="text-xl font-bold">Schedule an interview</h2><p className="mt-1 text-sm text-slate-500">Add an interview to your recruitment schedule.</p></div><button onClick={() => setScheduleOpen(false)} aria-label="Close schedule" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="size-5" /></button></div>
        <div className="grid lg:grid-cols-[1.1fr_.9fr]">
          <form onSubmit={scheduleInterview} className="space-y-4 p-5 sm:p-6 lg:border-r lg:border-slate-100">
            <label className="block"><span className="mb-1.5 block text-sm font-semibold">Candidate</span><select value={form.candidate} onChange={event => setForm(current => ({ ...current, candidate: event.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"><option value="">Select a candidate</option>{candidates.map(candidate => <option key={candidate.id} value={candidate.name}>{candidate.name} — {candidate.role}</option>)}</select></label>
            <div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-1.5 block text-sm font-semibold">Date</span><input type="date" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={event => setForm(current => ({ ...current, date: event.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" /></label><label><span className="mb-1.5 block text-sm font-semibold">Time</span><input type="time" value={form.time} onChange={event => setForm(current => ({ ...current, time: event.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" /></label></div>
            <div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-1.5 block text-sm font-semibold">Interviewer</span><input value={form.interviewer} onChange={event => setForm(current => ({ ...current, interviewer: event.target.value }))} placeholder="Hiring manager name" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" /></label><label><span className="mb-1.5 block text-sm font-semibold">Interview type</span><select value={form.type} onChange={event => setForm(current => ({ ...current, type: event.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"><option>Video interview</option><option>Phone screening</option><option>On-site interview</option><option>Technical interview</option></select></label></div>
            <label className="block"><span className="mb-1.5 block text-sm font-semibold">Notes <span className="font-normal text-slate-400">(optional)</span></span><textarea value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} rows={3} placeholder="Add interview agenda or preparation notes..." className="w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" /></label>
            {formError && <p className="text-sm font-medium text-rose-600">{formError}</p>}
            <button className="grad-accent flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white shadow-sm"><CalendarDays className="size-4" />Add to schedule</button>
          </form>
          <aside className="bg-slate-50/70 p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><h3 className="font-bold">Upcoming interviews</h3><p className="text-xs text-slate-500">{interviews.length} scheduled</p></div><CalendarDays className="size-5 text-blue-600" /></div>
            <div className="max-h-96 space-y-3 overflow-y-auto">{interviews.length ? interviews.map(interview => <article key={interview.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h4 className="text-sm font-bold">{interview.candidate}</h4><p className="mt-0.5 text-xs text-violet-600">{interview.type}</p></div><button onClick={() => saveInterviews(interviews.filter(item => item.id !== interview.id))} aria-label={`Remove interview for ${interview.candidate}`} className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500"><Trash2 className="size-4" /></button></div><div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500"><span className="flex items-center gap-1"><CalendarDays className="size-3.5" />{new Date(`${interview.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span><span className="flex items-center gap-1"><Clock3 className="size-3.5" />{interview.time}</span><span className="flex items-center gap-1"><UserRound className="size-3.5" />{interview.interviewer}</span></div>{interview.notes && <p className="mt-3 border-t border-slate-100 pt-2 text-xs leading-5 text-slate-500">{interview.notes}</p>}</article>) : <div className="rounded-xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center"><CalendarDays className="mx-auto size-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600">No interviews scheduled</p><p className="mt-1 text-xs text-slate-400">New interviews will appear here.</p></div>}</div>
          </aside>
        </div>
      </section>
    </div>}
  </main>
}
