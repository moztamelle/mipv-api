import 'dotenv/config'
import { initDB } from './server/authentication/connection'
import { server } from './server/server'

export const ENV_VARS = {
  appName: process.env.APP_NAME ?? '',
  appUrl: process.env.API_URL ?? '',
  emailTemplates: {
    contacts: process.env.CONTACTS ?? '',
    logoFileName: process.env.LOGO_FILE_NAME ?? '',
    email: process.env.EMAIL_USER ?? '',
    password: process.env.EMAIL_PASSWORD ?? ''
  },
  database: process.env.DATABASE_URL ?? '',
  adminsEmails: process.env.EMAIL_ADMIN
}

initDB()
server.listen(process.env.PORT || 3030, () => {
  console.log(`Server is listening !!! ${process.env.PORT || 3030}`)
})
