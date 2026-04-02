"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCursorPagination = parseCursorPagination;
exports.encodeCursor = encodeCursor;
exports.decodeCursor = decodeCursor;
exports.buildCursorResult = buildCursorResult;
// Parse & clamp cursor pagination params from query string
function parseCursorPagination(query) {
    const limit = parseInt(String(query.limit ?? '10'), 10);
    const cursor = typeof query.cursor === 'string' && query.cursor.trim() ? query.cursor.trim() : undefined;
    return {
        limit: isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100),
        cursor,
    };
}
// Cursor format: ISO_TIMESTAMP|UUID
function encodeCursor(createdAt, id) {
    const iso = typeof createdAt === 'string' ? new Date(createdAt).toISOString() : createdAt.toISOString();
    return `${iso}|${id}`;
}
function decodeCursor(cursor) {
    if (!cursor)
        return null;
    const [createdAt, id] = cursor.split('|');
    if (!createdAt || !id)
        return null;
    return { createdAt, id };
}
function buildCursorResult(rows, limit, getCursor) {
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
//# sourceMappingURL=pagination.js.map