import multer from 'multer';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import { Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { CustomRequest } from '../types';

// Configure Multer to store files in memory
const multerStorage = multer.memoryStorage();

// Multer filter to allow only images
const multerFilter = (
  req: CustomRequest,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  console.log('Incoming file:', file?.mimetype, file?.originalname);
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400));
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// Middleware to handle single file upload from the 'photo' field
const uploadUserPhoto = upload.single('photo');

// Middleware to resize and format the uploaded image
const resizeUserPhoto = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.file) {
      console.log('No File FOund');
      return next();
    }

    if (!req.file.buffer) {
      console.log('No File Buffer FOund');
      return next(new AppError('No file buffer found.', 400));
    }

    req.file.filename = `user-${(req as any).user.id}-${Date.now()}.jpeg`;

    req.file.buffer = await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    next();
  },
);

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware to upload the resized image buffer to Cloudinary
const uploadImagesToCloudinary = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // if (!req.file) return next();

    const imageUrl = await new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'users',
          public_id: req.file.filename.replace(/\.[^/.]+$/, ''), // strip extension
          format: 'jpeg',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            reject(new AppError('Image upload failed.', 500));
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new AppError('Image upload failed with no result.', 500));
          }
        },
      );

      stream.end(req.file.buffer);
    });

    req.body.photo = imageUrl;
    next();
  },
);

export default { uploadUserPhoto, resizeUserPhoto, uploadImagesToCloudinary };
