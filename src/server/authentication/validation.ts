import { RequestHandler } from 'express'
import * as yup from 'yup'
import { HandleResponse } from './http/http-responses'

type TValidation = (
  type: 'body' | 'query' | 'headers',
  scheme: yup.Schema<object>,
  errorTitle?: string
) => RequestHandler

const validateRequest: TValidation =
  (type, schema) => async (req, res, next) => {
    const response = new HandleResponse(req, res)
    try {
      // switch what we want to validate
      if (type === 'body')
        await schema.validate(req.body, { abortEarly: false })
      else if (type === 'headers')
        await schema.validate(req.headers, { abortEarly: false })
      else if (type === 'query')
        await schema.validate(req.query, { abortEarly: false })

      return next()
    } catch (error) {
      const yupError = error as yup.ValidationError
      const errors: Record<string, string> = {}

      yupError.inner.forEach((error) => {
        if (error.path === undefined) return
        errors[error.path] = error.message
      })

      return response.badRequest(errors)
    }
  }

interface StatusValue {
  status: 'SUCCESS' | 'ERROR'
  data?: any
}

export type { StatusValue }

const validateObject = async (
  schema: yup.Schema<object>,
  data: object
): Promise<StatusValue> => {
  try {
    await schema.validate(data, { abortEarly: false })
    return {
      status: 'SUCCESS',
      data: data,
    } as StatusValue
  } catch (error) {
    const yupError = error as yup.ValidationError
    const errors: Record<string, string> = {}

    yupError.inner.forEach((error) => {
      if (error.path === undefined) return
      errors[error.path] = error.message
    })

    return {
      status: 'ERROR',
      data: errors,
    } as StatusValue
  }
}

const validation = {
  validateRequest,
  validateObject,
}

export default validation
