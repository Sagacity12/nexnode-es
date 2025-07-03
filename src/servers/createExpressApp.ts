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
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers 
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
 });

 export const createExpressApp = async () => {
    const app = express()

    const mongoStore = connectMongo(session);

    const mongoUrl = process.env.MONGO_URI || process.env.MONGO_URL;

    if (!mongoUrl) {
        throw new Error('MONGO_URL is not defined');
    }
    const store = new mongoStore({
        uri: mongoUrl,
        collection: 'sessions',
    });

    store.on('error', (err: any) => {
        logger.error('Session store error:', err);
    });

    app.set('trust proxy', 1); // Trust first proxy

    app.use(express.json({ limit: "50mb" })); // Limit JSON body size to 50mb
    app.use(limiter);
    app.use(helmet(HelmetOptions)); // Use Helmet for security headers
    app.use(helmet.hidePoweredBy()); // Remove X-Powered-By header


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
