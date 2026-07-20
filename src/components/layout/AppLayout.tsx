import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useState } from 'react'
export default function AppLayout(){const[collapsed,setCollapsed]=useState(()=>localStorage.getItem('talentflow-sidebar-collapsed')==='true');function toggle(){setCollapsed(value=>{const next=!value;localStorage.setItem('talentflow-sidebar-collapsed',String(next));return next})}return <div className="min-h-screen bg-[#f7f8fa]"><Sidebar collapsed={collapsed} onToggle={toggle}/><div className={`min-h-screen transition-[margin] duration-200 ${collapsed?'ml-20':'ml-64'}`}><Topbar/><Outlet/></div></div>}
