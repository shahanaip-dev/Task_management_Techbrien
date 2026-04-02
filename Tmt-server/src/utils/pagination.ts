import { CursorParams, CursorResult } from '../types';

// Parse & clamp cursor pagination params from query string
export function parseCursorPagination(query: Record<string, unknown>): CursorParams {
  const limit = parseInt(String(query.limit ?? '10'), 10);
  const cursor = typeof query.cursor === 'string' && query.cursor.trim() ? query.cursor.trim() : undefined;

  return {
    limit: isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100),
    cursor,
  };
}

// Cursor format: ISO_TIMESTAMP|UUID
export function encodeCursor(createdAt: Date | string, id: string): string {
  const iso = typeof createdAt === 'string' ? new Date(createdAt).toISOString() : createdAt.toISOString();
  return `${iso}|${id}`;
}

export function decodeCursor(cursor?: string): { createdAt: string; id: string } | null {
  if (!cursor) return null;
  const [createdAt, id] = cursor.split('|');
  if (!createdAt || !id) return null;
  return { createdAt, id };
}

export function buildCursorResult<T>(
  rows: T[],
  limit: number,
  getCursor: (row: T) => string
): CursorResult<T> {
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore && data.length ? getCursor(data[data.length - 1]) : undefined;

  return {
    data,
    meta: {
      limit,
      hasMore,
      nextCursor,
    },
  };
}