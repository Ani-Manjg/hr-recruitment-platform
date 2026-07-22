import type { ReactNode } from 'react'

export default function Badge({children,className=''}:{children:ReactNode;className?:string}) { return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{children}</span> }

export function ProgressBar({ value, className='' }:{value:number;className?:string}) { return <div className={`h-2 overflow-hidden rounded-full bg-slate-100 ${className}`} aria-label={`Match score ${value}%`}><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all" style={{ width:`${Math.min(100, Math.max(0, value))}%` }}/></div> }
