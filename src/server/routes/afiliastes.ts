import { Router } from 'express'
import affiliates from '../controllers/affiliates'
import * as middlewares from './../authentication/middlewares'
import * as middlewaresAfiliaste from './../middlewares/afiliaste'

const afiliastesRouter = Router()

afiliastesRouter.post(
  '/',
  [middlewares.authentication, middlewaresAfiliaste.add_user],
  affiliates.add
)

afiliastesRouter.get('/', [middlewares.authentication], affiliates.get)

afiliastesRouter.get(
  '/brothers',
  [middlewares.authentication],
  affiliates.getBrothers
)

afiliastesRouter.post(
  '/update',
  [
    middlewares.authentication,
    middlewaresAfiliaste.findById,
    middlewaresAfiliaste.update,
  ],
  affiliates.update
)

afiliastesRouter.delete(
  '/',
  [middlewares.authentication, middlewaresAfiliaste.findById],
  affiliates.remove
)

export default afiliastesRouter
