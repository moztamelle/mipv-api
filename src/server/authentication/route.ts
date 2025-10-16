import { Router } from 'express'
import user from './controller'
import * as middlewares from './middlewares'

const authRouter = Router()

authRouter.post(
  '/authentication',
  [middlewares.v_authentication],
  user.authentication
)

authRouter.post('/signup', [middlewares.add_user], user.add)

authRouter.post(
  '/update',
  [middlewares.authentication, middlewares.update],
  user.update
)

authRouter.post('/resend', user.resendCode)

authRouter.post('/recover', user.recoverAccount)

authRouter.post(
  '/confirmation',
  [
    middlewares.confirmation_queries,
    middlewares.v_confirmation,
    middlewares.confirmation,
  ],
  user.confirmationHash
)

authRouter.post(
  '/reset-password',
  [
    middlewares.confirmation_queries,
    middlewares.confirmation,
    middlewares.resetPassword,
  ],
  user.resetPassword
)

authRouter.get(
  '/search',
  [
    middlewares.authentication
  ],
  user.searchByName
)

export default authRouter
