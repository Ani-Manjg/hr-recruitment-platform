import {
  BarChart3, BriefcaseBusiness, BrainCircuit, ChevronLeft, ChevronRight,
  LayoutGrid, LogOut, Settings, Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid },
  { to: '/candidates', label: 'Candidate Management', icon: Users },
  { to: '/jobs', label: 'Job Management', icon: BriefcaseBusiness },
  { to: '/ai-analysis', label: 'AI Analysis', icon: BrainCircuit },
  { to: '/statistics', label: 'Statistics', icon: BarChart3 },
]

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const itemClass = 'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition md:justify-center md:px-2 lg:justify-start lg:gap-3 lg:px-4'
  const label = (text: string) => <>
    <span className={`whitespace-nowrap md:hidden ${collapsed ? 'lg:hidden' : 'lg:inline'}`}>{text}</span>
    <span className={`pointer-events-none absolute left-[calc(100%+12px)] z-50 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition group-hover:opacity-100 md:block ${collapsed ? 'lg:block' : 'lg:hidden'}`}>{text}</span>
  </>

  return <>
    <button aria-label="Close navigation" onClick={onMobileClose} className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition-opacity md:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white p-4 transition-[transform,width] duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:w-20 md:translate-x-0 ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}>
      <NavLink to="/" onClick={onMobileClose} aria-label="TalentFlow HR dashboard" className="flex items-center gap-3 px-1 py-2 md:justify-center md:px-0 lg:justify-start lg:px-1">
        <div className="grad-accent grid size-11 shrink-0 place-items-center rounded-xl text-white"><Users className="size-6" /></div>
        <span className={`whitespace-nowrap text-xl font-bold tracking-tight md:hidden ${collapsed ? 'lg:hidden' : 'lg:inline'}`}>TalentFlow HR</span>
      </NavLink>
      <nav className="mt-9 space-y-2">
        {nav.map(({ to, label: navLabel, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} onClick={onMobileClose} title={collapsed ? navLabel : undefined} className={({ isActive }) => `${itemClass} ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><Icon className="size-5 shrink-0" />{label(navLabel)}</NavLink>)}
      </nav>
      <div className="mt-auto space-y-1 border-t border-slate-100 pt-5">
        <NavLink to="/settings" onClick={onMobileClose} className={`${itemClass} text-slate-500 hover:bg-slate-50`}><Settings className="size-5 shrink-0" />{label('Settings')}</NavLink>
        <NavLink to="/login" onClick={onMobileClose} className={`${itemClass} text-slate-400 hover:bg-slate-50`}><LogOut className="size-5 shrink-0" />{label('Sign Out')}</NavLink>
        <button type="button" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className={`${itemClass} hidden w-full text-slate-500 hover:bg-slate-50 hover:text-blue-600 lg:flex`}>
          {collapsed ? <ChevronRight className="size-5" /> : <><ChevronLeft className="size-5" /><span>Collapse sidebar</span></>}
        </button>
      </div>
    </aside>
  </>
}
