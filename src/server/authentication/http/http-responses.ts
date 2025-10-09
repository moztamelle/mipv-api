import { Request, Response } from 'express'

export const HTTP_STATUS = {
  CREATED: 'CREATE',
  USER_EXISTS: 'USER_EXISTS',
  USER_BLOCKED: 'USER_BLOCKED',
  HASH_WROND: 'HASH_WRONG',
  ACCESS_DENIED: 'ACCESS_DENIED',
  SUCCESS: 'SUCCESS',
  SERVER_ERROR: 'SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  REQUIREMENT_PROBLEM: 'REQUIREMENT_PROBLEM',
  PAY_SUCCESS_INFO_COMPANIE_ERROR: 'PAY_SUCCESS_INFO_COMPANIE_ERROR',
}

export class HandleResponse {
  request: Request
  response: Response

  constructor(request: Request, response: Response) {
    this.request = request
    this.response = response
  }

  created(data: any): Response {
    return this.response.status(201).json(data)
  }

  sucess(data: any): Response {
    return this.response.status(200).json(data)
  }

  responsePagined(
    data: any,
    currentPage: number,
    totalPages: number
  ): Response {
    return this.response.status(200).json({
      data: data,
      pagination: {
        currentPage: currentPage,
        totalPages: totalPages,
      },
    })
  }

  badRequest(data: any): Response {
    return this.response.status(400).json({
      status: HTTP_STATUS.BAD_REQUEST,
      details: data,
      path: this.request?.path,
    })
  }

  notAuthenticated(data: any): Response {
    return this.response.status(401).json({
      status: HTTP_STATUS.UNAUTHORIZED,
      details: data,
      path: this.request.path,
    })
  }

  accessDenied(data: any): Response {
    return this.response.status(403).json({
      status: HTTP_STATUS.ACCESS_DENIED,
      details: data,
      path: this.request.path,
    })
  }

  notFound(data: any): Response {
    return this.response.status(404).json({
      status: HTTP_STATUS.NOT_FOUND,
      details: data,
      path: this.request.path,
    })
  }

  requirementProblem(data: any): Response {
    return this.response.status(400).json({
      status: HTTP_STATUS.REQUIREMENT_PROBLEM,
      details: data,
      path: this.request.path,
    })
  }

  serverError(data: any): Response {
    return this.response.status(500).json({
      status: HTTP_STATUS.SERVER_ERROR,
      details: data,
      path: this.request.path,
    })
  }

  personalized(code: number, status: string, data: any): Response {
    return this.response.status(code).json({
      status: status,
      details: data,
      path: this.request.path,
    })
  }
}
