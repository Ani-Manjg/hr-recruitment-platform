import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, clearApiSession, CSRF_STORAGE_KEY, seedCsrfToken, setApiSession, subscribeApiSession } from '../api/client'
import type { User } from '../types'

type RegisterInput={email:string;password:string;name:string;companyName?:string;invitationToken?:string}
type AuthContextValue={user:User|null;accessToken:string|null;csrfToken:string|null;isLoading:boolean;isAuthenticated:boolean;login:(email:string,password:string)=>Promise<void>;register:(input:RegisterInput)=>Promise<void>;refreshSession:()=>Promise<void>;logout:()=>Promise<void>;changePassword:(currentPassword:string,newPassword:string)=>Promise<void>;updateCurrentUser:(user:User)=>void}
const AuthContext=createContext<AuthContextValue|null>(null)

export function AuthProvider({children}:{children:ReactNode}){
  const[user,setUser]=useState<User|null>(null),[accessToken,setAccessToken]=useState<string|null>(null),[csrfToken,setCsrfToken]=useState<string|null>(null),[isLoading,setIsLoading]=useState(true)
  const clear=useCallback(()=>{clearApiSession();setUser(null);setAccessToken(null);setCsrfToken(null)},[])
  const establish=useCallback((nextUser:User,nextAccessToken:string,nextCsrfToken:string)=>{setApiSession(nextAccessToken,nextCsrfToken);setUser(nextUser);setAccessToken(nextAccessToken);setCsrfToken(nextCsrfToken)},[])
  const refreshSession=useCallback(async()=>{const refreshed=await api.auth.refresh();setAccessToken(refreshed.accessToken);setCsrfToken(refreshed.csrfToken);setUser(await api.auth.me())},[])
  useEffect(()=>{localStorage.removeItem('talentflow-auth-token');const unsubscribe=subscribeApiSession(session=>{setAccessToken(session?.accessToken||null);setCsrfToken(session?.csrfToken||null);if(!session)setUser(null)});const savedCsrf=localStorage.getItem(CSRF_STORAGE_KEY);seedCsrfToken(savedCsrf);if(!savedCsrf){setIsLoading(false)}else{refreshSession().catch(clear).finally(()=>setIsLoading(false))}return unsubscribe},[clear,refreshSession])
  useEffect(()=>{const unauthorized=()=>clear();window.addEventListener('talentflow:unauthorized',unauthorized);return()=>window.removeEventListener('talentflow:unauthorized',unauthorized)},[clear])
  const login=useCallback(async(email:string,password:string)=>{const result=await api.auth.login({email,password});establish(result.user,result.accessToken,result.csrfToken)},[establish])
  const register=useCallback(async(input:RegisterInput)=>{const result=await api.auth.register(input);establish(result.user,result.accessToken,result.csrfToken)},[establish])
  const logout=useCallback(async()=>{try{await api.auth.logout()}finally{clear()}},[clear])
  const changePassword=useCallback(async(currentPassword:string,newPassword:string)=>{await api.auth.changePassword({currentPassword,newPassword});clear()},[clear])
  const updateCurrentUser=useCallback((nextUser:User)=>setUser(nextUser),[])
  const value=useMemo(()=>({user,accessToken,csrfToken,isLoading,isAuthenticated:Boolean(user&&accessToken),login,register,refreshSession,logout,changePassword,updateCurrentUser}),[user,accessToken,csrfToken,isLoading,login,register,refreshSession,logout,changePassword,updateCurrentUser])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('useAuth must be used inside AuthProvider');return value}
