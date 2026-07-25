import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { config } from './config.js'
import { errorHandler, notFound } from './errors.js'
import aiRouter from './routes/ai.js'
import auditRouter from './routes/audit.js'
import authRouter from './routes/auth.js'
import candidatesRouter from './routes/candidates.js'
import companyRouter from './routes/company.js'
import interviewsRouter from './routes/interviews.js'
import jobsRouter from './routes/jobs.js'
import notificationsRouter from './routes/notifications.js'
import statsRouter from './routes/stats.js'
import usersRouter from './routes/users.js'

export const app=express()
app.set('trust proxy',1)
app.disable('x-powered-by')
app.use(helmet())
app.use(cors({origin:config.FRONTEND_ORIGIN,credentials:true}))
app.use(express.json({limit:'1mb'}))
app.use(cookieParser())
app.use(rateLimit({windowMs:60_000,limit:180,standardHeaders:'draft-8',legacyHeaders:false}))

app.get('/health',(_request,response)=>response.json({status:'ok'}))

app.use('/api/auth',authRouter)
app.use('/api/users',usersRouter)
app.use('/api/company',companyRouter)
app.use('/api/jobs',jobsRouter)
app.use('/api/candidates',candidatesRouter)
app.use('/api/ai',aiRouter)
app.use('/api/notifications',notificationsRouter)
app.use('/api/stats',statsRouter)
app.use('/api/interviews',interviewsRouter)
app.use('/api/audit',auditRouter)

app.use(notFound)
app.use(errorHandler)
