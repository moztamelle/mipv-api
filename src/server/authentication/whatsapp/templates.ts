import axios from 'axios'

async function sendVerificationCode(
  receiver: string,
  code: string
): Promise<'SUCCESS' | 'ERROR'> {
  try {
    const response = await axios({
      url: `${process.env.WHATSAPP_URL}`,
      method: 'post',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        messaging_product: 'whatsapp',
        to: `258${receiver}`,
        type: 'template',
        template: {
          name: 'mozta_authentication',
          language: {
            code: 'pt_PT',
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: code,
                },
              ],
            },
            {
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [
                {
                  type: 'text',
                  text: code,
                },
              ],
            },
          ],
        },
      },
    })

    return 'SUCCESS'
  } catch (error) {
    console.error((error as any).response?.data || (error as any).message)
    return 'ERROR'
  }
}

const Whatsapp = {
  sendVerificationCode,
}

export default Whatsapp
