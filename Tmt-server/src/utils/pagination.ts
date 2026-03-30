import { PaginationParams, PaginatedResult } from '../types';

/** Parse & clamp pagination params from query string */
export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const limit  = parseInt(String(query.limit  ?? '10'), 10);
  const offset = parseInt(String(query.offset ?? '0'),  10);
  return {
    limit:  isNaN(limit)  || limit  < 1  ? 10 : Math.min(limit, 100),
    offset: isNaN(offset) || offset < 0  ? 0  : offset,
  };
}

/** Wrap raw data + total count into a standard paginated envelope */
export function buildPaginated<T>(
  data: T[],
  total: number,
  { limit, offset }: PaginationParams
): PaginatedResult<T> {
  return {
    data,
    meta: {
      total,
      limit,
      offset,
      totalPages:  Math.ceil(total / limit),
      currentPage: Math.floor(offset / limit) + 1,
    },
  };
}
