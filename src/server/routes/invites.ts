import { Router } from 'express'
import { authentication } from '../authentication/middlewares'
import invites from '../controllers/invites'
import { create, findInvite, update } from '../shared/middlewares/invites'

const routerInvites = Router()

routerInvites.post('/', [authentication, create], invites.add)
routerInvites.post(
  '/update',
  [authentication, findInvite, update],
  invites.update
)
routerInvites.get('/', [authentication], invites.findAll)
routerInvites.get('/type', [authentication], invites.findByType)
routerInvites.delete('/', [authentication, findInvite], invites.remove)

export default routerInvites
