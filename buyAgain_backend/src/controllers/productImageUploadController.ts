import multer, { Multer, StorageEngine } from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';

import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { CustomRequest } from '../types';

interface ProductFiles {
  thumbnail?: Express.Multer.File[];
  images?: Express.Multer.File[];
}

function isProductFiles(files: any): files is ProductFiles {
  return files && typeof files === 'object' && !Array.isArray(files);
}

// 1. Multer storage in memory
const multerStorage: StorageEngine = multer.memoryStorage();

// 2. File filter
const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400));
  }
};

const upload: Multer = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// 3. Upload fields
const uploadProductPhotos = upload.fields([
  { name: 'images', maxCount: 6 },
  { name: 'thumbnail', maxCount: 1 },
]);

// 4. Resize & upload to Cloudinary
const processProductPhotos = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const product = req.product || res.locals.product;

    if (!product) {
      return next(
        new AppError(
          'Product not found in the request. Ensure getProduct middleware runs first.',
          400,
        ),
      );
    }

    if (!req.files || !isProductFiles(req.files)) return next();

    const files: ProductFiles = req.files;

    // Preserve existing images
    const newImagesArray = req.product.images ? [...req.product.images] : [];
    console.log('newImagesArray:', newImagesArray);
    // Handle images
    if (files.images && files.images.length > 0) {
      const processedImages = await Promise.all(
        files.images.map(async (file, i) => {
          const filename = `product-${req.product.id}-${Date.now()}-${i + 1}.jpeg`;

          const buffer = await sharp(file.buffer)
            .resize(800, 800)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toBuffer();

          // Cloudinary upload with Promise wrapper
          return new Promise<string>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'products',
                public_id: filename.replace('.jpeg', ''),
              },
              (error, result) => {
                if (error || !result) return reject(error);
                resolve(result.secure_url);
              },
            );
            stream.end(buffer);
          });
        }),
      );

      newImagesArray.push(...processedImages);
    }

    req.body.images = newImagesArray;
    console.log('request body images:', req.body.images);

    // Handle thumbnail
    if (files.thumbnail && files.thumbnail[0]) {
      const filename = `product-${req.product.id}-${Date.now()}-thumbnail.jpeg`;

      const buffer = await sharp(files.thumbnail[0].buffer)
        .resize(800, 800)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toBuffer();

      req.body.thumbnail = await new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'products',
            public_id: filename.replace('.jpeg', ''),
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result.secure_url);
          },
        );
        stream.end(buffer);
      });
      console.log('Thumbnail:', req.body.thumbnail);
    }

    next();
  },
);

// Default export all product middlewares
export default {
  uploadProductPhotos,
  processProductPhotos,
};
