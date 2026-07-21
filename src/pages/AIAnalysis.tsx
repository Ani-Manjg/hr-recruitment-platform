import { BrainCircuit, FileCheck2, Loader2, UploadCloud, Users } from 'lucide-react'
import { ChangeEvent, DragEvent, useRef, useState } from 'react'
import Badge, { ProgressBar } from '../components/ui/Badge'
import { candidates } from '../data/mockData'

const acceptedExtensions = ['pdf', 'doc', 'docx']

export default function AIAnalysis() {
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [minimumScore, setMinimumScore] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const analyzeMockFile = (file:File) => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !acceptedExtensions.includes(extension)) { setError('Choose a PDF, DOC, or DOCX file to analyze.'); return }
    setError('')
    setFileName(file.name)
    setLoading(true)
    window.setTimeout(() => setLoading(false), 1200)
  }
  const handleFileChange = (event:ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) analyzeMockFile(file); event.target.value = '' }
  const handleDrop = (event:DragEvent<HTMLDivElement>) => { event.preventDefault(); setIsDragging(false); const file = event.dataTransfer.files?.[0]; if (file) analyzeMockFile(file) }

  const rankedCandidates = candidates.filter(candidate => candidate.score >= minimumScore).sort((a, b) => b.score - a.score)

  return <main><section className="bg-gradient-to-r from-slate-900 via-blue-950 to-violet-950 px-8 py-12 text-white"><p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-blue-300"><BrainCircuit/>AI Intelligence Suite</p><h1 className="mt-3 text-3xl font-bold">Talent AI Analysis</h1><p className="mt-2 text-slate-300">Advanced neural analysis for rapid candidate screening, automated skill validation, and cultural fit prediction.</p></section><section className="grid gap-6 p-8 lg:grid-cols-[.8fr_2fr]"><div onDragEnter={event => { event.preventDefault(); setIsDragging(true) }} onDragOver={event => event.preventDefault()} onDragLeave={event => { if (event.currentTarget === event.target) setIsDragging(false) }} onDrop={handleDrop} className={`card flex min-h-72 flex-col items-center justify-center border-2 border-dashed p-8 text-center transition ${isDragging ? 'border-blue-500 bg-blue-50 shadow-blue-100' : 'border-slate-200'}`}><UploadCloud className={`size-12 ${isDragging ? 'text-violet-600' : 'text-blue-600'}`}/><h2 className="mt-5 text-xl font-bold">Upload New CV</h2><p className="muted mt-2">Drag and drop PDF, DOCX, or scan a LinkedIn profile</p><input ref={inputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="sr-only"/><button onClick={() => inputRef.current?.click()} className="grad-accent mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold text-white" disabled={loading}>{loading && <Loader2 className="size-4 animate-spin"/>}{loading ? 'Analyzing...' : 'Select File'}</button>{error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}</div><div className="card p-8"><h2 className="text-2xl font-bold">AI Executive Summary</h2>{loading ? <div className="mt-8 flex items-center gap-3 text-slate-500"><Loader2 className="size-5 animate-spin text-blue-600"/>Analyzing {fileName}…</div> : fileName ? <div className="mt-6 rounded-xl bg-emerald-50 p-5"><div className="flex items-center gap-2 font-semibold text-emerald-800"><FileCheck2 className="size-5"/>Analysis ready</div><p className="mt-2 text-sm leading-6 text-emerald-700">{fileName} was processed successfully. Review the candidate ranking below for the mock match analysis.</p></div> : <p className="mt-5 leading-7 text-slate-600">Upload a candidate profile to generate an automated overview, skill matrix, career progression, and hiring recommendation.</p>}</div></section><section className="px-8 pb-8"><div className="card p-6 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-xl font-bold">Candidate Ranking</h2><p className="muted mt-1">Candidates ranked by AI match score.</p></div><span className="rounded-full bg-violet-100 px-3 py-1.5 text-sm font-bold text-violet-700">{minimumScore}% minimum</span></div><label className="mt-6 block"><span className="flex justify-between text-sm font-semibold text-slate-700"><span>Minimum match score</span><span>{minimumScore}%</span></span><input type="range" min="0" max="100" value={minimumScore} onChange={event => setMinimumScore(Number(event.target.value))} className="mt-3 h-2 w-full cursor-pointer accent-blue-600"/></label><div className="mt-7 space-y-4">{rankedCandidates.length ? rankedCandidates.map(candidate => <article key={candidate.id} className="rounded-xl border border-slate-100 p-4 sm:p-5"><div className="flex items-start gap-4"><div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Users className="size-5"/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-bold text-slate-900">{candidate.name}</h3><p className="mt-0.5 text-sm text-slate-500">{candidate.role} · {candidate.experience}</p></div><span className="text-lg font-bold text-violet-700">{candidate.score}%</span></div><ProgressBar value={candidate.score} className="mt-4"/><div className="mt-3 flex flex-wrap gap-2">{candidate.skills.map(skill => <Badge key={skill} className="bg-slate-100 text-slate-600">{skill}</Badge>)}</div></div></div></article>) : <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">No candidates meet this match score threshold.</p>}</div></div></section></main>
}
