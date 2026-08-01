import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{ status: (code: number) => { json: (data: any) => void } }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === "string"
          ? res
          : (res as any).message?.toString() ?? exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (status >= 500) {
      console.error("[ExceptionFilter]", exception);
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
