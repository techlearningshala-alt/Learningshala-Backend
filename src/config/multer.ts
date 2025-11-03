import multer from "multer";
import path from "path";

// Configure storage
let counter = 0;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const count = counter++;
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${count}${ext}`); // ✅ Unique with counter
  },
});

// File filter for images and PDFs
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // const allowedTypes = ["image/jpeg", "image/png", "image/jpg","image/webp", "application/pdf"];
  // if (!allowedTypes.includes(file.mimetype)) {
  //   return cb(new Error("Only image and PDF files are allowed"));
  // }
  cb(null, true);
};

// ✅ Export Multer instance (without calling .any() here)
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});
