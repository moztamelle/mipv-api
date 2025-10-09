import { Router } from 'express'
import { authentication } from '../authentication/middlewares'
import { eventOverview } from '../controllers/event-action'
import events from '../controllers/events'
import { findEvent, updateModelInvite } from '../shared/middlewares/events'
import { findInvite } from '../shared/middlewares/invites'

const routerEvents = Router()

routerEvents.get('/', [authentication], events.find)

routerEvents.put('/', [authentication, findEvent], events.update)

routerEvents.put('/status', [authentication, findEvent], events.changeStatus)

routerEvents.get('/role', [authentication, findEvent], events.findEventRole)

routerEvents.get('/overview', [authentication, findEvent], eventOverview)

routerEvents.get(
  '/search',
  [authentication, findEvent],
  events.findSearchGuestEvent
)
routerEvents.get(
  '/offline',
  [authentication, findEvent],
  events.findAllForOfflineUse
)

routerEvents.get('/services', [authentication], events.findEventServicesPaid)

routerEvents.post(
  '/invite/update',
  [authentication, findInvite, updateModelInvite],
  events.updateEventModelInvite
)

export default routerEvents
