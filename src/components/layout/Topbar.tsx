import { Bell, Building2, Check, CheckCheck, ChevronDown, Mail, Menu, Pencil, Save, Search, Trash2, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { candidates } from '../../data/mockData'

const names: Record<string, string> = {
  '/': 'Dashboard',
  '/candidates': 'Candidate Management',
  '/jobs': 'Job Management',
  '/ai-analysis': 'AI Analysis',
  '/statistics': 'Statistics',
  '/settings': 'Settings',
}

type Notification = {
  id: number
  title: string
  message: string
  time: string
  read: boolean
}

type Profile = {
  name: string
  email: string
  role: string
  department: string
}

const defaultProfile: Profile = {
  name: 'TalentFlow Admin',
  email: 'admin@talentflow.hr',
  role: 'HR Administrator',
  department: 'People Operations',
}

const initialNotifications: Notification[] = [
  { id: 1, title: 'New candidate application', message: 'A new candidate has applied for an open position.', time: '5 min ago', read: false },
  { id: 2, title: 'Interview reminder', message: 'You have an upcoming interview scheduled for today.', time: '1 hour ago', read: false },
  { id: 3, title: 'AI analysis complete', message: 'A candidate profile is ready for your review.', time: 'Yesterday', read: true },
]

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profile, setProfile] = useState<Profile>(() => {
    try { return JSON.parse(localStorage.getItem('talentflow-profile') ?? '') as Profile }
    catch { return defaultProfile }
  })
  const [profileDraft, setProfileDraft] = useState(profile)
  const notificationRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const unreadCount = notifications.filter(notification => !notification.read).length
  const initials = profile.name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'TA'
  const profileIsValid = profileDraft.name.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileDraft.email.trim())
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const searchResults = normalizedQuery ? candidates.filter(candidate => [candidate.name, candidate.role, candidate.location, ...candidate.skills].some(value => value.toLowerCase().includes(normalizedQuery))).slice(0, 6) : []

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setNotificationsOpen(false)
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false)
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
        setEditingProfile(false)
        setProfileDraft(profile)
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false)
        setProfileOpen(false)
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [profile])

  function markAsRead(id: number) {
    setNotifications(items => items.map(item => item.id === id ? { ...item, read: true } : item))
  }

  function saveProfile() {
    if (!profileIsValid) return
    const next = { ...profileDraft, name: profileDraft.name.trim(), email: profileDraft.email.trim() }
    setProfile(next)
    localStorage.setItem('talentflow-profile', JSON.stringify(next))
    setEditingProfile(false)
  }

  function openCandidate(id: number) {
    setSearchOpen(false)
    setSearchQuery('')
    navigate(`/candidates/${id}`)
  }

  return <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:h-20 lg:px-8">
    <div className="flex min-w-0 items-center gap-3 text-sm">
      <button onClick={onMenu} aria-label="Open navigation" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"><Menu className="size-5" /></button>
      <span className="truncate font-semibold">{names[pathname] ?? 'TalentFlow HR'}</span>
      <span className="hidden text-slate-300 sm:inline">›</span>
      <span className="hidden text-slate-500 sm:inline">Recruitment Overview</span>
    </div>
    <div className="flex items-center gap-3 lg:gap-5">
      <div className="relative" ref={searchRef}>
        <button onClick={() => { setSearchOpen(open => !open); setNotificationsOpen(false); setProfileOpen(false) }} aria-label="Search candidates" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><Search className="size-5" /></button>
        <label className="hidden h-11 w-56 items-center gap-2 rounded-xl border border-slate-200 px-4 text-slate-400 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 lg:flex xl:w-72"><Search className="size-4 shrink-0" /><input value={searchQuery} onFocus={() => setSearchOpen(true)} onChange={event => { setSearchQuery(event.target.value); setSearchOpen(true) }} onKeyDown={event => { if (event.key === 'Enter' && searchResults[0]) openCandidate(searchResults[0].id) }} className="w-full bg-transparent text-sm text-slate-700 outline-none" placeholder="Search candidates..." />{searchQuery && <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search" className="text-slate-400 hover:text-slate-700"><X className="size-3.5" /></button>}</label>
        {searchOpen && <section aria-label="Candidate search" className="card fixed left-4 right-4 top-17 overflow-hidden shadow-xl sm:left-auto sm:right-6 sm:w-96 lg:absolute lg:right-0 lg:top-13">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 lg:hidden"><Search className="size-4 text-slate-400" /><input autoFocus value={searchQuery} onChange={event => setSearchQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && searchResults[0]) openCandidate(searchResults[0].id) }} className="w-full text-sm outline-none" placeholder="Search by name, role, skill..." /><button onClick={() => { setSearchQuery(''); setSearchOpen(false) }} aria-label="Close search"><X className="size-4 text-slate-400" /></button></div>
          {!normalizedQuery ? <div className="px-5 py-8 text-center"><Search className="mx-auto size-7 text-slate-300" /><p className="mt-2 text-sm font-semibold text-slate-600">Find a candidate</p><p className="mt-1 text-xs text-slate-400">Search by name, role, location, or skill.</p></div> : searchResults.length ? <div className="max-h-96 overflow-y-auto py-2">{searchResults.map(candidate => <button key={candidate.id} onClick={() => openCandidate(candidate.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-50"><div className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 text-xs font-bold text-blue-700">{candidate.name.split(' ').map(part => part[0]).join('')}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{candidate.name}</p><p className="truncate text-xs text-slate-500">{candidate.role} · {candidate.location}</p></div><span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600">{candidate.score}%</span></button>)}</div> : <div className="px-5 py-8 text-center"><p className="text-sm font-semibold text-slate-600">No candidates found</p><p className="mt-1 text-xs text-slate-400">Try another name, role, location, or skill.</p></div>}
          {searchResults.length > 0 && <div className="border-t border-slate-100 px-4 py-2 text-center text-[11px] text-slate-400">Press Enter to open the first result</div>}
        </section>}
      </div>
      <div className="relative" ref={notificationRef}>
        <button onClick={() => { setNotificationsOpen(open => !open); setProfileOpen(false); setEditingProfile(false) }} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} aria-expanded={notificationsOpen} className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100">
          <Bell className="size-5" />
          {unreadCount > 0 && <span className="absolute right-0.5 top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">{unreadCount}</span>}
        </button>
        {notificationsOpen && <section aria-label="Notification center" className="card absolute right-0 top-12 w-[min(22rem,calc(100vw-2rem))] overflow-hidden shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <div><h2 className="font-bold text-slate-950">Notifications</h2><p className="text-xs text-slate-500">{unreadCount ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'You are all caught up'}</p></div>
            {unreadCount > 0 && <button onClick={() => setNotifications(items => items.map(item => ({ ...item, read: true })))} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"><CheckCheck className="size-3.5" />Mark all read</button>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length ? notifications.map(notification => <article key={notification.id} className={`flex gap-3 border-b border-slate-100 px-4 py-4 last:border-0 ${notification.read ? 'bg-white' : 'bg-blue-50/60'}`}>
              <span className={`mt-1 size-2 shrink-0 rounded-full ${notification.read ? 'bg-slate-200' : 'bg-blue-600'}`} />
              <div className="min-w-0 flex-1"><h3 className="text-sm font-semibold text-slate-900">{notification.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{notification.message}</p><p className="mt-1.5 text-[11px] font-medium text-slate-400">{notification.time}</p></div>
              {!notification.read && <button onClick={() => markAsRead(notification.id)} title="Mark as read" aria-label={`Mark ${notification.title} as read`} className="self-start rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-emerald-600"><Check className="size-4" /></button>}
            </article>) : <div className="px-6 py-10 text-center"><div className="mx-auto grid size-11 place-items-center rounded-full bg-slate-100 text-slate-400"><Bell className="size-5" /></div><p className="mt-3 text-sm font-semibold text-slate-700">No notifications</p><p className="mt-1 text-xs text-slate-500">New updates will appear here.</p></div>}
          </div>
          {notifications.length > 0 && <div className="border-t border-slate-100 p-2"><button onClick={() => setNotifications([])} className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="size-3.5" />Clear all notifications</button></div>}
        </section>}
      </div>
      <div className="relative" ref={profileRef}>
        <button onClick={() => { setProfileOpen(open => !open); setNotificationsOpen(false); setEditingProfile(false); setProfileDraft(profile) }} aria-label="Open profile" aria-expanded={profileOpen} className="flex items-center gap-2 rounded-lg p-1 transition hover:bg-slate-100">
          <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-violet-200 text-sm font-semibold text-blue-700">{initials}</div>
          <ChevronDown className={`hidden size-4 text-slate-400 transition sm:block ${profileOpen ? 'rotate-180' : ''}`} />
        </button>
        {profileOpen && <section aria-label="Profile management" className="card absolute right-0 top-12 w-[min(23rem,calc(100vw-2rem))] overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-5 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-14 place-items-center rounded-full border-2 border-white/50 bg-white/20 text-lg font-bold">{initials}</div>
                <div><h2 className="font-bold">{profile.name}</h2><p className="text-xs text-blue-100">{profile.role}</p><span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-50"><span className="size-1.5 rounded-full bg-emerald-300" />Available</span></div>
              </div>
              <button onClick={() => setProfileOpen(false)} aria-label="Close profile" className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"><X className="size-4" /></button>
            </div>
          </div>
          {!editingProfile ? <div className="p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5"><Mail className="size-4 text-blue-500" /><div><p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Email</p><p className="text-sm font-medium text-slate-700">{profile.email}</p></div></div>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5"><UserRound className="size-4 text-violet-500" /><div><p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Role</p><p className="text-sm font-medium text-slate-700">{profile.role}</p></div></div>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5"><Building2 className="size-4 text-emerald-500" /><div><p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Department</p><p className="text-sm font-medium text-slate-700">{profile.department}</p></div></div>
            </div>
            <button onClick={() => { setProfileDraft(profile); setEditingProfile(true) }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"><Pencil className="size-4" />Edit profile</button>
          </div> : <form className="space-y-3 p-4" onSubmit={event => { event.preventDefault(); saveProfile() }}>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Full name</span><input value={profileDraft.name} onChange={event => setProfileDraft(current => ({ ...current, name: event.target.value }))} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Email address</span><input type="email" value={profileDraft.email} onChange={event => setProfileDraft(current => ({ ...current, email: event.target.value }))} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Role</span><input value={profileDraft.role} onChange={event => setProfileDraft(current => ({ ...current, role: event.target.value }))} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" /></label>
              <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Department</span><input value={profileDraft.department} onChange={event => setProfileDraft(current => ({ ...current, department: event.target.value }))} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" /></label>
            </div>
            {!profileIsValid && <p className="text-xs font-medium text-rose-600">Enter a name and valid email address.</p>}
            <div className="flex gap-2 pt-1"><button type="button" onClick={() => { setProfileDraft(profile); setEditingProfile(false) }} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button disabled={!profileIsValid} className="grad-accent flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Save className="size-4" />Save</button></div>
          </form>}
        </section>}
      </div>
    </div>
  </header>
}
