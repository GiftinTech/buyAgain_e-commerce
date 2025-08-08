// core modules
import path from 'path';

// third-party modules
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// custom modules
import authRouter from './routes/authRoutes';
// import userRouter from './routes/userRoutes';
import productRouter from './routes/productRoutes';
// import reviewRouter from './routes/reviewRoutes';
// import orderRouter from './routes/orderRoutes';
import globalErrorHandler from './controllers/errorController';
import AppError from './utils/appError';

// start the express app
const app = express();

app.set('trust proxy', 1); // Allow Express to trust reverse proxy headers (e.g., for Heroku/Render)
app.get('/ip', (request, response) => {
  console.log(request.headers);
	response.send(request.ip);
});
// GLOBAL MIDDLEWARES
// Enable CORS for cross-origin requests
app.use(cors());

if (process.env.NODE_ENV === 'develpment') app.options('*', cors());
else if (process.env.NODE_ENV === 'production') {
  const corsOptions = {
    origin: ['http://localhost:5173', 'https://buyAgain.vercel.app'], // allowed origins
    credentials: true, // allow cookies/auth headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // allowed headers
  };

  app.use(cors(corsOptions));
}

// Serve static files in public/
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parser: read data from body into req.body
app.use(express.json({ limit: '10kb' })); // limits the amount of data that comes in body

// Parse form data (x-www-form-urlencoded) with a size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser()); // Parse cookies from incoming requests

// Custom MW to make req.query mutable and writable
// b/c express-mongo-sanitize needs req.query to be writable, but Express v5 makes it read-only. The MW makes req.query writable.
app.use((req: Request, res: Response, next: NextFunction) => {
  const originalQuery = req.query;
  Object.defineProperty(req, 'query', {
    value: { ...originalQuery },
    writable: true,
    enumerable: true,
    configurable: true,
  });
  next();
});

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['ratingsQuantity', 'ratingsAverage', 'price'],
  }),
);

// Helps reduce the size of the response body, improving performance and load times
app.use(compression());

// Hide Express version info
app.disable('x-powered-by');

// convert htpps to https in prod
if (process.env.NODE_ENV === 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      return next();
    }
    res.redirect('https://' + req.headers.host + req.url);
  });
}

// middleware function to handle unknown routes
const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};

app.get('/', (req: Request, res: Response) => res.send('API Running 🏃‍♀️'));

// Mount all routers
app.use('/api/v1/auth', authRouter);
// //app.use('/api/v1/user', userRouter);
app.use('/api/v1/product', productRouter);
// // app.use('/api/v1/review', reviewRouter);
// // app.use('/api/v1/order', orderRouter);

// use MW func to handle unknown routes
app.use(notFoundHandler);

// globalErrorHandler to catch all errors in the app
app.use(globalErrorHandler);

export default app;
