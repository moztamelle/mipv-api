import db from '../authentication/connection'
import fcResponse, {
  FcStatusValues,
} from '../authentication/http/api-responses'
import { FcResponseProps } from '../utils/form-task'

const findAllUsers = async (
  isCount: boolean,
  genero: any,
  limit?: string
): Promise<FcResponseProps> => {
  const sql = isCount
    ? `SELECT count(*) FROM users${genero === undefined ? '' : ` WHERE gender=$1`}`
    : `SELECT * FROM users${genero === undefined ? '' : ` WHERE gender=$1`} ORDER BY name ASC ${limit}`

  const result = await db.query(sql, genero === undefined ? [] : [genero])

  if (isCount) {
    return fcResponse(FcStatusValues.SUCESS, result[0])
  } else {
    return fcResponse(FcStatusValues.SUCESS, result)
  }
}

const findByAge = async (
  isCount: boolean,
  fromAge: number,
  toAge: number,
  genero: string,
  limit?: string
): Promise<FcResponseProps> => {
  try {
    // Calcula os anos de nascimento correspondentes à faixa etária
    const currentYear = new Date().getFullYear()
    const fromYear = currentYear - fromAge // ano mais novo
    const toYear = currentYear - toAge // ano mais velho

    // Monta a query SQL
    const sql = `SELECT ${isCount ? 'COUNT(*)' : '*'} FROM users WHERE EXTRACT(YEAR FROM "birthday") BETWEEN $1 AND $2 
    ${genero !== undefined ? 'AND gender = $3' : ''} 
    ${isCount ? '' : 'ORDER BY name ASC'} 
    ${isCount ? '' : `${limit}`};
    `

    // Prepara os parâmetros
    const params =
      genero !== undefined ? [toYear, fromYear, genero] : [toYear, fromYear]

    // Executa a query
    const result = await db.any(sql, params)

    // Retorna resposta formatada
    return isCount
      ? fcResponse(FcStatusValues.SUCESS, Number(result[0].count))
      : fcResponse(FcStatusValues.SUCESS, result)
  } catch (error) {
    return fcResponse(FcStatusValues.ERROR, error)
  }
}

export const dbUser2 = {
  findAllUsers,
  findByAge,
}
