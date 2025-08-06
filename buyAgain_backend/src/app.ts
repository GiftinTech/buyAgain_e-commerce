// core modules
import path from 'path';

// third-party modules
import express from 'express';

// custom modules
import userRouter from './routes/userRoutes';
import productRouter from './routes/productRoutes';
import reviewRouter from './routes/reviewRoutes';
import orderRouter from './routes/orderRoutes';

// start the express app
const app = express();

// Body parser: read data from body into req.body
app.use(express.json({ limit: '10kb' }));

// GLOBAL MW
// Serve static files in public/
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.send('API Running 🏃‍♀️'));
app.use('/api/v1/user', userRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/order', orderRouter);

export default app;
