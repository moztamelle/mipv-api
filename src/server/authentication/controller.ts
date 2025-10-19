import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import { ENV_VARS } from '../..'
import Pagination from '../database/pagination'
import LocalStorage from '../utils/storage/storage'
import userDB, { type User } from './db'
import { FcStatusValues } from './http/api-responses'
import { HandleResponse, HTTP_STATUS } from './http/http-responses'
import EmailTemplates from './mailer/templates'
import Whatsapp from './whatsapp/templates'

export enum UserStatus {
  'PENDENTE' = 'PENDENTE',
  'CONFIRMADA' = 'CONFIRMADA',
  'BLOQUEADA' = 'BLOQUEADA',
}

/**
 * Metodo responsavél por autenticar o usuário
 * @param req
 * @param res
 * @returns
 */
const authentication = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)
  const statusDB = await userDB.findByEmail(req.body.email_whatsapp)

  if (statusDB.type === FcStatusValues.SUCESS) {
    const user: User = statusDB.data as User

    if (user.status === UserStatus.BLOQUEADA) {
      return response.personalized(
        403,
        HTTP_STATUS.USER_BLOCKED,
        'Está conta se encontra bloqueada contacte os administradores'
      )
    } else if (user.status === UserStatus.PENDENTE) {
      return response.notAuthenticated(
        'Não foi encontrada usuário com este email_whatsapp.'
      )
    }

    if (bcrypt.compareSync(req.body.password, user?.password ?? '')) {
      delete user.hash_confirmation
      delete user.password

      user.token = Buffer.from(
        user.email_whatsapp.toLowerCase() + ':' + req.body.password
      ).toString('base64')

      return res.status(200).json(user)
    } else {
      return response.notAuthenticated(
        'As credenciais inseridas estão incorrectas'
      )
    }
  } else if (statusDB.type === FcStatusValues.NOT_FOUND) {
    return response.notFound('Não foi encontrada alguma conta com este email ')
  } else if (statusDB.type === FcStatusValues.ERROR) {
    return response.serverError(String(statusDB.data))
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
  const user: User = req.body as User
  user.status = UserStatus.PENDENTE

  /** trim all main field of user object */
  user.email_whatsapp = user.email_whatsapp.trim().toLowerCase()

  const isWhatsapp = user.email_whatsapp.match(/^8[2-7]\d{7}$/)

  user.phone = user.phone?.trim()
  user.password = user.password?.trim()
  /** end trim */

  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(user.password ?? '', salt)
  const random = Math.floor(Math.random() * 100000000)

  const passwordPure = user.password
  user.password = hash
  user.hash_confirmation = random + user.email_whatsapp
  user.status = UserStatus.PENDENTE

  const statusDB1 = await userDB.add(user)

  if (statusDB1.type === FcStatusValues.SUCESS) {
    const user = statusDB1.data as User

    const slice1Hash = user.hash_confirmation?.slice(0, 6)
    const slice2Hash = user.hash_confirmation?.slice(6)

    user.token = Buffer.from(
      user.email_whatsapp.toLowerCase() + ':' + passwordPure
    ).toString('base64')

    const statusS2 = await LocalStorage.saveFile({
      fileName: `${user.id}-${user.photo.originalFilename}`,
      filePath: user.photo.path,
    })

    if (statusS2.status === 'SUCCESS') {
      user.photo = statusS2.data
      userDB.updatePhoto(user)
    }

    if (isWhatsapp) {
      const statusE = await Whatsapp.sendVerificationCode(
        user.email_whatsapp,
        slice1Hash as string
      )

      if (statusE === 'SUCCESS') {
        return res.status(201).json({
          íd: user.id,
          email_whatsapp: user.email_whatsapp.trim().toLowerCase(),
          status: user.status,
          hash_confirmation: slice2Hash,
        })
      } else {
        return response.serverError(String(statusE))
      }
    } else {
      const statusE = await EmailTemplates.sendConfirmationCode({
        title: 'Criação de Conta',
        username: user.name,
        code: slice1Hash ?? '',
        mailTo: user.email_whatsapp,
      })

      if (statusE === 'SUCCESS') {
        return res.status(201).json({
          íd: user.id,
          email_whatsapp: user.email_whatsapp,
          status: user.status,
          hash_confirmation: slice2Hash,
        })
      } else {
        return response.serverError(String(statusE))
      }
    }
  } else if (statusDB1.type === FcStatusValues.EXISTS) {
    const user = statusDB1.data as User

    if (user.status === UserStatus.CONFIRMADA) {
      return response.personalized(
        400,
        HTTP_STATUS.USER_EXISTS,
        'Ja existe usuário cadastrado com este email or numero whatsapp'
      )
    } else if (user.status === UserStatus.BLOQUEADA) {
      return response.personalized(
        403,
        HTTP_STATUS.USER_BLOCKED,
        'Ja existe usuário cadastrado com este email or numero whatsapp, e está conta está bloqueada para recuperar o acesso entre em contacto com administrador'
      )
    }
  } else if (statusDB1.type === FcStatusValues.ERROR) {
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
  const oldPic = user.photo
  const userUpdate = req.body as User

  // Actualizar Imagem
  if ((req.query.action as any) === 'media') {
    const statusS2 = await LocalStorage.saveFile({
      fileName: `${user.id}-${Date.now()}-${userUpdate.photo.originalFilename}`,
      filePath: userUpdate.photo.path,
    })

    if (statusS2.status === 'SUCCESS') {
      user.photo = statusS2.data
      const status = await userDB.updatePhoto(user)
      if (status.type === FcStatusValues.SUCESS) {
        LocalStorage.deleteFile(oldPic)
        return response.sucess(user)
      } else {
        return response.serverError(status.data)
      }
    } else {
      return response.badRequest(statusS2.data)
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

    const status = await userDB.update(user)
    if (status.type === FcStatusValues.SUCESS) {
      return response.sucess(user)
    } else {
      return response.serverError(status.data)
    }
  }
}

/**
 * Metodo responsavél por solicitar um codico de confirmação para recuperação de email
 * @param req
 * @param res
 * @returns
 */
const recoverAccount = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)
  /** check is comming email and if is valid */
  if (
    !('email_whatsapp' in req.body) ||
    !req.body.email_whatsapp
      .toString()
      .match(/^((^[^\s@]+@[^\s@]+\.[^\s@]+$)|(^8[2-7]\d{7}$))$/)
  ) {
    return response.badRequest(
      'Insira o email or whatsapp associado a conta que pretendes recuperar'
    )
  } else {
    // when the email is valid go ahead
    const email_whatsapp = req.body.email_whatsapp.toString().toLowerCase()

    const response1 = await userDB.findByEmail(email_whatsapp)

    // check if the user was found
    if (response1.type === FcStatusValues.SUCESS) {
      const user = response1.data as User

      /** verify is the account is block or pendent status */

      if (user.status == UserStatus.BLOQUEADA) {
        return response.personalized(
          403,
          HTTP_STATUS.USER_BLOCKED,
          'Esta conta se encontra bloqueada para recuperar o acesso entre em contacto com administrador'
        )
      } else if (user.status === UserStatus.PENDENTE) {
        return response.notFound(
          `Não foi encontrado usuário com email_whatsapp ${email_whatsapp}`
        )
      }
      /** end verify account */

      const isWhatsapp = user.email_whatsapp.match(/^8[2-7]\d{7}$/)

      const random = Math.floor(Math.random() * 100000000)
      user.hash_confirmation = random + user.email_whatsapp

      const slice1Hash = user.hash_confirmation?.slice(0, 6)
      const slice2Hash = user.hash_confirmation?.slice(6)

      const resposeUpdate = await userDB.update(user)

      if (resposeUpdate.type === FcStatusValues.SUCESS) {
        if (isWhatsapp) {
          const statusE = await Whatsapp.sendVerificationCode(
            user.email_whatsapp,
            slice1Hash as string
          )

          if (statusE === 'SUCCESS') {
            return res.status(201).json({
              email_whatsapp: user.email_whatsapp,
              hash_confirmation: slice2Hash,
            })
          } else {
            return response.serverError(String(statusE))
          }
        } else {
          const statusE = await EmailTemplates.sendConfirmationCode({
            title: 'Recuperação de Conta',
            username: user.name,
            code: slice1Hash ?? '',
            mailTo: user.email_whatsapp,
          })

          if (statusE === 'SUCCESS') {
            return res.status(201).json({
              email_whatsapp: user.email_whatsapp,
              hash_confirmation: slice2Hash,
            })
          } else {
            return response.serverError(String(statusE))
          }
        }
      } else {
        return response.serverError(String(resposeUpdate.data))
      }
    } else if (response1.type === FcStatusValues.NOT_FOUND) {
      return response.notFound(
        `Não foi encontrado usuário com email ${email_whatsapp}`
      )
    } else {
      return response.serverError(String(response1.data))
    }
  }
}

