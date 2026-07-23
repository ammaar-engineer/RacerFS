import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { BaseException } from './CustomExceptionHandle'
import { Response } from 'express'
import { static_output_types } from "./types/static_output_types";
import { BaseWsExceptionFilter } from "@nestjs/websockets";

@Catch()
export class CustomGlobalException extends BaseExceptionFilter {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const isDevelopment = this.configService.get<string>('NODE_ENV') === 'development'

    let ServerOutput: static_output_types = {
      statusCode: 500,
      errorCode: "INTERNAL_SERVER_ERROR",
      success: false,
      data: null,
      message: "Internal server error"
    }
    // console.log(exception)
    console.log("Pesan error: ",exception?.message)
    console.log("Pesan error stack: ", exception?.stack)
    // console.error('=== Exception Details ===')
    // console.error('Type:', exception?.constructor?.name)
    // console.error('Message:', exception?.message)
    // console.error('Stack:', exception?.stack)
    // console.error('========================')
    if (isDevelopment) {
    }

    if (exception instanceof BaseException) {
      ServerOutput['errorCode'] = exception.errorCode
      ServerOutput['data'] = exception.data
      ServerOutput['success'] = exception.success
      ServerOutput['statusCode'] = exception.statusCode
      ServerOutput['message'] = exception.message
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const exceptionResponse = exception.getResponse()
      
      ServerOutput['statusCode'] = status
      ServerOutput['success'] = false
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any
        ServerOutput['message'] = responseObj.message || exception.message
        ServerOutput['errorCode'] = responseObj.error || this.getErrorCodeFromStatus(status)
        ServerOutput['data'] = responseObj.data || null
      } else {
        ServerOutput['message'] = exception.message
        ServerOutput['errorCode'] = this.getErrorCodeFromStatus(status)
      }
    }

    response.status(ServerOutput['statusCode'] as number).json(ServerOutput)
  }

  private getErrorCodeFromStatus(status: number): string {
    const errorCodeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    }
    
    return errorCodeMap[status] || 'HTTP_ERROR'
  }
}

