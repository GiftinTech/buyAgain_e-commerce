import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/productModel';
import User from '../models/userModel';
import Cart from '../models/cartModel';
import Review from '../models/reviewModel';

// i. connect to DB
dotenv.config();

const Uri = process.env.DATABASE!;
const DBPwd = process.env.DATABASE_PASSWORD!;

const DB = Uri.replace('<db_password>', DBPwd);

if (!DB) console.log('DB URI and PWD incorrect');

(async () => {
  try {
    await mongoose.connect(DB);
    console.log('---------------------------------------------');
    console.log('DB Connection from Dev-Data Successful ✅');
    console.log('---------------------------------------------');
  } catch (err) {
    console.error('❌DB connection error:', err);
  }
})();

// ii. parse json into js obj and read the parsed obj
const products = JSON.parse(
  fs.readFileSync(`${__dirname}/updated-product-data.json`, 'utf-8'),
);

// const users = JSON.parse(
//   fs.readFileSync(`${__dirname}/user-data.json`, 'utf-8'),
// );

// iii. import data into DB
const importData = async () => {
  try {
    await Product.create(products);
    //await User.create(users);
    console.log('Data successfully loaded!✅');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// iv. Delete all Data from DB
const deleteData = async () => {
  try {
    await Product.deleteMany();
    //await User.deleteMany();
    console.log('Data successfully deleted❌🚮!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// v. Condition to check for
if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();

//console.log(process.argv);
// To run:
// Typescript: ts-node ./src/dev-data/import-dev-data.ts --import
// JavaScript:  node ./src/dev-data/import-dev-data.ts --import
