import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import app from './app';

const databaseUri = process.env.DATABASE!;
const databasePwd = process.env.DATABASE_PASSWORD!;

const DB = databaseUri.replace('<db_password>', databasePwd);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await mongoose.connect(DB);
    console.log('DB connection Successful ✅');
    const server = app.listen(port, () =>
      console.log(`Server running on port ${port}...`)
    );
  } catch (err) {
    console.error('❌DB connection error:', err);
  }
};

start();
