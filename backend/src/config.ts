import { z } from 'zod'

const booleanString=z.enum(['true','false']).transform(value=>value==='true')
const schema=z.object({
  NODE_ENV:z.enum(['development','test','production']).default('development'),
  PORT:z.coerce.number().int().positive().default(3000),
  FRONTEND_ORIGIN:z.string().url(),
  COOKIE_SECURE:booleanString.default(false),
  COOKIE_SAME_SITE:z.enum(['lax','strict','none']).default('lax'),
  SUPABASE_URL:z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY:z.string().min(20),
  JWT_ACCESS_SECRET:z.string().min(32),
  JWT_REFRESH_SECRET:z.string().min(32),
  TOKEN_HASH_SECRET:z.string().min(32),
  BREVO_API_KEY:z.string().min(20).optional(),
  EMAIL_FROM:z.string().min(3).optional(),
  EMAIL_FROM_NAME:z.string().min(1).default('TalentFlow HR'),
  PASSWORD_RESET_URL:z.string().url().optional(),
  GEMINI_API_KEY:z.string().optional(),
  GEMINI_MODEL:z.string().default('gemini-3.5-flash-lite'),
  CANDIDATE_RETENTION_DAYS:z.coerce.number().int().positive().default(365),
})

const parsed=schema.safeParse(process.env)
if(!parsed.success){
  console.error('Invalid backend environment:',z.treeifyError(parsed.error))
  process.exit(1)
}
export const config=parsed.data
