import { createClient } from '@supabase/supabase-js'
import { config } from './config.js'

export const db=createClient(config.SUPABASE_URL,config.SUPABASE_SERVICE_ROLE_KEY,{
  auth:{persistSession:false,autoRefreshToken:false},
})

export function assertData<T>(data:T|null,error:{message:string}|null):T{
  if(error)throw new Error(error.message)
  if(data===null)throw new Error('Database returned no data.')
  return data
}
