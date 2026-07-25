import { app } from './app.js'
import { config } from './config.js'

app.listen(config.PORT,'0.0.0.0',()=>{
  console.log(`TalentFlow API listening on port ${config.PORT}`)
})
