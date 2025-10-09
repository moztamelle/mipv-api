import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import { ENV_VARS } from '../..'
import { UserStatus } from '../authentication/controller'
import userDB, { type User } from '../authentication/db'
import { FcStatusValues } from '../authentication/http/api-responses'
import { HandleResponse } from '../authentication/http/http-responses'
import LocalStorage from '../utils/storage/storage'
/**
 * Metodo responsavél por adicionar novo usuário
 * @param req
 * @param res
 * @returns
 */
const add = async (req: Request, res: Response) => {

  const response = new HandleResponse(req, res)
  const user: User = req.body as User
  user.status = UserStatus.PENDENTE

  /** trim all main field of user object */
  user.email_whatsapp = user.email_whatsapp.trim().toLowerCase()

  user.phone = user.phone?.trim()

  const statusDB1 = await userDB.add(user)

  if (statusDB1.type === FcStatusValues.SUCESS) {

    const user = statusDB1.data as User

    const statusS2 = await LocalStorage.saveFile({
      fileName: `${user.id}-${user.photo.originalFilename}`,
      filePath: user.photo.path,
    });

    if (statusS2.status === "SUCCESS") {
      user.photo = statusS2.data;
      userDB.updatePhoto(user)
    }

    return res.status(201).json(user)

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

  let user = JSON.parse(req.params.user) as User
  const oldPic = user.photo;
  const userUpdate = req.body as User

  // Actualizar Imagem
  if ((req.query.action as any) === "media") {

    const statusS2 = await LocalStorage.saveFile({
      fileName: `${user.id}-${Date.now()}-${userUpdate.photo.originalFilename}`,
      filePath: userUpdate.photo.path,
    });

    if (statusS2.status === "SUCCESS") {
      user.photo = statusS2.data;
      const status = await userDB.updatePhoto(user);
      if (status.type === FcStatusValues.SUCESS) {
        LocalStorage.deleteFile(oldPic);
        return response.sucess(user);
      } else {
        return response.serverError(status.data);
      }
    } else {
      return response.badRequest(statusS2.data);
    }

  } else {

    user = {
      ...user,
      name: userUpdate.name,
      phone: userUpdate.phone,
      address: userUpdate.address,
      country: userUpdate.country,
      doc_id: userUpdate.doc_id,
      doc_type: userUpdate.doc_type,
      birthday: userUpdate.birthday,
      gender: userUpdate.gender,
      type: userUpdate.type,
    }

    const status = await userDB.update(user);
    if (status.type === FcStatusValues.SUCESS) {
      return response.sucess(user);
    } else {
      return response.serverError(status.data);
    }
  }

  console.log(user)
  console.log(userUpdate)

  return response.sucess(null)


  user.name = userUpdate.name
  user.address = userUpdate.address
  user.phone = userUpdate.phone

  const statusDB = await userDB.update(user)

  if (statusDB.type === FcStatusValues.SUCESS) {
    delete user.password
    delete user.token
    delete user.hash_confirmation

    return res.status(200).json(user)
  } else {
    return response.serverError(String(statusDB.data))
  }
}

export default {
  add,
  update
}
