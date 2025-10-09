import { Router } from 'express'
import { authentication } from '../authentication/middlewares'
import guest from '../controllers/guest'
import middlewares from '../shared/middlewares'

const routerGuest = Router()

routerGuest.post('/', [authentication, middlewares.tables.findTable], guest.add)

routerGuest.get(
  '/',
  [authentication, middlewares.tables.findTable],
  guest.findByTableId
)

routerGuest.get(
  '/all',
  [authentication, middlewares.events.findEvent],
  guest.findAllGuest
)

routerGuest.get(
  '/check',
  [authentication, middlewares.events.findEvent, middlewares.guests.findGuest],
  guest.findCheckGuest
)

routerGuest.put(
  '/confirm',
  [authentication, middlewares.events.findEvent, middlewares.guests.findGuest],
  guest.confirmPresenceGuest
)

routerGuest.put(
  '/absense',
  [authentication, middlewares.events.findEvent, middlewares.guests.findGuest],
  guest.setAbsenseGuest
)

routerGuest.delete(
  '/',
  [authentication, middlewares.guests.findGuest],
  guest.remove
)

export default routerGuest
