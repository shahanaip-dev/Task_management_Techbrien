import { Response } from 'express';
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number) => void;
export declare const sendCreated: <T>(res: Response, data: T, message?: string) => void;
export declare const sendError: (res: Response, message: string, statusCode?: number, errors?: string[]) => void;
