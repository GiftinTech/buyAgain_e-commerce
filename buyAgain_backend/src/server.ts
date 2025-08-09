import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import AppError from './utils/appError';
//import listEndpoints from 'express-list-endpoints';
const databaseUri = process.env.DATABASE;
const databasePwd = process.env.DATABASE_PASSWORD;
const port = process.env.PORT || 3000;

if (!databaseUri || !databasePwd || !port) {
  throw new Error('ERROR❌: databaseUri, databasePwd or port not found');
}

const DB = databaseUri.replace('<db_password>', databasePwd);

(async () => {
  try {
    await mongoose.connect(DB);
    console.log('-------------------------------');
    console.log('DB Connection Successful ✅');
    console.log('-------------------------------');
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}...`);
      console.log('-------------------------------');
      // console.log('All my Endpoints:', listEndpoints(app));
    });
  } catch (err) {
    console.error('❌DB connection error:', err);
  }
})();
