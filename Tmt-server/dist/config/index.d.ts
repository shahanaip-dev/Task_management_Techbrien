export declare const config: {
    readonly app: {
        readonly env: string;
        readonly port: number;
        readonly isDev: boolean;
    };
    readonly db: {
        readonly user: string;
        readonly host: string;
        readonly database: string;
        readonly password: string;
        readonly port: number;
    };
    readonly jwt: {
        readonly secret: string;
        readonly expiresIn: string;
    };
    readonly cors: {
        readonly origin: string;
    };
};
