import { Router } from 'express';
import { Pool } from 'pg';
export declare function createV1Router(db: Pool): Router;
