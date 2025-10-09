import { Router } from 'express'
import { authentication } from '../authentication/middlewares'
import collaborator from '../controllers/collaborator'
import middlewares from '../shared/middlewares'

const routerCollaborator = Router()

routerCollaborator.post(
  '/',
  [authentication, middlewares.events.findEvent],
  collaborator.add
)

routerCollaborator.get(
  '/search',
  [authentication],
  collaborator.searchCollaborator
)

routerCollaborator.get(
  '/',
  [authentication, middlewares.events.findEvent],
  collaborator.findByEventId
)

routerCollaborator.delete(
  '/',
  [authentication, middlewares.events.findEvent],
  collaborator.remove
)

export default routerCollaborator
