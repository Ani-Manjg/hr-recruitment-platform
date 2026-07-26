import { BrainCircuit, Eye, Loader2, LockKeyhole, Mail, Users } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { api, ApiError, apiErrorMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'

type Mode='login'|'register'|'forgot'|'reset'
export default function Login(){
  const{login,register,isAuthenticated}=useAuth(),navigate=useNavigate(),location=useLocation(),[searchParams]=useSearchParams()
  const invitationToken=searchParams.get('invitationToken')||undefined
  const initialResetToken=searchParams.get('resetToken')||searchParams.get('token')||''
  const[mode,setMode]=useState<Mode>(initialResetToken?'reset':invitationToken?'register':'login')
  const[form,setForm]=useState({email:'',password:'',name:'',companyName:'',resetToken:initialResetToken})
  const[show,setShow]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(searchParams.get('passwordChanged')?'Password changed. Sign in with your new password.':''),[developmentToken,setDevelopmentToken]=useState('')
  if(isAuthenticated)return <Navigate to="/" replace/>
  const update=(field:keyof typeof form,value:string)=>setForm(current=>({...current,[field]:value}))
  const switchMode=(next:Mode)=>{setMode(next);setError('');setMessage('');setDevelopmentToken('')}
  async function submit(event:FormEvent){
    event.preventDefault();setError('');setMessage('')
    if(mode!=='reset'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())){setError('Enter a valid email address.');return}
    if(mode==='register'||mode==='reset'){const passwordError=validatePassword(form.password);if(passwordError){setError(passwordError);return}}
    if(mode==='login'&&!form.password){setError('Password is required.');return}
    if(mode==='register'&&(!form.name.trim()||(!invitationToken&&!form.companyName.trim()))){setError(invitationToken?'Name is required.':'Name and company name are required.');return}
    if(mode==='reset'&&!form.resetToken.trim()){setError('A password-reset token is required.');return}
    setLoading(true)
    try{
      if(mode==='login'){
        await login(form.email.trim(),form.password)
        const destination=(location.state as {from?:{pathname?:string}}|null)?.from?.pathname||'/'
        navigate(destination,{replace:true})
      }else if(mode==='register'){
        await register({email:form.email.trim(),password:form.password,name:form.name.trim(),companyName:invitationToken?undefined:form.companyName.trim(),invitationToken})
        navigate('/',{replace:true})
      }else if(mode==='forgot'){
        const result=await api.auth.forgotPassword(form.email.trim())
        setMessage('If an account exists for that email, password reset instructions have been created.')
        setDevelopmentToken(result.developmentResetToken||'')
      }else{
        await api.auth.resetPassword({token:form.resetToken.trim(),newPassword:form.password})
        switchMode('login');setMessage('Password reset successfully. Sign in with your new password.')
      }
    }catch(caught){setError(mode==='login'&&caught instanceof ApiError&&caught.status===401?'Email or password is incorrect.':apiErrorMessage(caught))}finally{setLoading(false)}
  }
  const title=mode==='login'?'Sign in to your account':mode==='register'?'Start recruiting':mode==='forgot'?'Recover your account':'Choose a new password'
  return <main className="grid min-h-screen lg:grid-cols-2"><section className="relative hidden overflow-hidden bg-[#111b3d] p-14 text-white lg:flex lg:flex-col"><div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,.45),transparent_35%),radial-gradient(circle_at_75%_65%,rgba(124,58,237,.4),transparent_32%)]"/><div className="relative flex items-center gap-3"><div className="grad-accent grid size-11 place-items-center rounded-xl"><Users/></div><span className="text-xl font-bold">TalentFlow HR</span></div><div className="relative my-auto max-w-lg"><BrainCircuit className="mb-7 size-16 rounded-2xl bg-white/10 p-4 text-blue-300"/><h1 className="text-5xl font-bold leading-tight">Smarter hiring starts with better insights.</h1><p className="mt-6 text-lg leading-8 text-blue-100/70">Secure, collaborative recruitment powered by structured candidate analysis.</p></div></section>
    <section className="flex items-center justify-center bg-white p-7"><div className="w-full max-w-md"><p className="text-sm font-semibold uppercase tracking-[.2em] text-blue-600">{mode==='register'?'Create workspace':'TalentFlow access'}</p><h2 className="mt-3 text-4xl font-bold">{title}</h2>
      {!invitationToken&&mode!=='reset'&&mode!=='forgot'&&<div className="mt-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-semibold"><button onClick={()=>switchMode('login')} className={`rounded-lg py-2 ${mode==='login'?'bg-white text-blue-600 shadow-sm':'text-slate-500'}`}>Sign in</button><button onClick={()=>switchMode('register')} className={`rounded-lg py-2 ${mode==='register'?'bg-white text-blue-600 shadow-sm':'text-slate-500'}`}>Register</button></div>}
      <form className="mt-7 space-y-4" onSubmit={submit} noValidate>
        {mode==='register'&&<><Field label="Full name" value={form.name} onChange={value=>update('name',value)}/>{!invitationToken&&<Field label="Company name" value={form.companyName} onChange={value=>update('companyName',value)}/>} {invitationToken&&<p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">You are joining through a secure invitation.</p>}</>}
        {mode!=='reset'&&<label className="block"><span className="mb-2 block text-sm font-semibold">Work email</span><span className="flex h-12 items-center gap-3 rounded-xl border px-4 focus-within:border-blue-500"><Mail className="size-4 text-slate-400"/><input value={form.email} onChange={event=>update('email',event.target.value)} type="email" autoComplete="email" className="w-full outline-none" placeholder="you@company.com"/></span></label>}
        {(mode==='login'||mode==='register'||mode==='reset')&&<label className="block"><span className="mb-2 block text-sm font-semibold">{mode==='reset'?'New password':'Password'}</span><span className="flex h-12 items-center gap-3 rounded-xl border px-4 focus-within:border-blue-500"><LockKeyhole className="size-4 text-slate-400"/><input value={form.password} onChange={event=>update('password',event.target.value)} type={show?'text':'password'} autoComplete={mode==='login'?'current-password':'new-password'} className="w-full outline-none" placeholder={mode==='login'?'Enter your password':'12–128 characters with mixed types'}/><button type="button" onClick={()=>setShow(value=>!value)}><Eye className="size-4 text-slate-400"/></button></span>{mode!=='login'&&<span className="mt-2 block text-xs text-slate-500">Uppercase, lowercase, number, and special character required.</span>}</label>}
        {mode==='reset'&&!initialResetToken&&<Field label="Reset token" value={form.resetToken} onChange={value=>update('resetToken',value)}/>}
        {error&&<p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p>}{message&&<p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
        {developmentToken&&<button type="button" onClick={()=>{update('resetToken',developmentToken);switchMode('reset')}} className="w-full rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">Use development reset token</button>}
        <button disabled={loading} className="grad-accent flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-white disabled:opacity-70">{loading&&<Loader2 className="size-4 animate-spin"/>}{loading?'Please wait…':mode==='login'?'Sign In':mode==='register'?'Create Account':mode==='forgot'?'Send reset instructions':'Reset password'}</button>
      </form>
      {mode==='login'&&<button onClick={()=>switchMode('forgot')} className="mt-5 w-full text-center text-sm font-semibold text-blue-600">Forgot password?</button>}{(mode==='forgot'||mode==='reset')&&<button onClick={()=>switchMode('login')} className="mt-5 w-full text-center text-sm font-semibold text-blue-600">Back to sign in</button>}
    </div></section>
  </main>
}
function Field({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}){return <label className="block text-sm font-semibold">{label}<input value={value} onChange={event=>onChange(event.target.value)} className="mt-2 h-12 w-full rounded-xl border px-4 outline-none focus:border-blue-500"/></label>}
function validatePassword(value:string){if(value.length<12||value.length>128)return'Password must contain between 12 and 128 characters.';if(!/[A-Z]/.test(value))return'Password must contain an uppercase letter.';if(!/[a-z]/.test(value))return'Password must contain a lowercase letter.';if(!/\d/.test(value))return'Password must contain a number.';if(!/[^A-Za-z0-9]/.test(value))return'Password must contain a special character.';return''}
