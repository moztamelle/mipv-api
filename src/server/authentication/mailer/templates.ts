import fs from 'fs'
import path from 'path'
import { ENV_VARS } from '../../..'
import { sendEmail } from './mailer'

export const sourcePath = path.join(__dirname, '..', '..', '..', '..')

const readTemplateEmail = (sufixPath: string): string => {
  try {
    const filePath = path.join(
      sourcePath,
      'resources',
      'html',
      sufixPath + '.html'
    )
    const data = fs.readFileSync(filePath, 'utf8')
    return data
  } catch (error) {
    throw error
  }
}

interface E_ConfirmationCode {
  title: string
  username: string
  code: string
  mailTo: string
}

const sendConfirmationCode = async ({
  title,
  username,
  code,
  mailTo,
}: E_ConfirmationCode): Promise<'SUCCESS' | 'ERROR' | any> => {
  let template = readTemplateEmail('confirmation-code')

  template = template.replace('{{TITLE}}', title)
  template = template.replace('{{USERNAME}}', username)
  template = template.replace('{{CODICO}}', code)
  template = template.replace('{{APP_NAME}}', ENV_VARS.appName ?? '')
  template = template.replace('{{APP_NAME}}', ENV_VARS.appName ?? '')
  template = template.replace(
    '{{CONTACTO1}}',
    ENV_VARS.emailTemplates.contacts?.split(';')[0] ?? ''
  )
  template = template.replace(
    '{{CONTACTO2}}',
    ENV_VARS.emailTemplates.contacts?.split(';')[1] ?? ''
  )
  template = template.replace(
    '{{LOGO_URL}}',
    `${ENV_VARS.appUrl}/api/file/${ENV_VARS.emailTemplates.logoFileName}`
  )

  return await sendEmail({
    mailTo: mailTo,
    subject: title,
    body: template,
  })
}

const sendFaleConnosco = async ({
  assunto,
  nome,
  telefone,
  mensagem,
  mailTo,
}: any): Promise<'SUCCESS' | 'ERROR' | any> => {
  let template = readTemplateEmail('faleconnosco')

  template = template.replace('{{ASSUNTO}}', assunto)
  template = template.replace('{{NOME}}', nome)
  template = template.replace('{{TELEFONE}}', telefone)
  template = template.replace('{{MENSAGEM}}', mensagem)

  return await sendEmail({
    mailTo: mailTo,
    subject: `FC : ${assunto}`,
    body: template,
  })
}

const EmailTemplates = {
  sendConfirmationCode,
  sendFaleConnosco,
}

export default EmailTemplates
