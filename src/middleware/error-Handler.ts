import createError from 'http-errors';
import { NextFunction, Request, Response } from 'express';
import { logger, rollbar } from '../logger/index';
import { constructHttpErrorResponse } from '../helpers/helper';

interface HttpError extends Error {
    status: number;
    statusCode: number;
    expose: boolean;
    header?: {
        [key: string]: string;
    };
}
    
/**
 * Error handling middleware for Express applications.
 * Logs the error and sends a structured response.
 * Catch all error and return a custom error response.
 * @param err - The error object
 * @param req - The request object
 * @param res - The response object
 * @param next - The next middleware function
 */
const errorHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error(err.message, err);
    rollbar.error(err);
    
    if (process.env.NODE_ENV === 'production') {
        constructHttpErrorResponse (
            null,
            createError(500, ' Internal Server Error'),
            500
        )(res);
    }
    
    return constructHttpErrorResponse(null, err, err.statusCode || 500)(res);
    
};

export default errorHandler;

