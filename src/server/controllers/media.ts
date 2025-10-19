import { Request, Response } from 'express'
import { ENV_VARS } from '../..'
import { FcStatusValues } from '../authentication/http/api-responses'
import { HandleResponse } from '../authentication/http/http-responses'
import { dbMedia } from '../database/media' // Ajuste o caminho conforme necessário
import Pagination from '../database/pagination'
import { Media } from '../types/media'

/**
 * Método responsável por adicionar nova media
 * @param req
 * @param res
 * @returns
 */
const add = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)
  const media: Media = req.body as Media

  const statusDB = await dbMedia.add(media)

  if (statusDB.type === FcStatusValues.SUCESS) {
    const newMedia = statusDB.data as Media & { id: number }
    return res.status(201).json(newMedia)
  } else {
    return response.serverError(String(statusDB.data))
  }
}

/**
 * Método responsável por atualizar a media
 * @param req
 * @param res
 */
const update = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)
  const mediaId = parseInt(req.params.id)
  const mediaUpdate = req.body as Media

  const media = {
    id: mediaId,
    ...mediaUpdate,
  }

  const status = await dbMedia.update(media)

  if (status.type === FcStatusValues.SUCESS) {
    return response.sucess(media)
  } else {
    return response.serverError(String(status.data))
  }
}

/**
 * Método responsável por remover media
 * @param req
 * @param res
 */
const remove = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)
  const mediaId = (JSON.parse(req.params.media) as Media).id

  const status = await dbMedia.deleteById(Number(mediaId))

  if (status.type === FcStatusValues.SUCESS) {
    return response.sucess(null)
  } else {
    return response.serverError(String(status.data))
  }
}

const findAll = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)

  const params = req.query as any

  const statusD1 = await dbMedia.findAll(true, params.media)
  if (statusD1.type === FcStatusValues.SUCESS) {
    const pagination = new Pagination(
      Number(statusD1.data),
      params.page ?? 1,
      ENV_VARS.pagination
    )
    const statusD2 = await dbMedia.findAll(
      false,
      params.media,
      pagination.getLimit()
    )

    if (statusD2.type === FcStatusValues.SUCESS) {
      return response.responsePagined(
        statusD2.data,
        pagination.getCurrentPage(),
        pagination.getTotalPages()
      )
    } else {
      return response.serverError(statusD1.data)
    }
  } else {
    return response.serverError(statusD1.data)
  }
}

const findByDate = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)

  const params = req.query as any

  const statusD1 = await dbMedia.findByDate(true, params.media, params.date)
  if (statusD1.type === FcStatusValues.SUCESS) {
    const pagination = new Pagination(
      Number(statusD1.data),
      params.page ?? 1,
      ENV_VARS.pagination
    )
    const statusD2 = await dbMedia.findByDate(
      false,
      params.media,
      params.date,
      pagination.getLimit()
    )

    if (statusD2.type === FcStatusValues.SUCESS) {
      return response.responsePagined(
        statusD2.data,
        pagination.getCurrentPage(),
        pagination.getTotalPages()
      )
    } else {
      return response.serverError(statusD1.data)
    }
  } else {
    return response.serverError(statusD1.data)
  }
}

const findByTitle = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)

  const params = req.query as any

  const statusD1 = await dbMedia.findByTitle(true, params.media, params.title)
  if (statusD1.type === FcStatusValues.SUCESS) {
    const pagination = new Pagination(
      Number(statusD1.data),
      params.page ?? 1,
      ENV_VARS.pagination
    )
    const statusD2 = await dbMedia.findByTitle(
      false,
      params.media,
      params.title,
      pagination.getLimit()
    )

    if (statusD2.type === FcStatusValues.SUCESS) {
      return response.responsePagined(
        statusD2.data,
        pagination.getCurrentPage(),
        pagination.getTotalPages()
      )
    } else {
      return response.serverError(statusD1.data)
    }
  } else {
    return response.serverError(statusD1.data)
  }
}

export default {
  add,
  update,
  remove,
  findByDate,
  findByTitle,
  findAll,
}
