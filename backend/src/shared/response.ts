import { Response } from 'express';

/** Standard success envelope: { success, data, message? } */
export function ok<T>(res: Response, data: T, message?: string, status = 200) {
  return res.status(status).json({ success: true, data, ...(message ? { message } : {}) });
}

export function created<T>(res: Response, data: T, message?: string) {
  return ok(res, data, message, 201);
}

/** Standard error envelope: { success, error, message } */
export function fail(res: Response, status: number, message: string, error?: unknown) {
  return res.status(status).json({
    success: false,
    message,
    error: error ?? message,
  });
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

/** Build the paginated envelope expected by all list endpoints. */
export function paginated<T>(res: Response, items: T[], total: number, page: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const payload: Paginated<T> = { data: items, total, page, totalPages };
  return res.status(200).json({ success: true, ...payload });
}
