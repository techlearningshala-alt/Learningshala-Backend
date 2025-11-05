# AWS S3 Image Upload Implementation

## ✅ Implementation Complete

All image uploads have been migrated from local file storage to AWS S3.

## 📋 Environment Variables Required

Add these to your `.env` file (do NOT commit `.env` to git):

```env
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name
AWS_S3_BASE_URL=https://your-s3-bucket-name.s3.ap-south-1.amazonaws.com
```

**⚠️ Important:** Replace the placeholder values with your actual AWS credentials. Never commit `.env` file to version control.

## 🔧 Changes Made

### 1. **New Files Created:**
   - `src/config/s3.ts` - S3 client configuration and upload/delete utilities

### 2. **Updated Files:**
   - `src/config/multer.ts` - Changed from `diskStorage` to `memoryStorage` for S3 uploads
   - `src/controllers/courses/specialization.controller.ts` - S3 upload for thumbnails
   - `src/controllers/courses/course.controller.ts` - S3 upload for thumbnails
   - `src/controllers/universities/university.controller.ts` - S3 upload for logos, brochures, banners, and section images
   - `src/controllers/mentor.controller.ts` - S3 upload for thumbnails
   - `src/controllers/media_spotlight.controller.ts` - S3 upload for logos
   - `src/controllers/universities/university_approval.controller.ts` - S3 upload for logos

### 3. **Package Installed:**
   - `@aws-sdk/client-s3` - AWS SDK for S3 operations

## 📁 S3 Folder Structure

Files are organized in S3 as follows:
- `specializations/{filename}` - Specialization thumbnails
- `courses/{filename}` - Course thumbnails
- `universities/logo/{filename}` - University logos
- `universities/brochure/{filename}` - University brochures
- `universities/banners/{filename}` - University banner images
- `universities/sections/{filename}` - University section images
- `mentors/{filename}` - Mentor thumbnails
- `media-spotlight/{filename}` - Media spotlight logos
- `university-approvals/{filename}` - University approval logos

## 🔄 Features Implemented

1. **Automatic S3 Upload** - All file uploads now go directly to S3
2. **Old File Cleanup** - When updating, old S3 files are automatically deleted
3. **Backward Compatibility** - Old local file paths (`/uploads/...`) are preserved (not deleted)
4. **Unique File Naming** - Files are named with timestamps and counters to prevent conflicts

## ⚠️ Important Notes

1. **S3 Bucket Permissions**: Make sure your S3 bucket has public read access for the uploaded files, or implement CloudFront/CDN if you prefer.

2. **Static File Serving**: The `/uploads` static file serving in `server.ts` can be removed if all old local files are migrated, but it's kept for backward compatibility.

3. **Testing**: Test all upload endpoints to ensure S3 uploads work correctly.

4. **Error Handling**: S3 upload errors will be caught and returned as error responses.

## 🚀 Next Steps

1. Add the environment variables to your `.env` file
2. Test the upload endpoints
3. (Optional) Set up CloudFront CDN for faster file delivery
4. (Optional) Migrate existing local files to S3 if needed

