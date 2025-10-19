import { Request, Response } from 'express'
import { ENV_VARS } from '../..'
import { User } from '../authentication/db'
import { FcStatusValues } from '../authentication/http/api-responses'
import { HandleResponse } from '../authentication/http/http-responses'
import Pagination from '../database/pagination'
import { dbUser2 } from '../database/users'
import { isInteger } from '../utils/tasks'

const ammountPage = 30

const findAll = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)

  const gender = req.query.gender === 'ALL' ? undefined : req.query.gender
  const page = isInteger(req.query.page) ? Number(req.query.page) : 1

  const statusC1 = await dbUser2.findAllUsers(true, gender)

  if (statusC1.type === FcStatusValues.SUCESS) {
    const pagination = new Pagination(
      Number((statusC1.data as any).count),
      page,
      ENV_VARS.pagination
    )
    const statusD = await dbUser2.findAllUsers(
      false,
      gender,
      pagination.getLimit()
    )
    if (statusD.type === FcStatusValues.SUCESS) {
      const data = (statusD.data as User[]).map(
        ({ token, hash_confirmation, access, password, ...item }) => item
      )
      return response.responsePagined(data, 1, 1)
    }
  } else {
    return response.serverError(statusC1.data)
  }
}

const findByAge = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)

  const fromAge = isInteger(req.query.fromAge) ? req.query.fromAge : 0
  const toAge = isInteger(req.query.toAge) ? req.query.toAge : 150
  const gender = req.query.gender === 'ALL' ? undefined : req.query.gender
  const page = isInteger(req.query.page) ? Number(req.query.page) : 1

  if (
    isInteger(fromAge) &&
    isInteger(toAge) &&
    Number(fromAge) <= Number(toAge)
  ) {
    const statusC1 = await dbUser2.findByAge(
      true,
      Number(fromAge),
      Number(toAge),
      gender as any
    )

    if (statusC1.type === FcStatusValues.SUCESS) {
      const pagination = new Pagination(
        Number((statusC1.data as any).count),
        page,
        ENV_VARS.pagination
      )
      const statusD = await dbUser2.findByAge(
        false,
        Number(fromAge),
        Number(toAge),
        gender as any,
        pagination.getLimit()
      )
      if (statusD.type === FcStatusValues.SUCESS) {
        const data = (statusD.data as User[]).map(
          ({ token, hash_confirmation, access, password, ...item }) => item
        )
        return response.responsePagined(data, 1, 1)
      }
    } else {
      return response.serverError(statusC1.data)
    }
  } else {
    return response.badRequest(
      'Idades invalida, certifique que toAge é maior ou igual fromAge'
    )
  }
}

export default {
  findAll,
  findByAge,
}
