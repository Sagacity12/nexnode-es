import { NextFunction, Request, Response } from 'express';
interface HttpError extends Error {
    status: number;
    statusCode: number;
    expose: boolean;
    header?: {
        [key: string]: string;
    };
}
declare const errorHandler: (err: HttpError, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export default errorHandler;
//# sourceMappingURL=error-Handler.d.ts.map