/**
 * Metodo responsavél por fazer a confirmação do hash para criação de conta e recuperação
 * @param req
 * @param res
 * @returns
 */
const confirmationHash = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)
  const user = JSON.parse(req.params?.user as string) as User

  if (req.query.type === 'CREATION') {
    user.status = UserStatus.CONFIRMADA
    user.hash_confirmation = null
    const statusDB1 = await userDB.update(user)

    if (statusDB1.type === FcStatusValues.SUCESS) {
      delete user.token
      delete user.hash_confirmation
      return res.status(200).json(user)
    } else {
      return response.serverError(String(statusDB1.data))
    }
  } else {
    return response.sucess(null)
  }
}

/**
 * Metodo responsavél por redifinir a password do usuário
 * @param req
 * @param res
 * @returns
 */
const resetPassword = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)
  const user = JSON.parse(req.params?.user) as User

  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(req.body.password ?? '', salt)

  user.password = hash

  const statusDB = await userDB.resetPassword(user)

  if (statusDB.type === FcStatusValues.SUCESS) {
    delete user.password
    delete user.hash_confirmation

    user.token = Buffer.from(
      req.body.email_whatsapp.toLowerCase() + ':' + req.body.password
    ).toString('base64')

    return response.sucess(user)
  } else {
    return response.serverError(String(statusDB.data))
  }
}

