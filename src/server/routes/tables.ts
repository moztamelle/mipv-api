import { Router } from 'express'
import { authentication } from '../authentication/middlewares'
import tables from '../controllers/tables'
import middlewares from '../shared/middlewares'

const routerTables = Router()

routerTables.post(
  '/',
  [authentication, middlewares.events.findEvent],
  tables.add
)

routerTables.put(
  '/',
  [authentication, middlewares.tables.findTable],
  tables.update
)

routerTables.get(
  '/',
  [authentication, middlewares.events.findEvent],
  tables.findTablesEvent
)

routerTables.delete(
  '/',
  [authentication, middlewares.tables.findTable],
  tables.remove
)

export default routerTables
