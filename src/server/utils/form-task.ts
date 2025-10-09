import { FcStatus } from '../authentication/http/api-responses'

interface ResponseError {
  status: string
  title: string
  details: object | string
  path: string | undefined
}

interface FcResponseProps {
  type: FcStatus
  data?: unknown
}

interface FileProps {
  fieldName: string
  originalFilename: string
  path: string
  name: string
  filename: string
  contentType: string
  size: number
}

interface PhotoProps {
  fieldName?: string
  originalFilename: string
  path: string
  name?: string
  filename: string
  contentType: string
  size?: number
}

export type { FcResponseProps, FileProps, PhotoProps, ResponseError }

export const handleFormFiles = (files: any): FileProps[] => {
  const valuesFile = Object.values(files)

  const photos: FileProps[] = valuesFile.map((item: any) => {
    const inputObject = item?.[0]

    return handleImagePhoto?.(inputObject)
  })

  return photos
}

export const handleImagePhoto = (inputObject: any): FileProps => {
  console.log(JSON.stringify(inputObject))
  return {
    fieldName: inputObject?.fieldName,
    originalFilename: inputObject?.originalFilename,
    path: inputObject?.path,
    name: inputObject?.fieldName,
    filename: inputObject?.originalFilename,
    contentType: inputObject?.headers?.['content-type'],
    size: inputObject?.size,
  } as FileProps
}

export const isValidJSON = (jsonString: string) => {
  try {
    JSON.parse(jsonString)
    return true
  } catch (error) {
    return false
  }
}

const FormTasks = {
  handleFormFiles,
  handleImagePhoto,
  isValidJSON,
}

export default FormTasks