const resendCode = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)
  if (req.query.email_whatsapp === undefined) {
    return response.badRequest(
      'Informe o email_whatsapp da conta que pretende reenviar o codico'
    )
  }

  const statusDB1 = await userDB.findByEmail(
    req.query.email_whatsapp as unknown as string
  )

  if (statusDB1.type === FcStatusValues.SUCESS) {
    const user = statusDB1.data as User

    if (
      user.hash_confirmation === '' ||
      user.hash_confirmation === undefined ||
      user.hash_confirmation === null
    ) {
      return response.badRequest(
        'Nenhum processo que necessite de codico de confirmação foi iniciado.'
      )
    }

    const slice1Hash = user.hash_confirmation?.slice(0, 6)
    const slice2Hash = user.hash_confirmation?.slice(6)

    const isWhatsapp = user.email_whatsapp.match(/^8[2-7]\d{7}$/)

    if (isWhatsapp) {
      const statusE = await Whatsapp.sendVerificationCode(
        user.email_whatsapp,
        slice1Hash as string
      )

      if (statusE === 'SUCCESS') {
        return res.status(201).json({
          íd: user.id,
          email: user.email_whatsapp,
          status: user.status,
          hash_confirmation: slice2Hash,
        })
      } else {
        return response.serverError(String(statusE))
      }
    } else {
      const statusE = await EmailTemplates.sendConfirmationCode({
        title:
          user.status === UserStatus.CONFIRMADA
            ? 'Recuperação da Conta'
            : 'Criação da Conta',
        username: user.name,
        code: slice1Hash ?? '',
        mailTo: user.email_whatsapp,
      })

      if (statusE === 'SUCCESS') {
        return res.status(200).json({
          íd: user.id,
          email: user.email_whatsapp,
          status: user.status,
          hash_confirmation: slice2Hash,
        })
      } else {
        return response.serverError(String(statusE))
      }
    }
  } else if (statusDB1.type === FcStatusValues.NOT_FOUND) {
    return response.notFound('Não existe conta associada a este email')
  } else {
    return response.serverError(statusDB1.data)
  }
}

export const faleConnosco = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)

  const body = req.body
  const statusDB = await EmailTemplates.sendFaleConnosco({
    assunto: body.assunto,
    nome: body.name,
    telefone: body.phone,
    mensagem: body.mensagem,
    mailTo: ENV_VARS.adminsEmails,
  })
  if (statusDB === 'SUCCESS') {
    return response.sucess(null)
  } else {
    return response.serverError(null)
  }
}

const searchByName = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)

  const statusC1 = await userDB.searchByName(true, (req.query as any).name)

  if (statusC1.type === FcStatusValues.SUCESS) {
    const pagination = new Pagination(
      Number((statusC1.data as any).count),
      1,
      ENV_VARS.pagination
    )
    const statusD = await userDB.searchByName(
      false,
      (req.query as any).name,
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

const findAll = async (req: Request, res: Response) => {
  const response = new HandleResponse(req, res)

  const statusC1 = await userDB.findAll(true)

  if (statusC1.type === FcStatusValues.SUCESS) {
    const pagination = new Pagination(
      Number((statusC1.data as any).count),
      1,
      ENV_VARS.pagination
    )
    const statusD = await userDB.findAll(false, pagination.getLimit())
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

export default {
  authentication,
  add,
  update,
  recoverAccount,
  confirmationHash,
  resetPassword,
  resendCode,
  findAll,
  searchByName,
}
