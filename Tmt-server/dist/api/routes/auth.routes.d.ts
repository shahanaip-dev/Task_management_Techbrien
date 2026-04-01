import { Router } from 'express';
import { Pool } from 'pg';
export declare function authRouter(db: Pool): Router;
