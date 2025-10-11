import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { faleConnosco } from './authentication/controller'
import { HTTP_STATUS } from './authentication/http/http-responses'
import authRouter from './authentication/route'
import afiliastesRouter from './routes/afiliastes'
import mediaRouter from './routes/media'
import { app, server } from './socket/socket'
import LocalStorage from './utils/storage/storage'

app.use(cors())
app.use(express.json())
app.set('view engine', 'jade')

app.use('/api/user', authRouter)
app.use('/api/afiliastes', afiliastesRouter)
app.use('/api/media', mediaRouter)
app.post('/api/talkwithus', faleConnosco)

app.get('/api/file/:filename', (req, res) => {
  const fileName = (req.params as any).filename as string
  const status = LocalStorage.getFile(fileName)
  if (status.status === 'SUCCESS') {
    return res.download(status.data)
  } else {
    return res.status(404).json(status.data)
  }
})

app.use('/api', (req, res) => {
  return res.status(200).json({
    status: HTTP_STATUS.SUCCESS,
    name: 'MIPV Api',
    author: 'Francisco Tamele',
    dateCreation: '22-03-2024',
  })
})

// 404 unknown route
app.use(async (req, res) => {
  return res.send('Página não encontrada.')
})

export { server }
