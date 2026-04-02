package errors

type AppError struct {
	StatusCode int
	Message    string
}

func (e AppError) Error() string {
	return e.Message
}
