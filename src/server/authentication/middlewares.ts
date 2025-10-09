import bcrypt from 'bcrypt'
import { NextFunction, Request, Response } from 'express'
import multiparty from 'multiparty'
import { handleImagePhoto } from '../utils/form-task'
import userDB, { User, UserStatus, UserType } from './db'
import { FcStatusValues } from './http/api-responses'
import { HandleResponse, HTTP_STATUS } from './http/http-responses'
import * as schemas from './schema'
import validation from './validation'

export const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // await delay(10000);
  const response = new HandleResponse(req, res)
  try {
    const authorization = req.get('Authorization')

    if (authorization == null) {
      return response.notAuthenticated('email ou senha incorrecta')
    }

    // Split cause authorization has this pathern Basic sdkfjsdfkhfkkfsfdsd
    const token = authorization.split(' ')[1]
    const str_email_senha = Buffer.from(token, 'base64').toString()
    const arr_email_senha = str_email_senha.split(':')

    const email = arr_email_senha[0]
    const senha = arr_email_senha[1]

    const statusDB = await userDB.findByEmail(email)

    if (statusDB.type === FcStatusValues.SUCESS) {
      const user = statusDB.data as User

      if (user.status === UserStatus.BLOQUEADA) {
        return response.personalized(
          403,
          HTTP_STATUS.USER_BLOCKED,
          'Esta conta se encontra bloqueada'
        )
      } else if (user.status === UserStatus.PENDENTE) {
        return response.notAuthenticated('Credênciais incorrectas.')
      }

      if (!bcrypt.compareSync(senha, user?.password ?? '')) {
        return response.notAuthenticated('email ou senha incorrecta')
      }
      delete user.password
      delete user.hash_confirmation
      req.params.user = JSON.stringify(user)
    } else {
      return response.notAuthenticated('Usuario e senha incorrecta')
    }
    req.params.access = ''
    next()
  } catch (errors) {
    return response.serverError(String(errors))
  }
}

export const v_authentication = validation.validateRequest(
  'body',
  schemas.authentication
)

export const add_user = (req: Request, res: Response, next: NextFunction) => {
  const form = new multiparty.Form()

  form.parse(req, async function (err, fields, files) {
    const formData = { ...fields, ...files }

    const body: User = {
      name: formData?.name?.[0] || '',
      email_whatsapp: formData?.email_whatsapp?.[0] || '',
      phone: formData?.phone?.[0] || null,
      address: formData?.address?.[0] || '',
      country: formData?.country?.[0],
      doc_type: formData?.doc_type?.[0],
      doc_id: formData?.doc_id?.[0],
      birthday: formData?.birthday?.[0],
      gender: formData?.gender?.[0],
      type: formData?.type?.[0] as UserType,
      status: UserStatus.PENDENTE,
      password: formData.password[0],
      photo: formData.photo[0],
      access: 'USER',
    }

    body.photo = handleImagePhoto(body.photo) as unknown as string
    console.log(body)
    req.body = { ...body }
    next()
  })
}

export const update = (req: Request, res: Response, next: NextFunction) => {

  const response = new HandleResponse(req, res);
  const form = new multiparty.Form()
  const query = req.query;

  if (!['media', 'data'].includes((query as any).action)) {
    return response.badRequest("Informe se pretende actual a foto ou informação")
  }

  form.parse(req, async function (err, fields, files) {
    const formData = { ...fields, ...files }
    let body = {} as Omit<User, "email_whatsapp">

    if (query.action === 'media') {
      body.photo = handleImagePhoto(formData?.photo?.[0]) as unknown as string
    } else {
      body = {
        name: formData?.name?.[0] || '',
        phone: formData?.phone?.[0] || null,
        address: formData?.address?.[0] || '',
        country: formData?.country?.[0],
        doc_type: formData?.doc_type?.[0],
        doc_id: formData?.doc_id?.[0],
        birthday: formData?.birthday?.[0],
        gender: formData?.gender?.[0],
        type: formData?.type?.[0] as UserType,
      }
    }
    req.body = { ...body }
    next()
  })
}
export const confirmation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const response = new HandleResponse(req, res)

  const confirmationHash = req.body.hash_confirmation

  const email_whatsapp = req.body.email_whatsapp
  const statusDB = await userDB.findByEmail(email_whatsapp)

  if (statusDB.type === FcStatusValues.NOT_FOUND) {
    return response.badRequest(
      `Não foi encontrada alguma conta com este email ${email_whatsapp}`
    )
  } else if (statusDB.type === FcStatusValues.ERROR) {
    return response.serverError(String(statusDB.data))
  }

  const user = statusDB.data as User

  if (user.status === UserStatus.BLOQUEADA) {
    return response.personalized(
      403,
      HTTP_STATUS.USER_BLOCKED,
      'Está conta se encontra bloqueada contacte os administradores'
    )
  }

  if (user.hash_confirmation !== confirmationHash.toString().trim()) {
    return response.notAuthenticated('O códico de confirmação esta errado')
  }

  delete user.password

  req.params.user = JSON.stringify(user)

  next()
}

export const confirmation_queries = validation.validateRequest(
  'query',
  schemas.confirmation_queries,
  'Erro nos query params'
)

export const v_confirmation = validation.validateRequest(
  'body',
  schemas.confirmation,
  'Erro no formulário'
)

export const resetPassword = validation.validateRequest(
  'body',
  schemas.resetPassword,
  'Erro no formulário'
)
