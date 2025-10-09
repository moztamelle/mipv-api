interface FcResponseProps {
  type: FcStatus
  data?: unknown
}

export type { FcResponseProps }

type FcStatus = 200 | 300 | 400 | 500 | 600

interface FcProps {
  SUCESS: FcStatus
  NOT_FOUND: FcStatus
  EXISTS: FcStatus
  ERROR: FcStatus
  REQUIREMENT_PROBLEM: FcStatus
}

export const FcStatusValues: FcProps = {
  SUCESS: 200,
  NOT_FOUND: 300,
  EXISTS: 400,
  ERROR: 500,
  REQUIREMENT_PROBLEM: 600,
}

const fcResponse = (type: FcStatus, data: unknown = null): FcResponseProps => {
  return {
    type: type,
    data: data,
  }
}

export default fcResponse

export type { FcStatus }
