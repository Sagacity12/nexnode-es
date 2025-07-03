import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: any;
            token?: string;
        }
    }
}
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeRoles: (allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
declare const _default: {
    authMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    authorizeRoles: (allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
};
export default _default;
//# sourceMappingURL=authmiddleware.d.ts.map