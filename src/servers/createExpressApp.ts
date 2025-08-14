import express from 'express';
import limit from 'express-rate-limit';
 import session from 'express-session';
 import  connectMongo  from 'connect-mongodb-session';
 import helmet, { HelmetOptions } from 'helmet';


 const logger = {
    error: (...args: any[]) => console.error(...args),
 };

 const HelmetOptions: HelmetOptions = {
   contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
 }

 const limiter = limit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Too many requests, please try again later.',
    standardHeaders: true, 
    legacyHeaders: false, 
 });

 export const createExpressApp = async () => {
    const app = express()

    const mongoStore = connectMongo(session);

    const mongoUrl = process.env.MONGODB_URI;

    if (!mongoUrl) {
        throw new Error('MONGODB_URI is not defined');
    }
    const store = new mongoStore({
        uri: mongoUrl,
        collection: 'sessions',
    });

    store.on('error', (err: any) => {
        logger.error('Session store error:', err);
    });

    app.set('trust proxy', 1); 

    app.use(express.json({ limit: "50mb" })); 
    app.use(limiter);
    app.use(helmet(HelmetOptions)); 
    app.use(helmet.hidePoweredBy()); 


    app.use(express.urlencoded({ extended: true })); 

    const sessionSecret = process.env.SESSION_SECRET;

    if (!sessionSecret) {
        throw new Error('SESSION_SECRET is not defined');
    }
    app.use(session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);

   app.get('/', (req, res) => {
    res.send('Nexnode API is working!');    
   })

    return app;
 }
