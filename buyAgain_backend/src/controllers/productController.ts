import Product, { IProduct } from '../models/productModel';
import multer, { Multer, StorageEngine } from 'multer';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';

import factory from './controllerFactory';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { CustomRequest } from '../types';

// upload product photos
// expected files object type from Multer
interface ProductFiles {
  thumbnail?: Express.Multer.File[];
  images?: Express.Multer.File[];
}

// Create a type guard function to check if files are the expected object type
function isProductFiles(files: any): files is ProductFiles {
  return files && typeof files === 'object' && !Array.isArray(files);
}

const multerStorage: StorageEngine = multer.diskStorage({
  destination: (
    req: CustomRequest,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    cb(null, '../../public/img/products');
  },
  filename: (
    req: CustomRequest,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    const ext = file.mimetype.split('/')[1];
    if (!req.product || !req.product.id) {
        return cb(new Error('product ID is missing from the request.'), '');
    }
    cb(null, `product-${req.product.id}-${Date.now()}.${ext}`);
  },
});

// Defines the storage engine for Multer to store the file in memory as a Buffer
//const multerStorage: StorageEngine = multer.memoryStorage();

// Defines a filter to accept only image files
const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith('image')) {
    // If it's an image, accept the file
    cb(null, true);
  } else {
    // If not an image, reject the file with a custom error
    cb(new AppError('Not an image! Please upload only images', 400));
  }
};

// Initializes a Multer instance with the defined storage and filter
const upload: Multer = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Middleware to handle uploading multiple files with different field names
const uploadProductPhotos = upload.fields([
  { name: 'images', maxCount: 6 }, // Allows up to 6 files for the 'images' field
  { name: 'thumbnail', maxCount: 1 }, // Allows 1 file for the 'thumbnail' field
]);

// AMW to resize the uploaded photos
const resizeProductPhotos = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('3. Inside the next middleware');
    // Checks if any files were uploaded; if not, move to the next middleware
    if (!req.files || !isProductFiles(req.files)) {
      return next(
        new AppError(
          'No files uploaded or files are in an unexpected format.',
          400,
        ),
      );
    }

    const files: ProductFiles = req.files;

    // Handle the thumbnail
    if (files.thumbnail && files.thumbnail[0]) {
      (req.body as CustomRequest).thumbnail =
        `product-${(req as any).product.id}-${Date.now()}-thumbnail.jpeg`;
      await sharp(files.thumbnail[0].buffer)
        .resize(800, 800)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/products/${(req.body as CustomRequest).thumbnail}`);
    }

    // Handle the product images
    if (files.images && files.images.length > 0) {
      (req.body as CustomRequest).images = [];
      await Promise.all(
        files.images.map(async (file: Express.Multer.File, i: number) => {
          const filename = `product-${(req as any).product.id}-${Date.now()}-${i + 1}.jpeg`;
          await sharp(file.buffer)
            .resize(800, 800)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/products/${filename}`);

          console.log(
            'Saving thumbnail to:',
            `public/img/products/${(req.body as any).thumbnail}`,
          );
          console.log('Saving product images:', (req.body as any).images);
          (req.body as CustomRequest).images!.push(filename);
        }),
      );
    }

    next();
  },
);
// product handlers
const getAllProducts = factory.getAll<IProduct>(Product, 'products');

const getProduct = factory.getOne<IProduct>(Product, 'products');

const addProduct = factory.createOne<IProduct>(Product, 'product');

const updateProduct = factory.updateOne<IProduct>(Product, 'product');

const deleteProduct = factory.deleteOne<IProduct>(Product, 'product');

export default {
  getAllProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadProductPhotos,
  resizeProductPhotos,
};
