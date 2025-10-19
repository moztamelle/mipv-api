import { Router } from 'express'
import { authentication, isAdmin } from '../authentication/middlewares'
import users from './../controllers/users'

const usersAdmin = Router()

usersAdmin.get('/', [authentication, isAdmin], users.findAll)

usersAdmin.get('/age', [authentication, isAdmin], users.findByAge)

usersAdmin.get('/name', [authentication, isAdmin], users.findByName)

export default usersAdmin
