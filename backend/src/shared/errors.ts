/** Application-level error carrying an HTTP status code. */
export class AppError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details;
  }
}

export const NotFound = (entity = 'Recurso') => new AppError(404, `${entity} não encontrado.`);
export const Unauthorized = (msg = 'Não autenticado.') => new AppError(401, msg);
export const Forbidden = (msg = 'Acesso negado.') => new AppError(403, msg);
export const BadRequest = (msg = 'Requisição inválida.') => new AppError(400, msg);
export const Conflict = (msg = 'Conflito de dados.') => new AppError(409, msg);
