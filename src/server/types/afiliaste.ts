import { Gender, UserType } from "../authentication/db"

interface Afiliaste {
  id?: number
  name: string
  phone?: string | null
  address: string
  gender?: Gender
  hash_confirmation?: string | null
  photo?: any
  country?: string
  doc_type?: string
  doc_id?: string
  birthday?: string
  type?: UserType
}

export type {
  Afiliaste
}
