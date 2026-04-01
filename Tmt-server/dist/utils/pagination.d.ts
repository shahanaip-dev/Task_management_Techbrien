import { PaginationParams, PaginatedResult } from '../types';
/** Parse & clamp pagination params from query string */
export declare function parsePagination(query: Record<string, unknown>): PaginationParams;
/** Wrap raw data + total count into a standard paginated envelope */
export declare function buildPaginated<T>(data: T[], total: number, { limit, offset }: PaginationParams): PaginatedResult<T>;
