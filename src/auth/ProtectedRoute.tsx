import { Loader2 } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function ProtectedRoute(){const{isLoading,isAuthenticated}=useAuth();const location=useLocation();if(isLoading)return <main className="grid min-h-screen place-items-center bg-slate-50"><Loader2 className="size-8 animate-spin text-blue-600"/></main>;return isAuthenticated?<Outlet/>:<Navigate to="/login" replace state={{from:location}}/>}
