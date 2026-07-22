import { Bell, CheckCheck, FileText, UserCheck, UserMinus, Users } from 'lucide-react'
import { useState } from 'react'
import Badge from '../components/ui/Badge'
import { notifications as initialNotifications } from '../data/mockData'
import type { Notification, NotificationType } from '../types'

type Filter = 'All' | 'Unread' | NotificationType
const filters: Filter[] = ['All', 'Unread', 'Candidates', 'Applications', 'Shortlisted', 'Rejected']
const typeIcons = { Candidates:Users, Applications:FileText, Shortlisted:UserCheck, Rejected:UserMinus }
const typeStyles = { Candidates:'bg-blue-100 text-blue-700', Applications:'bg-violet-100 text-violet-700', Shortlisted:'bg-emerald-100 text-emerald-700', Rejected:'bg-rose-100 text-rose-700' }

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [activeFilter, setActiveFilter] = useState<Filter>('All')
  const visibleNotifications = notifications.filter(notification => activeFilter === 'All' || (activeFilter === 'Unread' ? !notification.read : notification.type === activeFilter))
  const markAllRead = () => setNotifications(current => current.map(notification => ({ ...notification, read:true })))
  const toggleRead = (id:number) => setNotifications(current => current.map(notification => notification.id === id ? { ...notification, read:!notification.read } : notification))

  return <main className="p-8">
    <div className="flex items-start justify-between gap-4"><div><h1 className="page-title">Notifications</h1><p className="muted mt-2">Stay on top of your hiring activity.</p></div><button onClick={markAllRead} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"><CheckCheck className="size-4"/>Mark all as read</button></div>
    <div className="mt-7 flex gap-2 overflow-x-auto pb-1">{filters.map(filter => <button key={filter} onClick={() => setActiveFilter(filter)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeFilter === filter ? 'grad-accent text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700'}`}>{filter}</button>)}</div>
    <section className="card mt-5 divide-y divide-slate-100 overflow-hidden">{visibleNotifications.length ? visibleNotifications.map(notification => { const Icon = typeIcons[notification.type]; return <article key={notification.id} className={`flex gap-4 p-5 transition ${notification.read ? 'bg-white' : 'bg-blue-50/50'}`}><div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${typeStyles[notification.type]}`}><Icon className="size-5"/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900">{notification.title}</h2><Badge className={typeStyles[notification.type]}>{notification.type}</Badge>{!notification.read && <span className="size-2 rounded-full bg-blue-600" aria-label="Unread"/>}</div><p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p><p className="mt-2 text-xs text-slate-400">{notification.createdAt}</p></div><button onClick={() => toggleRead(notification.id)} className="shrink-0 self-start rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800">Mark as {notification.read ? 'unread' : 'read'}</button></article> }) : <div className="p-12 text-center"><Bell className="mx-auto size-8 text-slate-300"/><p className="mt-3 text-sm text-slate-500">No notifications match this filter.</p></div>}</section>
  </main>
}
