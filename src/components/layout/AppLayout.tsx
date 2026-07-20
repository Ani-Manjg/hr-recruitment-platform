import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
export default function AppLayout(){return <div className="min-h-screen bg-[#f7f8fa]"><Sidebar/><div className="ml-64 min-h-screen"><Topbar/><Outlet/></div></div>}
