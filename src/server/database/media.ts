import db from '../authentication/connection'
import fcResponse, {
  FcStatusValues,
} from '../authentication/http/api-responses'
import { Media, MediaType } from '../types/media'
import { FcResponseProps } from '../utils/form-task'

const add = async (media: Media): Promise<FcResponseProps> => {
  try {
    const result = await db.one(
      'INSERT INTO media (title, album, type, url, date) VALUES (${title}, ${album}, ${type}, ${url}, ${date}) RETURNING id',
      media
    )

    const mediaWithId = { ...{ id: result.id }, ...media }

    return fcResponse(FcStatusValues.SUCESS, mediaWithId)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}

const update = async (
  media: Media & { id: number }
): Promise<FcResponseProps> => {
  try {
    await db.query(
      'UPDATE media SET title = $1, album = $2, type = $3, url = $4, date = $5 WHERE id = $6',
      [media.title, media.album, media.type, media.url, media.date, media.id]
    )

    return fcResponse(FcStatusValues.SUCESS)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}


const findById = async (id: number): Promise<FcResponseProps> => {
  try {
    const result = await db.query('SELECT * FROM media WHERE id = $1', [id])

    return result?.length > 0
      ? fcResponse(FcStatusValues.SUCESS, result?.[0])
      : fcResponse(FcStatusValues.NOT_FOUND)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}

const deleteById = async (id: number): Promise<FcResponseProps> => {
  try {
    await db.query('DELETE FROM media WHERE id = $1', [id])

    return fcResponse(FcStatusValues.SUCESS)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}

const findByDate = async (
  isCount: boolean,
  type: MediaType,
  date: string,
  limit?: string
): Promise<FcResponseProps> => {
  try {
    const date2 = new Date(date)
    const sql = `
      SELECT ${isCount ? 'count(*)' : '*'} 
      FROM media 
      WHERE type = $1 
        AND EXTRACT(MONTH FROM "date") = $2 
        AND EXTRACT(YEAR FROM "date") = $3
      ${isCount ? '' : 'ORDER BY "date" DESC'}
      ${isCount ? '' : `${limit}`};
    `

    const result = await db.any(sql, [
      type,
      date2.getMonth() + 1,
      date2.getFullYear(),
    ])

    return isCount
      ? fcResponse(FcStatusValues.SUCESS, Number(result[0].count))
      : fcResponse(FcStatusValues.SUCESS, result)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}

const findByTitle = async (
  isCount: boolean,
  type: MediaType,
  title: string,
  limit?: string
): Promise<FcResponseProps> => {
  try {
    const sql = `
      SELECT ${isCount ? 'count(*)' : '*'}
      FROM media
      WHERE type = $1
        AND title ILIKE '%' || $2 || '%'
      ${isCount ? '' : 'ORDER BY "date" DESC'}
      ${isCount ? '' : `${limit}`};
    `

    const result = await db.any(sql, [type, title])

    return isCount
      ? fcResponse(FcStatusValues.SUCESS, Number(result[0].count))
      : fcResponse(FcStatusValues.SUCESS, result)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}


const findAll = async (
  isCount: boolean,
  type: MediaType,
  limit?: string
): Promise<FcResponseProps> => {
  try {
    const sql = `
      SELECT ${isCount ? 'count(*)' : '*'} 
      FROM media 
      WHERE type = $1  
      ${isCount ? '' : 'ORDER BY "date" DESC'}
      ${isCount ? '' : `${limit}`};
    `

    const result = await db.any(sql, [
      type
    ])

    return isCount
      ? fcResponse(FcStatusValues.SUCESS, Number(result[0].count))
      : fcResponse(FcStatusValues.SUCESS, result)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}

export const dbMedia = {
  add,
  findById,
  update,
  deleteById,
  findByDate,
  findByTitle,
  findAll
}
