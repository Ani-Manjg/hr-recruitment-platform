import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import CandidateManagement from './pages/CandidateManagement'
import CandidateDetails from './pages/CandidateDetails'
import JobManagement from './pages/JobManagement'
import AIAnalysis from './pages/AIAnalysis'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'

export default function App() { return <Routes><Route path="/login" element={<Login/>}/><Route element={<AppLayout/>}><Route index element={<Dashboard/>}/><Route path="candidates" element={<CandidateManagement/>}/><Route path="candidates/:id" element={<CandidateDetails/>}/><Route path="jobs" element={<JobManagement/>}/><Route path="ai-analysis" element={<AIAnalysis/>}/><Route path="notifications" element={<Notifications/>}/><Route path="settings" element={<Settings/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes> }
