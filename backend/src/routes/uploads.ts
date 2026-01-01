import { Router, Response } from 'express';
import multer from 'multer';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { uploadFile, getUploadSignedUrl, deleteFile } from '../services/s3.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

// Upload file directly
router.post(
  '/',
  authenticate,
  upload.single('file'),
  catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const { folder = 'uploads' } = req.body;

    const result = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      folder
    );

    res.json({
      url: result.url,
      key: result.key,
    });
  })
);

// Get signed upload URL (for client-side upload)
router.post(
  '/signed-url',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { filename, mimetype, folder = 'uploads' } = req.body;

    if (!filename || !mimetype) {
      throw new AppError('Filename and mimetype are required', 400);
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(mimetype)) {
      throw new AppError('Invalid file type', 400);
    }

    const result = await getUploadSignedUrl(filename, mimetype, folder);

    res.json(result);
  })
);

// Delete file
router.delete(
  '/',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { key } = req.body;

    if (!key) {
      throw new AppError('File key is required', 400);
    }

    await deleteFile(key);

    res.json({ message: 'File deleted successfully' });
  })
);

export default router;
