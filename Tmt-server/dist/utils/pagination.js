"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = parsePagination;
exports.buildPaginated = buildPaginated;
/** Parse & clamp pagination params from query string */
function parsePagination(query) {
    const limit = parseInt(String(query.limit ?? '10'), 10);
    const offset = parseInt(String(query.offset ?? '0'), 10);
    return {
        limit: isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100),
        offset: isNaN(offset) || offset < 0 ? 0 : offset,
    };
}
/** Wrap raw data + total count into a standard paginated envelope */
function buildPaginated(data, total, { limit, offset }) {
    return {
        data,
        meta: {
            total,
            limit,
            offset,
            totalPages: Math.ceil(total / limit),
            currentPage: Math.floor(offset / limit) + 1,
        },
    };
}
//# sourceMappingURL=pagination.js.map