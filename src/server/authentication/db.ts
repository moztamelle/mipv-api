import db from './connection'
import type { FcResponseProps } from './http/api-responses'
import fcResponse, { FcStatusValues } from './http/api-responses'

export enum UserStatus {
  'PENDENTE' = 'PENDENTE',
  'CONFIRMADA' = 'CONFIRMADA',
  'BLOQUEADA' = 'BLOQUEADA',
}

export enum UserType {
  'SIMPATIZANTE' = 'SIMPATIZANTE',
  'MEMBRO' = 'MEMBRO',
  'AFILIADO' = 'AFILIADO',
}

type Gender = 'M' | 'F'

export { Gender }

interface User {
  id?: number
  name: string
  email_whatsapp: string
  phone?: string | null
  address: string
  token?: string
  password?: string | null
  gender?: Gender
  hash_confirmation?: string | null
  status?: UserStatus
  access?: 'USER' | 'ADMIN'
  photo?: any
  country?: string
  doc_type?: string
  doc_id?: string
  birthday?: string
  type?: UserType
}

export type { User }

const add = async (user: User): Promise<FcResponseProps> => {
  try {
    const response = await findByEmail(user.email_whatsapp)

    if (response.type === FcStatusValues.ERROR) {
      return response
    } else if (response.type === FcStatusValues.SUCESS) {
      const userFound = response.data as User

      if (userFound.status === UserStatus.CONFIRMADA) {
        return fcResponse(FcStatusValues.EXISTS, userFound)
      } else if (userFound.status === UserStatus.BLOQUEADA) {
        return fcResponse(FcStatusValues.EXISTS, userFound)
      } else {
        // The account is on PENDENTE status, so delete and create a new one
        const response = await deleteByEmail(userFound.email_whatsapp)
        if (response.type === FcStatusValues.ERROR) {
          return response
        }
      }
    }

    const result = await db.one(
      'INSERT INTO users (name, email_whatsapp, phone, address, password, gender, hash_confirmation, status, access, photo, country, doc_type, doc_id, birthday, type) VALUES (${name}, ${email_whatsapp}, ${phone}, ${address}, ${password}, ${gender}, ${hash_confirmation}, ${status}, ${access}, ${photo}, ${country}, ${doc_type}, ${doc_id}, ${birthday}, ${type}) RETURNING id',
      user
    )

    const userWithId = { ...{ id: result.id }, ...user }

    return fcResponse(FcStatusValues.SUCESS, userWithId)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}

const update = async (user: User): Promise<FcResponseProps> => {
  try {
    await db.query(
      'UPDATE users SET name = $1, phone = $2, address=$3, hash_confirmation = $4, access = $5, status = $6, country = $7, birthday = $8, doc_type = $9, doc_id = $10, gender = $11, type = $12 WHERE id = $13',
      [
        user.name,
        user.phone,
        user.address,
        user.hash_confirmation,
        user.access,
        user.status,
        user.country,
        user.birthday,
        user.doc_type,
        user.doc_id,
        user.gender,
        user.type,
        user.id,
      ]
    )

    return fcResponse(FcStatusValues.SUCESS)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}

const updatePhoto = async (user: User): Promise<FcResponseProps> => {
  try {
    await db.query('UPDATE users SET photo=$1 WHERE id = $2', [
      user.photo,
      user.id,
    ])

    return fcResponse(FcStatusValues.SUCESS)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}

const resetPassword = async (user: User): Promise<FcResponseProps> => {
  try {
    await db.query('UPDATE users SET password = $1 WHERE email_whatsapp = $2', [
      user.password,
      user.email_whatsapp,
    ])

    return fcResponse(FcStatusValues.SUCESS)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}

const findByEmail = async (email: string): Promise<FcResponseProps> => {
  try {
    const result = await db.query(
      'SELECT * FROM users WHERE email_whatsapp = $1',
      [email.toString().toLowerCase()]
    )

    return result?.length > 0
      ? fcResponse(FcStatusValues.SUCESS, result?.[0])
      : fcResponse(FcStatusValues.NOT_FOUND)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}

const findById = async (id: number): Promise<FcResponseProps> => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id])

    return result?.length > 0
      ? fcResponse(FcStatusValues.SUCESS, result?.[0])
      : fcResponse(FcStatusValues.NOT_FOUND)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}

const deleteByEmail = async (email: string): Promise<FcResponseProps> => {
  try {
    await db.query('DELETE FROM users WHERE email_whatsapp = $1', [
      email.toString().toLowerCase(),
    ])

    return fcResponse(FcStatusValues.SUCESS)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}

const userDB = {
  add,
  update,
  findByEmail,
  updatePhoto,
  deleteByEmail,
  resetPassword,
  findById,
}

export default userDB
