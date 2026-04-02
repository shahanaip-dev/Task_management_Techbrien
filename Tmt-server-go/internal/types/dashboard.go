package types

type StatusCounts struct {
	Todo       int `json:"TODO"`
	InProgress int `json:"IN_PROGRESS"`
	Done       int `json:"DONE"`
}

type ProjectTaskCount struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

type DashboardTotals struct {
	Tasks           int  `json:"tasks"`
	Projects        int  `json:"projects"`
	TasksDone       int  `json:"tasksDone"`
	TasksInProgress int  `json:"tasksInProgress"`
	TeamMembers     *int `json:"teamMembers,omitempty"`
}

type DashboardSummary struct {
	Totals            DashboardTotals   `json:"totals"`
	StatusCounts      StatusCounts      `json:"statusCounts"`
	ProjectTaskCounts []ProjectTaskCount `json:"projectTaskCounts"`
}
