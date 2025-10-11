import db from '../authentication/connection'
import fcResponse, {
  FcStatusValues,
} from '../authentication/http/api-responses'
import { Afiliaste } from '../types/afiliaste'
import { FcResponseProps } from '../utils/form-task'

const findMyAfiliaste = async (
  isCount: boolean,
  idUser: number,
  limit?: string
): Promise<FcResponseProps> => {
  const sql = isCount
    ? 'SELECT count(*) FROM users WHERE token=$1'
    : `SELECT * FROM users WHERE token=$1 ORDER BY name ASC ${limit}`

  const result = await db.query(sql, [String(idUser)])

  if (isCount) {
    return fcResponse(FcStatusValues.SUCESS, result[0])
  } else {
    return fcResponse(FcStatusValues.SUCESS, result)
  }
}

const add = async (afliaste: Afiliaste): Promise<FcResponseProps> => {
  try {
    const result = await db.one(
      'INSERT INTO users (name, phone, address, gender, photo, country, doc_type, doc_id, birthday, type, token) VALUES (${name}, ${phone}, ${address}, ${gender}, ${photo}, ${country}, ${doc_type}, ${doc_id}, ${birthday}, ${type}, ${token}) RETURNING id',
      afliaste
    )

    const userWithId = { ...{ id: result.id }, ...afliaste }

    return fcResponse(FcStatusValues.SUCESS, userWithId)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}

const update = async (afliaste: Afiliaste): Promise<FcResponseProps> => {
  try {
    await db.query(
      'UPDATE users SET name = $1, phone = $2, address=$3, country = $4, birthday = $5, doc_type = $6, doc_id = $7, gender = $8, type = $9 WHERE id = $10',
      [
        afliaste.name,
        afliaste.phone,
        afliaste.address,
        afliaste.country,
        afliaste.birthday,
        afliaste.doc_type,
        afliaste.doc_id,
        afliaste.gender,
        afliaste.type,
        afliaste.id,
      ]
    )

    return fcResponse(FcStatusValues.SUCESS)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}

const updatePhoto = async (afiliaste: Afiliaste): Promise<FcResponseProps> => {
  try {
    await db.query('UPDATE users SET photo=$1 WHERE id = $2', [
      afiliaste.photo,
      afiliaste.id,
    ])

    return fcResponse(FcStatusValues.SUCESS)
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

const deleteById = async (id: number): Promise<FcResponseProps> => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [id])

    return fcResponse(FcStatusValues.SUCESS)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}

export const dbFiliaste = {
  add,
  update,
  findById,
  updatePhoto,
  deleteById,
  findMyAfiliaste,
}
