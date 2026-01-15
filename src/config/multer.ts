import multer from "multer";
import path from "path";

// Configure memory storage for S3 uploads
let counter = 0;
const storage = multer.memoryStorage();

// File filter for images and PDFs
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // const allowedTypes = ["image/jpeg", "image/png", "image/jpg","image/webp", "application/pdf"];
  // if (!allowedTypes.includes(file.mimetype)) {
  //   return cb(new Error("Only image and PDF files are allowed"));
  // }
  cb(null, true);
};

// Generate unique filename
export const generateFileName = (originalname: string): string => {
  const timestamp = Date.now();
  const count = counter++;
  const ext = path.extname(originalname);
  return `${timestamp}-${count}${ext}`;
};

// ✅ Export Multer instance (memory storage for S3)
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
});
