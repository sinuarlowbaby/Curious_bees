import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const rawResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const message = typeof rawResponse === 'object' && rawResponse !== null && 'message' in rawResponse
      ? (rawResponse as any).message
      : rawResponse;

    // Log detail using console.error which is hooked into Winston logs
    const errMessage = exception instanceof Error ? exception.message : String(exception);
    const errStack = exception instanceof Error ? exception.stack : '';
    
    console.error(`[Exception] ${request.method} ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)} - Error: ${errMessage}`, errStack);

    // Sanitize response details in production to avoid stack trace leaks
    const isProd = process.env.NODE_ENV === 'production';
    const cleanMessage = status === HttpStatus.INTERNAL_SERVER_ERROR && isProd
      ? 'An internal server error occurred'
      : message;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: cleanMessage,
    });
  }
}
