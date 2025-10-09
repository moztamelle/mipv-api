import fs, { promises as fsPromisse } from 'fs'
import path from 'path'

const uploadDir = path.join(__dirname, '../../../../../storage_api_mipv')
const trashDir = path.join(uploadDir, 'trash')

interface StorageProps {
  status: 'SUCCESS' | 'ERROR'
  data: string
}

const saveFile = async ({
  fileName,
  filePath,
}: {
  filePath: string
  fileName: string
}): Promise<StorageProps> => {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const fullFileName = `${fileName}`
    // const fullFileName = `${Date.now()}-${fileName}`
    const targetPath = path.join(uploadDir, fullFileName)
    await fsPromisse.rename(filePath, targetPath)
    return {
      status: 'SUCCESS',
      data: fullFileName,
    }
  } catch (err: any) {
    return {
      status: 'ERROR',
      data: String(err),
    }
  }
}

const getFile = (fileName: string): StorageProps => {
  const filePath = path.join(uploadDir, fileName)

  if (fs.existsSync(filePath)) {
    return {
      status: 'SUCCESS',
      data: filePath,
    }
  } else {
    return {
      status: 'ERROR',
      data: 'Arquivo não encontrado',
    }
  }
}

function verificarValor(valor: any, textoPersonalizado: string): string {
  if (
    valor === null ||
    valor === undefined ||
    valor === '' ||
    valor === 'null'
  ) {
    return textoPersonalizado
  }
  return valor
}

const deleteFile = async (
  fileName: string,
  permanent: boolean = false
): Promise<StorageProps> => {
  if (verificarValor(fileName, '') === '') {
    return {
      status: 'ERROR',
      data: 'Arquivo não encontrado',
    }
  }

  const filePath = path.join(uploadDir, fileName)

  try {
    if (fs.existsSync(filePath)) {
      if (permanent) {
        await fsPromisse.unlink(filePath)
        return {
          status: 'SUCCESS',
          data: `Arquivo ${fileName} excluído com sucesso`,
        }
      } else {
        if (!fs.existsSync(trashDir)) {
          fs.mkdirSync(trashDir, { recursive: true })
        }
        const trashPath = path.join(trashDir, fileName)
        await fsPromisse.rename(filePath, trashPath)
        return {
          status: 'SUCCESS',
          data: `Arquivo ${fileName} movido para a lixeira`,
        }
      }
    } else {
      return {
        status: 'ERROR',
        data: 'Arquivo não encontrado',
      }
    }
  } catch (err: any) {
    return {
      status: 'ERROR',
      data: String(err),
    }
  }
}

const LocalStorage = {
  saveFile,
  getFile,
  deleteFile,
}

export default LocalStorage
