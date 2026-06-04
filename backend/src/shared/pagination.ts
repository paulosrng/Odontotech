import { z } from 'zod';

/** Parse ?page & ?limit query params with sane defaults and bounds. */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export function getPagination(query: unknown): { page: number; limit: number; skip: number; take: number } {
  const { page, limit } = paginationSchema.parse(query);
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

/** Helpers to (de)serialize string arrays stored as JSON in SQLite. */
export function parseStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((v) => String(v)) : [];
  } catch {
    // tolerate comma-separated legacy values
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

export function stringifyArray(value: unknown): string {
  if (Array.isArray(value)) return JSON.stringify(value.map((v) => String(v)));
  if (typeof value === 'string') {
    return JSON.stringify(
      value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }
  return '[]';
}
