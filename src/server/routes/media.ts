import { Router } from 'express'
import medias from '../controllers/media'
import { findById } from '../middlewares/media'
import * as middlewares from './../authentication/middlewares'

const mediaRouter = Router()

mediaRouter.post('/', [middlewares.authentication], medias.add)

mediaRouter.post(
  '/update',
  [middlewares.authentication, findById],
  medias.update
)

mediaRouter.delete('/', [middlewares.authentication, findById], medias.remove)

mediaRouter.get('/', [], medias.findAll)

mediaRouter.get('/date', [], medias.findByDate)

mediaRouter.get('/title', [], medias.findByTitle)

export default mediaRouter
