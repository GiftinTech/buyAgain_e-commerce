import mongoose, { Error } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import app from './app';

//import listEndpoints from 'express-list-endpoints';
const databaseUri = process.env.DATABASE;
const databasePwd = process.env.DATABASE_PASSWORD;
const port = process.env.PORT || 3000;

process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

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
  } catch (err) {
    console.error('❌DB connection error:', err);
  }
})();

const server = app.listen(port, () => {
  console.log('-------------------------------');
  console.log(`Server running on port ${port}...`);
  //console.log('All my Endpoints:', listEndpoints(app));
});

process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
