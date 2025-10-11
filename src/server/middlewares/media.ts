import { NextFunction, Request, Response } from 'express'
import { FcStatusValues } from '../authentication/http/api-responses'
import { HandleResponse } from '../authentication/http/http-responses'
import { dbMedia } from '../database/media'

export const findById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const response = new HandleResponse(req, res)

  const idMedia = Number(req.query.media)

  if (isNaN(idMedia)) {
    return response.badRequest('Forneça o id do media!')
  }

  const status = await dbMedia.findById(idMedia)
  if (status.type === FcStatusValues.SUCESS) {
    req.params.media = JSON.stringify(status.data)
    next()
  } else if (status.type === FcStatusValues.NOT_FOUND) {
    return response.notFound('Não foi achado filiado com id ' + idMedia)
  } else {
    return response.serverError(status.data)
  }
}
