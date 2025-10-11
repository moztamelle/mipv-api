import { Request, Response } from 'express'
import { User, UserType } from '../authentication/db'
import { FcStatusValues } from '../authentication/http/api-responses'
import { HandleResponse } from '../authentication/http/http-responses'
import { dbFiliaste } from '../database/afiliaste'
import Pagination from '../database/pagination'
import { Afiliaste } from '../types/afiliaste'
import LocalStorage from '../utils/storage/storage'

const ammountPage = 30

const get = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)
  const user = JSON.parse(req.params.user) as User

  const statusC1 = await dbFiliaste.findMyAfiliaste(true, Number(user.id))

  if (statusC1.type === FcStatusValues.SUCESS) {
    const pagination = new Pagination(
      Number((statusC1.data as any).count),
      1,
      100
    )
    const statusD = await dbFiliaste.findMyAfiliaste(
      false,
      Number(user.id),
      pagination.getLimit()
    )
    if (statusD.type === FcStatusValues.SUCESS) {
      const data = (statusD.data as User[]).map(
        ({
          token,
          hash_confirmation,
          status,
          access,
          password,
          email_whatsapp,
          ...item
        }) => item
      )
      return response.responsePagined(data, 1, 1)
    }
  } else {
    return response.serverError(statusC1.data)
  }
}

const getBrothers = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)
  const user = JSON.parse(req.params.user) as User

  const statusC1 = await dbFiliaste.findMyAfiliaste(true, 0)

  if (statusC1.type === FcStatusValues.SUCESS) {
    const pagination = new Pagination(
      Number((statusC1.data as any).count),
      1,
      ammountPage
    )
    const statusD = await dbFiliaste.findMyAfiliaste(
      false,
      0,
      pagination.getLimit()
    )
    if (statusD.type === FcStatusValues.SUCESS) {
      const data = (statusD.data as User[]).map(
        ({ token, hash_confirmation, status, access, password, ...item }) =>
          item
      )
      return response.responsePagined(data, 1, 1)
    }
  } else {
    return response.serverError(statusC1.data)
  }
}

/**
 * Metodo responsavél por adicionar novo usuário
 * @param req
 * @param res
 * @returns
 */
const add = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)
  const user = JSON.parse(req.params.user) as User
  const afiliaste: Afiliaste = req.body as Afiliaste

  afiliaste.phone = afiliaste.phone?.trim()
  afiliaste.token =
    afiliaste.type === UserType.AFILIADO ? String(user.id) : String(0)

  const statusDB1 = await dbFiliaste.add(afiliaste)

  if (statusDB1.type === FcStatusValues.SUCESS) {
    const afiliaste = statusDB1.data as Afiliaste

    const statusS2 = await LocalStorage.saveFile({
      fileName: `${afiliaste.id}-${afiliaste.photo.originalFilename}`,
      filePath: afiliaste.photo.path,
    })

    if (statusS2.status === 'SUCCESS') {
      afiliaste.photo = statusS2.data
      dbFiliaste.updatePhoto(afiliaste)
    }

    return res.status(201).json(afiliaste)
  } else {
    return response.serverError(String(statusDB1.data))
  }
}

/**
 * Metodo responsavél por actualizar o usuário
 * @param req
 * @param res
 */
const update = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)

  let afliaste = JSON.parse(req.params.afiliaste) as Afiliaste
  const oldPic = afliaste.photo
  const afiliasteUpdate = req.body as Afiliaste
  console.log(afiliasteUpdate)

  // Actualizar Imagem
  if ((req.query.action as any) === 'media') {
    const statusS2 = await LocalStorage.saveFile({
      fileName: `${afliaste.id}-${Date.now()}-${afiliasteUpdate.photo.originalFilename}`,
      filePath: afiliasteUpdate.photo.path,
    })

    if (statusS2.status === 'SUCCESS') {
      afliaste.photo = statusS2.data
      const status = await dbFiliaste.updatePhoto(afliaste)
      if (status.type === FcStatusValues.SUCESS) {
        LocalStorage.deleteFile(oldPic)
        return response.sucess(afliaste)
      } else {
        return response.serverError(status.data)
      }
    } else {
      return response.badRequest(statusS2.data)
    }
  } else {
    afliaste = {
      id: afliaste.id,
      name: afiliasteUpdate.name,
      phone: afiliasteUpdate.phone,
      address: afiliasteUpdate.address,
      country: afiliasteUpdate.country,
      doc_id: afiliasteUpdate.doc_id,
      doc_type: afiliasteUpdate.doc_type,
      birthday: afiliasteUpdate.birthday,
      gender: afiliasteUpdate.gender,
      type: afiliasteUpdate.type,
    }

    const status = await dbFiliaste.update(afliaste)
    if (status.type === FcStatusValues.SUCESS) {
      return response.sucess(afliaste)
    } else {
      return response.serverError(status.data)
    }
  }
}

const remove = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)
  let afliaste = JSON.parse(req.params.afiliaste) as Afiliaste

  const status = await dbFiliaste.deleteById(Number(afliaste.id))

  if (status.type === FcStatusValues.SUCESS) {
    LocalStorage.deleteFile(afliaste.photo)
    return response.sucess(null)
  } else {
    return response.serverError(status.data)
  }
}

export default {
  get,
  add,
  update,
  remove,
  getBrothers,
}
