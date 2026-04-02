package pagination

import (
	"strconv"
	"strings"
	"time"

	"tmt-server-go/internal/types"
)

type CursorParams struct {
	Limit  int
	Cursor string
}

func ParseCursorParams(limitStr, cursorStr string) CursorParams {
	limit := 10
	if limitStr != "" {
		if n, err := strconv.Atoi(limitStr); err == nil {
			if n < 1 {
				limit = 10
			} else if n > 100 {
				limit = 100
			} else {
				limit = n
			}
		}
	}

	cursor := strings.TrimSpace(cursorStr)
	return CursorParams{Limit: limit, Cursor: cursor}
}

func EncodeCursor(createdAt time.Time, id string) string {
	return createdAt.UTC().Format(time.RFC3339Nano) + "|" + id
}

func DecodeCursor(cursor string) (createdAt string, id string, ok bool) {
	if cursor == "" {
		return "", "", false
	}
	parts := strings.Split(cursor, "|")
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return "", "", false
	}
	return parts[0], parts[1], true
}

func BuildCursorResult[T any](rows []T, limit int, getCursor func(T) string) types.CursorResult[T] {
	hasMore := len(rows) > limit
	data := rows
	if hasMore {
		data = rows[:limit]
	}
	var nextCursor *string
	if hasMore && len(data) > 0 {
		c := getCursor(data[len(data)-1])
		nextCursor = &c
	}

	return types.CursorResult[T]{
		Data: data,
		Meta: types.CursorMeta{
			Limit:     limit,
			HasMore:   hasMore,
			NextCursor: nextCursor,
		},
	}
}
