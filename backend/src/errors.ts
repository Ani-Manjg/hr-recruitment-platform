import type { ErrorRequestHandler, RequestHandler } from 'express'
import multer from 'multer'
import { ZodError } from 'zod'

export class HttpError extends Error{
  constructor(public status:number,message:string,public details?:unknown){super(message)}
}

export const notFound:RequestHandler=(_request,_response,next)=>next(new HttpError(404,'The requested resource was not found.'))

export const errorHandler:ErrorRequestHandler=(error,_request,response,_next)=>{
  if(error instanceof multer.MulterError)return response.status(error.code==='LIMIT_FILE_SIZE'?413:400).json({error:error.code==='LIMIT_FILE_SIZE'?'The uploaded document is too large.':'The uploaded document is invalid.'})
  if(error instanceof ZodError)return response.status(400).json({error:'Please check the submitted information.',details:error.flatten()})
  if(error instanceof HttpError)return response.status(error.status).json({error:error.message,details:error.details})
  console.error(error)
  return response.status(500).json({error:'An unexpected server error occurred.'})
}
