import fs from 'fs';
import path from 'path';

import multer, { Multer, StorageEngine } from 'multer';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';

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

// 1. Configure Multer to store the file in memory
const multerStorage: StorageEngine = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400));
  }
};

const upload: Multer = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadProductPhotos = upload.fields([
  { name: 'images', maxCount: 6 },
  { name: 'thumbnail', maxCount: 1 },
]);

const resizeProductPhotos = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      // check to prevent TypeError
      if (!req.product || !req.product.id) {
        console.error('Error: req.product or req.product.id is undefined');
        return next(
          new AppError(
            'Product not found in the request. Make sure getProduct middleware is running first.',
            400,
          ),
        );
      }

      if (!req.files || !isProductFiles(req.files)) {
        return next();
      }

      const files: ProductFiles = req.files;
      const outputDir = path.join(
        __dirname,
        '..',
        '..',
        'public',
        'img',
        'products',
      );
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Correctly merge existing images with new ones
      // Start with the existing images from the DB to preserve them
      const newImagesArray = req.product.images ? [...req.product.images] : [];
      // Process and save product images using the file buffer
      if (files.images && files.images.length > 0) {
        await Promise.all(
          files.images.map(async (file: Express.Multer.File, i: number) => {
            const filename = `product-${req.product.id}-${Date.now()}-${i + 1}.jpeg`;
            await sharp(file.buffer)
              .resize(800, 800)
              .toFormat('jpeg')
              .jpeg({ quality: 90 })
              .toFile(path.join(outputDir, filename));

            newImagesArray.push(filename);
          }),
        );
      }
      req.body.images = newImagesArray; // Assign the merged array to the request body

      // Process and save thumbnail using the file buffer
      if (files.thumbnail && files.thumbnail[0]) {
        const filename = `product-${req.product.id}-${Date.now()}-thumbnail.jpeg`;
        await sharp(files.thumbnail[0].buffer)
          .resize(800, 800)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(path.join(outputDir, filename));

        req.body.thumbnail = filename; // This will replace the existing thumbnail
      }

      console.log('Final req.body.thumbnail:', req.body.thumbnail);
      console.log('Final req.body.images:', req.body.images);
      console.log('Final req.body:', req.body);
      next();
    } catch (err) {
      console.error('Error in resizeProductPhotos:', err);
      next(new AppError('Error in resizeProductPhotos', 400));
    }
  },
);

export default {
  uploadProductPhotos,
  resizeProductPhotos,
};
