import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { EmailAlreadyInUseError } from '../../domain/errors/email-already-in-use.error';
import { InvalidUserDataError } from '../../domain/errors/invalid-user-data.error';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';

@Catch(UserNotFoundError, EmailAlreadyInUseError, InvalidUserDataError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = statusFor(exception);

    response.status(status).json({
      statusCode: status,
      error: HttpStatus[status],
      message: exception.message,
    });
  }
}

function statusFor(error: Error): HttpStatus {
  if (error instanceof UserNotFoundError) {
    return HttpStatus.NOT_FOUND;
  }

  if (error instanceof EmailAlreadyInUseError) {
    return HttpStatus.CONFLICT;
  }

  return HttpStatus.UNPROCESSABLE_ENTITY;
}
