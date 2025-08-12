import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

// Configure multer disk storage
const multerStorage = multer.memoryStorage();

// Only allow images
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

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// Middleware to handle single file

const uploadUserPhoto = upload.single('photo');

// Resize and save final image
const resizeUserPhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next();
    }

    if (!req.file.buffer) {
      return next(new AppError('No file buffer found.', 400));
    }

    const outputDir = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'img',
      'users',
    );
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `user-${(req as any).user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(path.join(outputDir, filename));

    req.body.photo = filename; // DB update this

    next();
  },
);

export default {
  uploadUserPhoto,
  resizeUserPhoto,
};
