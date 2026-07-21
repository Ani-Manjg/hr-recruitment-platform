import { Bell, Check, CheckCheck, ChevronDown, Menu, Search, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

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

const initialNotifications: Notification[] = [
  { id: 1, title: 'New candidate application', message: 'A new candidate has applied for an open position.', time: '5 min ago', read: false },
  { id: 2, title: 'Interview reminder', message: 'You have an upcoming interview scheduled for today.', time: '1 hour ago', read: false },
  { id: 3, title: 'AI analysis complete', message: 'A candidate profile is ready for your review.', time: 'Yesterday', read: true },
]

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const unreadCount = notifications.filter(notification => !notification.read).length

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setNotificationsOpen(false)
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setNotificationsOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  function markAsRead(id: number) {
    setNotifications(items => items.map(item => item.id === id ? { ...item, read: true } : item))
  }

  return <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:h-20 lg:px-8">
    <div className="flex min-w-0 items-center gap-3 text-sm">
      <button onClick={onMenu} aria-label="Open navigation" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"><Menu className="size-5" /></button>
      <span className="truncate font-semibold">{names[pathname] ?? 'TalentFlow HR'}</span>
      <span className="hidden text-slate-300 sm:inline">›</span>
      <span className="hidden text-slate-500 sm:inline">Recruitment Overview</span>
    </div>
    <div className="flex items-center gap-3 lg:gap-5">
      <label className="hidden h-11 w-56 items-center gap-2 rounded-xl border border-slate-200 px-4 text-slate-400 lg:flex xl:w-72"><Search className="size-4" /><input className="w-full bg-transparent text-sm outline-none" placeholder="Search candidates..." /></label>
      <div className="relative" ref={notificationRef}>
        <button onClick={() => setNotificationsOpen(open => !open)} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} aria-expanded={notificationsOpen} className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100">
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
      <button className="flex items-center gap-2"><div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-violet-200 font-semibold text-blue-700">TA</div><ChevronDown className="hidden size-4 text-slate-400 sm:block" /></button>
    </div>
  </header>
}
