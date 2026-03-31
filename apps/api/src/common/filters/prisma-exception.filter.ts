import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';

    switch (exception.code) {
      case 'P2002': {
        // Unique constraint violation
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[]) || [];

        if (target.includes('document')) {
          message = 'CPF/CNPJ já cadastrado no sistema';
        } else if (target.includes('email')) {
          message = 'Email já cadastrado no sistema';
        } else if (target.includes('name')) {
          message = 'Já existe um registro com este nome';
        } else {
          message = `Registro duplicado: ${target.join(', ')}`;
        }
        break;
      }

      case 'P2025': {
        // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Registro não encontrado';
        break;
      }

      case 'P2003': {
        // Foreign key constraint failed
        status = HttpStatus.BAD_REQUEST;
        message = 'Operação inválida: referência a registro inexistente';
        break;
      }

      case 'P2014': {
        // Required relation violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Operação inválida: relacionamento obrigatório não fornecido';
        break;
      }

      default: {
        // Generic Prisma error
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Erro ao processar operação no banco de dados';

        // Em desenvolvimento, mostra mais detalhes
        if (process.env.NODE_ENV !== 'production') {
          message = `${message} (${exception.code}: ${exception.message})`;
        }
      }
    }

    console.error('❌ Prisma Error:', {
      code: exception.code,
      message: exception.message,
      meta: exception.meta,
    });

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.code,
      timestamp: new Date().toISOString(),
    });
  }
}
