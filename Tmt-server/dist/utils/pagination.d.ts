import { CursorParams, CursorResult } from '../types';
export declare function parseCursorPagination(query: Record<string, unknown>): CursorParams;
export declare function encodeCursor(createdAt: Date | string, id: string): string;
export declare function decodeCursor(cursor?: string): {
    createdAt: string;
    id: string;
} | null;
export declare function buildCursorResult<T>(rows: T[], limit: number, getCursor: (row: T) => string): CursorResult<T>;
