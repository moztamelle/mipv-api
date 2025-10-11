type MediaType = 'MP3' | 'MP4'

interface Media {
  id?: number
  title: string
  album: string
  type: MediaType
  url: string
  date: any
}

export type { Media, MediaType }
