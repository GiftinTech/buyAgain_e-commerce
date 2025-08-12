import { v2 as cloudinary } from 'cloudinary';
import { Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import { CustomRequest } from '../types';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// New Cloudinary middleware
const uploadImagesToCloudinary = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    // The 'req.file.buffer' here already contains the resized image
    const imageUrl = await new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'users', format: 'jpeg' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        },
      );
      stream.end(req.file.buffer);
    });

    // Save the URL to the request body for the next controller
    req.body.photo = imageUrl;
    next();
  },
);

export default {
  uploadImagesToCloudinary,
};
