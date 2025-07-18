import winston from 'winston';
import { format } from 'winston';

const { combine, timestamp, printf, colorize, json } = format;

export const logger = winston.createLogger({
    level: 'info',
    format: combine(
        winston.format.errors({ stack: true }), 
        colorize(),
        timestamp(),
        printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`;
        }),
        json() 
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ]
})

if(process.env.NODE_ENV !== 'production'){
    logger.add(
        new winston.transports.Console({ format: winston.format.simple() })
    )
}