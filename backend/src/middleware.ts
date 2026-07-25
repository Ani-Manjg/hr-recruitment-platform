import type { NextFunction, Request, Response } from 'express'
import { HttpError } from './errors.js'
import { verifyAccess } from './security.js'
import type { AuthRequest, Role } from './types.js'

export function authenticate(request:Request,_response:Response,next:NextFunction){
  const header=request.headers.authorization
  if(!header?.startsWith('Bearer '))return next(new HttpError(401,'Authentication is required.'))
  try{(request as AuthRequest).auth=verifyAccess(header.slice(7));return next()}catch{return next(new HttpError(401,'Your session has expired.'))}
}
export const requireRole=(role:Role)=>(request:Request,_response:Response,next:NextFunction)=>{
  if((request as AuthRequest).auth.role!==role)return next(new HttpError(403,'You do not have permission to perform this action.'))
  return next()
}
