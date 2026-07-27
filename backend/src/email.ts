import { config } from './config.js'

type BrevoError={message?:string}

export function passwordResetLink(token:string){
  const url=new URL(config.PASSWORD_RESET_URL||'/login',config.FRONTEND_ORIGIN)
  url.searchParams.set('resetToken',token)
  return url.toString()
}

export async function sendPasswordResetEmail(to:string,token:string){
  if(!config.BREVO_API_KEY||!config.EMAIL_FROM)throw new Error('Password reset email is not configured.')
  const link=passwordResetLink(token)
  const response=await fetch('https://api.brevo.com/v3/smtp/email',{
    method:'POST',
    headers:{'api-key':config.BREVO_API_KEY,'Content-Type':'application/json','accept':'application/json'},
    body:JSON.stringify({
      sender:{name:config.EMAIL_FROM_NAME,email:config.EMAIL_FROM},
      to:[{email:to}],
      subject:'Reset your TalentFlow HR password',
      htmlContent:`<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#172033"><div style="max-width:560px;margin:40px auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:32px"><div style="font-size:20px;font-weight:700;color:#4f46e5">TalentFlow HR</div><h1 style="font-size:26px;margin:24px 0 12px">Reset your password</h1><p style="line-height:1.6;color:#475569">We received a request to reset your TalentFlow HR password. This secure link expires in 60 minutes and can only be used once.</p><p style="margin:28px 0"><a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:10px">Choose a new password</a></p><p style="font-size:13px;line-height:1.6;color:#64748b">If you did not request this, you can safely ignore this email. Your password will not change.</p></div></body></html>`,
      textContent:`Reset your TalentFlow HR password\n\nOpen this link within 60 minutes:\n${link}\n\nIf you did not request this, ignore this email.`,
    }),
  })
  if(!response.ok){
    const error=await response.json().catch(()=>({})) as BrevoError
    throw new Error(error.message||`Brevo returned HTTP ${response.status}.`)
  }
}
