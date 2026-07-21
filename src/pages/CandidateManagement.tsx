import { Clock3, Grid2X2, List, MapPin, Search, SlidersHorizontal, UserCheck, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { candidates } from '../data/mockData'
import Badge from '../components/ui/Badge'

type CandidateTab = 'all' | 'shortlisted' | 'rejected'
type SortOption = 'score-desc' | 'score-asc' | 'name' | 'experience'

const tabs: { value: CandidateTab; label: string }[] = [
  { value: 'all', label: 'All Candidates (324)' },
  { value: 'shortlisted', label: 'Shortlisted (48)' },
  { value: 'rejected', label: 'Archived' },
]

const getTab = (value: string | null): CandidateTab =>
  value === 'shortlisted' || value === 'rejected' ? value : 'all'

export default function CandidateManagement() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = getTab(searchParams.get('tab'))
  const [sortBy, setSortBy] = useState<SortOption>('score-desc')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [comparisonOpen, setComparisonOpen] = useState(false)
  const pageSize = 6

  const selectTab = (nextTab: CandidateTab) => {
    setPage(1)
    if (nextTab === 'all') setSearchParams({})
    else setSearchParams({ tab: nextTab })
  }

  const visibleCandidates = candidates.filter(candidate => {
    const matchesTab = tab === 'all' || (tab === 'rejected' ? candidate.status === 'archived' : candidate.status === tab)
    const term = search.trim().toLowerCase()
    const matchesSearch = !term || candidate.name.toLowerCase().includes(term) || candidate.skills.some(skill => skill.toLowerCase().includes(term))
    return matchesTab && matchesSearch
  })
  const sortedCandidates = [...visibleCandidates].sort((a, b) => {
    if (sortBy === 'score-asc') return a.score - b.score
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'experience') return parseInt(b.experience) - parseInt(a.experience)
    return b.score - a.score
  })
  const pageCount = Math.max(1, Math.ceil(sortedCandidates.length / pageSize))
  const pageCandidates = sortedCandidates.slice((page - 1) * pageSize, page * pageSize)
  const selectedCandidates = candidates.filter(candidate => selectedIds.includes(candidate.id))
  const toggleCandidate = (id: number) => setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current)

  return <main className="p-8">
    <div className="flex items-start justify-between">
      <div><h1 className="page-title">Candidate Management</h1><p className="muted mt-1">Analyze and manage talent in your recruitment pipeline with AI-driven ranking.</p></div>
      <button className="grad-accent rounded-lg px-5 py-2.5 text-sm font-semibold text-white">+ Add Candidate</button>
    </div>
    <div className="mt-7 flex items-center justify-between">
      <div className="rounded-xl border border-slate-200 bg-slate-100 p-1 text-sm font-medium">
        {tabs.map(item => <button key={item.value} onClick={() => selectTab(item.value)} className={`rounded-lg px-5 py-2 ${tab === item.value ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>{item.label}</button>)}
      </div>
      <div className="flex gap-3"><label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4"><Search className="size-4 text-slate-400"/><input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} className="w-40 py-2.5 text-sm outline-none" placeholder="Search name or skill"/></label><select aria-label="Sort candidates" value={sortBy} onChange={event => { setSortBy(event.target.value as SortOption); setPage(1) }} className="rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"><option value="score-desc">AI Match Score (High to Low)</option><option value="score-asc">AI Match Score (Low to High)</option><option value="name">Name (A-Z)</option><option value="experience">Experience (Most)</option></select><div className="flex rounded-xl border border-slate-200 bg-white p-1"><button aria-label="Grid view" onClick={() => setView('grid')} className={`rounded-lg p-2 ${view === 'grid' ? 'bg-slate-100 text-blue-600' : 'text-slate-400'}`}><Grid2X2 className="size-4"/></button><button aria-label="List view" onClick={() => setView('list')} className={`rounded-lg p-2 ${view === 'list' ? 'bg-slate-100 text-blue-600' : 'text-slate-400'}`}><List className="size-4"/></button></div><button className="rounded-xl border border-slate-200 bg-white p-3"><SlidersHorizontal className="size-4"/></button></div>
    </div>
    <div className={`mt-7 gap-5 ${view === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}`}>{pageCandidates.map(c => <Link to={`/candidates/${c.id}`} key={c.id} className={`card relative block p-5 transition hover:-translate-y-0.5 hover:shadow-md ${view === 'list' ? 'md:flex md:items-center md:gap-8' : ''}`}><label onClick={event => event.preventDefault()} className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm"><input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleCandidate(c.id)} disabled={!selectedIds.includes(c.id) && selectedIds.length === 3} className="accent-blue-600"/>Compare</label><div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 font-bold text-blue-700">{c.name.split(' ').map(n => n[0]).join('')}</div><div className="min-w-0"><h2 className="font-bold">{c.name}</h2><p className="truncate text-sm text-slate-500">{c.role}</p></div></div><div className={`mt-4 flex gap-4 text-xs text-slate-500 ${view === 'list' ? 'md:mt-0' : ''}`}><span className="flex items-center gap-1"><MapPin className="size-3"/>{c.location}</span><span className="flex items-center gap-1"><Clock3 className="size-3"/>{c.experience}</span></div><div className={`mt-5 rounded-xl bg-blue-50 p-4 ${view === 'list' ? 'md:ml-auto md:mt-0 md:min-w-44' : ''}`}><div className="flex items-center justify-between text-sm font-semibold text-blue-700"><span>AI MATCH SCORE</span><span>{c.score}%</span></div></div><div className={view === 'list' ? 'md:ml-4 md:min-w-48' : ''}><p className="mb-2 mt-5 text-xs text-slate-500">Top Skills</p><div className="flex flex-wrap gap-1.5">{c.skills.map(s => <Badge key={s} className="bg-violet-50 text-violet-600">{s}</Badge>)}</div></div><button onClick={event => event.preventDefault()} className={`mt-5 flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm font-semibold ${view === 'list' ? 'md:ml-4 md:w-32' : 'w-full'}`}><UserCheck className="size-4 text-emerald-500"/>Shortlist</button></Link>)}</div>
    <div className="mt-6 flex items-center justify-center gap-3"><button disabled={page === 1} onClick={() => setPage(current => current - 1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-[#f7f8fb] disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="text-sm text-slate-500">Page {page} of {pageCount}</span><button disabled={page === pageCount} onClick={() => setPage(current => current + 1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-[#f7f8fb] disabled:cursor-not-allowed disabled:opacity-40">Next</button></div>
    {selectedIds.length >= 2 && <button onClick={() => setComparisonOpen(true)} className="grad-accent fixed bottom-6 right-6 z-20 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg">Compare Selected ({selectedIds.length})</button>}
    {comparisonOpen && <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/40 p-4"><div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold">Candidate Comparison</h2><p className="mt-1 text-sm text-slate-500">Compare selected candidates side by side.</p></div><button onClick={() => setComparisonOpen(false)} aria-label="Close comparison" className="rounded-lg p-2 hover:bg-slate-100"><X className="size-5"/></button></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-160 text-left text-sm"><thead><tr className="border-b border-slate-200"><th className="p-3 font-semibold text-slate-500">Candidate</th>{selectedCandidates.map(candidate => <th key={candidate.id} className="p-3 text-base font-bold">{candidate.name}<span className="mt-1 block text-xs font-normal text-slate-500">{candidate.role}</span></th>)}</tr></thead><tbody>{[['Match score', selectedCandidates.map(candidate => `${candidate.score}%`)], ['Skills', selectedCandidates.map(candidate => candidate.skills.join(', '))], ['Experience', selectedCandidates.map(candidate => candidate.experience)], ['Education', selectedCandidates.map(() => 'Not provided')], ['Location', selectedCandidates.map(candidate => candidate.location)], ['Resume status', selectedCandidates.map(() => 'Resume received')]].map(([label, values]) => <tr key={label as string} className="border-b border-slate-100 last:border-0"><th className="whitespace-nowrap bg-slate-50 p-3 font-semibold text-slate-600">{label as string}</th>{(values as string[]).map((value, index) => <td key={index} className="p-3 text-slate-700">{value}</td>)}</tr>)}</tbody></table></div></div></div>}
  </main>
}
