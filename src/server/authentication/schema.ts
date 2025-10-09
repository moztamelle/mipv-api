import yup, { number, object, string } from 'yup'
import { User } from './db'

// Schema for api signup user: request body
export const create: yup.Schema<User> = object({
  name: string()
    .matches(/^(\S+\s+\S+.+)$/, 'Por favor, forneça pelo menos dois nomes.')
    .required('Por favor, forneça um nome.'),
  email_whatsapp: string()
    .matches(
      /^((^[^\s@]+@[^\s@]+\.[^\s@]+$)|(^8[2-7]\d{7}$))$/,
      'O valor fornecido deve ser um email válido ou um número de whatsapp válido.'
    )
    .required('Por favor, forneça um email or numero whatsapp.')
    .lowercase('O email deve contér letras minisculas somente'),
  phone: string()
    .required('O numero de telefone fornecido não é válido.')
    .matches(/^8[2-7]\d{7}$/, 'O numero de telefone fornecido não é válido.'),
  address: string().required('Por favor, forneça um endereço.'),
  province_id: number()
    .required('Por favor, forneça um ID de província.')
    .positive('O ID da província deve ser um número positivo.')
    .integer('O ID da província deve ser um número inteiro.'),
  password: string()
    .required('Por favor, forneça a nova password.')
    .matches(/^\d{6,15}$/, 'A senha deve ser 6 a 15 digitos.'),
})

// Schema for api update user: request body
export const update: yup.Schema<User> = object({
  name: string()
    .matches(/^(\S+\s+\S+.+)$/, 'Por favor, forneça pelo menos dois nomes.')
    .required('Por favor, forneça um nome.'),
  email_whatsapp: string()
    .matches(
      /^((^[^\s@]+@[^\s@]+\.[^\s@]+$)|(^8[2-7]\d{7}$))$/,
      'O valor fornecido deve ser um email válido ou um número de whatsapp válido.'
    )
    .required('Por favor, forneça um email or numero whatsapp.')
    .lowercase('O email deve contér letras minisculas somente'),
  phone: string()
    .nullable()
    .matches(/^8[2-7]\d{7}$/, 'O numero de telefone fornecido não é válido.'),
  address: string().required('Por favor, forneça um endereço.'),
  province_id: number()
    .required('Por favor, forneça um ID de província.')
    .positive('O ID da província deve ser um número positivo.')
    .integer('O ID da província deve ser um número inteiro.'),
})

// Schema for api authentication user: request body
export const authentication: yup.Schema = object({
  email_whatsapp: string()
    .matches(
      /^((^[^\s@]+@[^\s@]+\.[^\s@]+$)|(^8[2-7]\d{7}$))$/,
      'O valor fornecido deve ser um email válido ou um número de whatsapp válido.'
    )
    .required('Por favor, forneça um email or numero whatsapp.')
    .lowercase(
      'O email or numero whatsapp deve contér letras minisculas somente'
    ),
  password: string()
    .required('Por favor, forneça a nova password.')
    .matches(/^\d{6,15}$/, 'A senha deve ser 6 a 15 digitos.'),
})

// Schema for api confirmation code: request body
export const confirmation: yup.Schema = object({
  email_whatsapp: string()
    .matches(
      /^((^[^\s@]+@[^\s@]+\.[^\s@]+$)|(^8[2-7]\d{7}$))$/,
      'O valor fornecido deve ser um email válido ou um número de whatsapp válido.'
    )
    .required('Por favor, forneça um email or numero whatsapp.')
    .lowercase(
      'O email or numero whatsapp deve contér letras minisculas somente'
    ),
  hash_confirmation: string().required(
    'Por favor, forneça um hash confirmação.'
  ),
})

// Schema for api reset password : request body
export const resetPassword: yup.Schema = object({
  email_whatsapp: string()
    .matches(
      /^((^[^\s@]+@[^\s@]+\.[^\s@]+$)|(^8[2-7]\d{7}$))$/,
      'O valor fornecido deve ser um email válido ou um número de whatsapp válido.'
    )
    .required('Por favor, forneça um email.')
    .lowercase('O email deve contér letras minisculas somente'),
  hash_confirmation: string().required(
    'Por favor, forneça um hash confirmação.'
  ),
  password: string()
    .required('Por favor, forneça a nova password.')
    .matches(/^\d{6,15}$/, 'A senha deve ser 6 a 15 digitos.'),
})

// Schema for confirmation code: request queries params
export const confirmation_queries: yup.Schema = object({
  type: string()
    .matches(
      /^(CREATION|RECOVER)$/,
      'Defina a query param *type* válido, deve ser CREATION | RECOVER.'
    )
    .required(
      'Defina a query param *type* válido, deve ser CREATION | RECOVER.'
    ),
})
