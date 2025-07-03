import { Request, Response, NextFunction} from 'express';
import createError from 'http-errors';
import { jwtVerify } from '../helpers/helper';
import { logger } from '../logger/logger';  
import createHttpError from 'http-errors';
import { isTokenBlacklisted } from '@/helpers/blacklisted';

/**
 * Extent Express Request with user property
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 * @returns - Express middleware function
 */
declare global {
    namespace Express {
        interface Request {
            user?: any;
            token?: string;
        }
    }
}

/**
 * Authentication middlware to protect routes
 * Verifies JWT token and checks if user is blacklisted
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 * @returns - Express middleware function
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        const tokenHeader = Array.isArray(authHeader) ? authHeader[0] : authHeader;
        if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) {
            return next(createHttpError.Unauthorized("Unauthorized: No token provided"));
        }
        const token = tokenHeader.split(' ')[1];
        if (!token) {
            return next(createHttpError.Unauthorized("Unauthorized: No token provided"));
        }
        const data = jwtVerify(token);
        if(!data.id) throw new createHttpError.Unauthorized("Unauthorized: Invalid token");
        const isBlacklisted = await isTokenBlacklisted(token);
        if (isBlacklisted) {
            return next(createHttpError.Unauthorized("Unauthorized: Token is blacklisted"));
        }
        req.user = data;
        req.token = token;
        next();
    } catch (error) {
        logger.error("Authentication middleware error:", error);
        return next(createHttpError.Unauthorized("Unauthorized: Invalid token"));
    }
};

/**
 * Role-based authorization middleware 
 */
export const authorizeRoles = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            return next(createHttpError.Forbidden("Forbidden: You do not have permission to access this resource"));
        }
        logger.info(`User with role ${userRole} is authorized to access this resource`);
        next();
    };
};

export default { authMiddleware, authorizeRoles }; 