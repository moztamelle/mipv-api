import { Router } from 'express'
import { authentication } from '../authentication/middlewares'
import { findAll } from '../controllers/notifications'

const routerNotification = Router()

routerNotification.get('/', [authentication], findAll)

export default routerNotification
