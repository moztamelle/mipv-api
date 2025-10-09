import nodemailer from 'nodemailer'
import { ENV_VARS } from '../../..'

interface SendEmailProps {
  mailTo: string
  subject: string
  body: string
  transporter?:
    | ReturnType<typeof nodemailer.createTransport>
    | CostumTransportProps
}

interface CostumTransportProps {
  email: string
  password: string
}

function isCustomTransportProps(obj: object): obj is CostumTransportProps {
  return 'email' in obj && 'password' in obj
}

const transporterDefault = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

const sendEmail = async (
  { mailTo, subject, body, transporter = transporterDefault }: SendEmailProps,
  mailSuccess?: () => void,
  mailError?: (error: Error | unknown) => void
): Promise<'SUCCESS' | 'ERROR'> => {
  try {
    let mailFrom: string = process.env.EMAIL_USER ?? ''

    if (isCustomTransportProps(transporter)) {
      mailFrom = transporter.email

      transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: transporter.email,
          pass: transporter.password,
        },
      })
    }

    const mailOptions = {
      from: `${ENV_VARS.appName}<${mailFrom}>`,
      to: mailTo,
      subject: subject,
      html: body,
    }

    // Send the email
    const response: any = await transporter.sendMail(mailOptions)

    if (response && response.response && response?.response.startsWith('250')) {
      return 'SUCCESS'
    } else {
      return 'ERROR'
    }
  } catch (error) {
    return 'ERROR'
  }
}

export { sendEmail }
