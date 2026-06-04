import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { AppError } from '../shared/errors';
import { fail } from '../shared/response';

/** 404 handler for unmatched routes. */
export function notFoundHandler(req: Request, res: Response) {
  return fail(res, 404, `Rota não encontrada: ${req.method} ${req.originalUrl}`);
}

/** Global error handler — maps Zod, Prisma, JWT and AppError to HTTP codes. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // --- Zod validation errors -------------------------------------------
  if (err instanceof ZodError) {
    const issues = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return fail(res, 422, 'Erro de validação.', issues);
  }

  // --- App errors ------------------------------------------------------
  if (err instanceof AppError) {
    return fail(res, err.status, err.message, err.details ?? err.message);
  }

  // --- JWT errors ------------------------------------------------------
  if (err instanceof jwt.TokenExpiredError) {
    return fail(res, 401, 'Token expirado.');
  }
  if (err instanceof jwt.JsonWebTokenError) {
    return fail(res, 401, 'Token inválido.');
  }

  // --- Multer (upload) errors ------------------------------------------
  if (err instanceof multer.MulterError) {
    const msg =
      err.code === 'LIMIT_FILE_SIZE' ? 'Arquivo excede o tamanho máximo permitido.' : err.message;
    return fail(res, 400, msg, err.code);
  }

  // --- Prisma known request errors -------------------------------------
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = (err.meta?.target as string[] | string | undefined) ?? 'campo';
        return fail(res, 409, `Já existe um registro com este ${Array.isArray(target) ? target.join(', ') : target}.`);
      }
      case 'P2025':
        return fail(res, 404, 'Registro não encontrado.');
      case 'P2003':
        return fail(res, 400, 'Violação de chave estrangeira (referência inexistente).');
      default:
        return fail(res, 400, `Erro de banco de dados (${err.code}).`, err.message);
    }
  }
  if (err instanceof Prisma.PrismaClientValidationError) {
    return fail(res, 400, 'Dados inválidos para a operação no banco.', err.message);
  }

  // --- Fallback --------------------------------------------------------
  // eslint-disable-next-line no-console
  console.error('[UNHANDLED ERROR]', err);
  const message = err instanceof Error ? err.message : 'Erro interno do servidor.';
  return fail(res, 500, 'Erro interno do servidor.', process.env.NODE_ENV === 'production' ? undefined : message);
}
