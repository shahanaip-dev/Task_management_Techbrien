import { Pool } from 'pg';
import { JwtUser } from '../types';
interface StatusCounts {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
}
export declare class DashboardService {
    private readonly db;
    constructor(db: Pool);
    getSummary(user: JwtUser): Promise<{
        totals: {
            tasks: number;
            projects: number;
            tasksDone: number;
            tasksInProgress: number;
            teamMembers: number;
        };
        statusCounts: StatusCounts;
        projectTaskCounts: {
            name: string;
            value: number;
        }[];
    } | {
        totals: {
            tasks: number;
            projects: number;
            tasksDone: number;
            tasksInProgress: number;
            teamMembers?: undefined;
        };
        statusCounts: StatusCounts;
        projectTaskCounts: {
            name: string;
            value: number;
        }[];
    }>;
}
export {};
