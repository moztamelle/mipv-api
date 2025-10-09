import fs from 'fs'
import path from 'path'
import pgPromise from 'pg-promise'
import { sourcePath } from '../authentication/mailer/templates'

const readSQLFile = (sufixPath: string): string => {
  try {
    const filePath = path.join(sourcePath, 'resources', 'sql', './' + sufixPath)
    const data = fs.readFileSync(filePath, 'utf8')
    return data
  } catch (error) {
    throw error
  }
}

const pgp = pgPromise()

// setup for remote db
// const db = pgp({
// 	connectionString: process.env.DATABASE_URL,
// 	ssl: {
// 		rejectUnauthornized: false
// 	}
// });

// setup for local db
const db = pgp({
  connectionString: process.env.DATABASE_URL,
})

export const initDB = async () => {
  try {
    const sql = readSQLFile('./db-structure.sql')
    await db.any(sql)
    console.log('Banco de dados criado.')
  } catch (err: any) {
    console.log(err)
    console.error('Erro no setup inicial db:', err?.detail)
  }
}

export const runTransaction = async (
  task: (t: pgPromise.ITask<{}>) => Promise<any>
) => {
  try {
    // Quando você usa db.tx ou db.task:
    // Uma nova conexão é alocada exclusivamente para aquela transação ou tarefa.
    // Essa conexão é isolada das demais operações.
    // Quando a transação ou tarefa termina, a conexão é liberada de volta para o pool.
    return await db.tx(task)
  } catch (err) {
    throw err
  }
}

export default db
