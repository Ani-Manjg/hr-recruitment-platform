import type { Request } from 'express'

export type Role='ADMIN'|'RECRUITER'
export type AuthUser={id:string;companyId:string;role:Role;email:string;name:string}
export type AuthRequest=Request&{auth:AuthUser}

declare global{
  namespace Express{
    interface Request{
      auth:AuthUser
    }
  }
}
