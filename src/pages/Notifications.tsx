import { Bell, CheckCheck, FileText, Loader2, UserCheck, UserMinus, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { api, apiErrorMessage } from '../api/client'
import Badge from '../components/ui/Badge'
import type { NotificationItem, NotificationType } from '../types'

type Filter='All'|'Unread'|NotificationType
const filters:Filter[]=['All','Unread','candidate','application','shortlist','reject']
const icons={candidate:Users,application:FileText,shortlist:UserCheck,reject:UserMinus}
const styles={candidate:'bg-blue-100 text-blue-700',application:'bg-violet-100 text-violet-700',shortlist:'bg-emerald-100 text-emerald-700',reject:'bg-rose-100 text-rose-700'}
export default function Notifications(){
  const[items,setItems]=useState<NotificationItem[]>([]),[filter,setFilter]=useState<Filter>('All'),[loading,setLoading]=useState(true),[error,setError]=useState('')
  const load=useCallback(async()=>{setLoading(true);setError('');try{setItems(await api.notifications.list({unread:filter==='Unread'?true:undefined,type:filter!=='All'&&filter!=='Unread'?filter:undefined}))}catch(caught){setError(apiErrorMessage(caught))}finally{setLoading(false)}},[filter])
  useEffect(()=>{void load()},[load])
  async function read(id:string){try{await api.notifications.markRead(id);await load()}catch(caught){setError(apiErrorMessage(caught))}}
  async function readAll(){try{await api.notifications.markAllRead();await load()}catch(caught){setError(apiErrorMessage(caught))}}
  return <main className="p-8"><div className="flex justify-between gap-4"><div><h1 className="page-title">Notifications</h1><p className="muted mt-2">Stay on top of your hiring activity.</p></div><button onClick={readAll} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700"><CheckCheck className="size-4"/>Mark all as read</button></div><div className="mt-7 flex gap-2 overflow-x-auto">{filters.map(value=><button key={value} onClick={()=>setFilter(value)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${filter===value?'grad-accent text-white':'border bg-white text-slate-600'}`}>{value}</button>)}</div>{error&&<p className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}{loading?<div className="grid h-56 place-items-center"><Loader2 className="size-7 animate-spin text-blue-600"/></div>:<section className="card mt-5 divide-y overflow-hidden">{items.length?items.map(item=>{const Icon=icons[item.type];return <article key={item.id} className={`flex gap-4 p-5 ${item.read?'bg-white':'bg-blue-50/50'}`}><div className={`grid size-10 shrink-0 place-items-center rounded-lg ${styles[item.type]}`}><Icon className="size-5"/></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="font-semibold">{item.title}</h2><Badge className={styles[item.type]}>{item.type}</Badge></div><p className="mt-1 text-sm text-slate-600">{item.detail}</p><p className="mt-2 text-xs text-slate-400">{item.time}</p></div>{!item.read&&<button onClick={()=>read(item.id)} className="self-start rounded-lg px-2 py-1 text-xs font-semibold text-blue-600">Mark read</button>}</article>}):<div className="p-12 text-center"><Bell className="mx-auto size-8 text-slate-300"/><p className="mt-3 text-sm text-slate-500">No notifications match this filter.</p></div>}</section>}</main>
}
