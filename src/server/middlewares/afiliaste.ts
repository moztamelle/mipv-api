import { NextFunction, Request, Response } from 'express'
import multiparty from 'multiparty'
import { User, UserType } from '../authentication/db'
import { FcStatusValues } from '../authentication/http/api-responses'
import { HandleResponse } from '../authentication/http/http-responses'
import { dbFiliaste } from '../database/afiliaste'
import { Afiliaste } from '../types/afiliaste'
import { handleImagePhoto } from '../utils/form-task'

export const add_user = (req: Request, res: Response, next: NextFunction) => {
  const form = new multiparty.Form()

  form.parse(req, async function (err, fields, files) {
    const formData = { ...fields, ...files }

    const body: Afiliaste = {
      name: formData?.name?.[0] || '',
      phone: formData?.phone?.[0] || null,
      address: formData?.address?.[0] || '',
      country: formData?.country?.[0],
      doc_type: formData?.doc_type?.[0],
      doc_id: formData?.doc_id?.[0],
      birthday: formData?.birthday?.[0],
      gender: formData?.gender?.[0],
      type: formData?.type?.[0] as UserType,
      photo: formData.photo[0],
    }

    body.photo = handleImagePhoto(body.photo) as unknown as string
    console.log(body)
    req.body = { ...body }
    next()
  })
}

export const update = (req: Request, res: Response, next: NextFunction) => {
  const response = new HandleResponse(req, res)
  const form = new multiparty.Form()
  const query = req.query

  if (!['media', 'data'].includes((query as any).action)) {
    return response.badRequest(
      'Informe se pretende actual a foto ou informação'
    )
  }

  form.parse(req, async function (err, fields, files) {
    const formData = { ...fields, ...files }
    let body = {} as Omit<User, 'email_whatsapp'>

    if (query.action === 'media') {
      body.id = formData?.id?.[0]
      body.photo = handleImagePhoto(formData?.photo?.[0]) as unknown as string
    } else {
      body = {
        id: formData?.id?.[0],
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

export const findById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const response = new HandleResponse(req, res)

  const idAfiliate = Number(req.query.afiliaste)

  if (isNaN(idAfiliate)) {
    return response.badRequest('Forneça o id do afiliado!')
  }

  const form = new multiparty.Form()
  const status = await dbFiliaste.findById(idAfiliate)
  if (status.type === FcStatusValues.SUCESS) {
    req.params.afiliaste = JSON.stringify(status.data)
    next()
  } else if (status.type === FcStatusValues.NOT_FOUND) {
    return response.notFound('Não foi achado filiado com id ' + idAfiliate)
  } else {
    return response.serverError(status.data)
  }
}
