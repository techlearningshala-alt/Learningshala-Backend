import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "my-learningshala-bucket-2025";
const AWS_REGION = process.env.AWS_REGION || "ap-south-1";
const CLOUDFRONT_BASE =
  process.env.AWS_CLOUDFRONT_BASE_URL ||
  process.env.AWS_S3_BASE_URL ||
  "https://d34odytkc8nsi8.cloudfront.net";

/**
 * Public CDN base URL for uploaded files (CloudFront preferred)
 */
export const getS3BaseUrl = (): string => {
  return CLOUDFRONT_BASE.replace(/\/$/, "");
};

/**
 * Get public CDN URL from S3 key (or rewrite direct S3 URL → CloudFront)
 * @param key - S3 key (path) or full URL
 * @returns CloudFront URL
 */
export const getS3Url = (key: string): string => {
  if (!key) return "";

  const raw = String(key).trim();
  if (!raw) return "";

  // Old local path — keep as-is
  if (raw.startsWith("/uploads/")) {
    return raw;
  }

  const baseUrl = getS3BaseUrl();

  // Already CloudFront
  if (raw.includes("cloudfront.net")) {
    return raw;
  }

  // Direct S3 / other absolute URL → keep only the object path under CDN
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const parsed = new URL(raw);
      const path = parsed.pathname.replace(/^\//, "");
      return path ? `${baseUrl}/${path}` : baseUrl;
    } catch {
      return raw;
    }
  }

  return `${baseUrl}/${raw.replace(/^\//, "")}`;
};

/**
 * Upload file to S3
 * @param fileBuffer - File buffer from multer
 * @param fileName - Unique file name
 * @param folder - Optional folder path (e.g., 'specializations', 'courses')
 * @param contentType - MIME type of the file
 * @returns S3 key (path only, not full URL) - e.g., "student-testimonials/1762319564688-1.webp"
 */
export const uploadToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  folder?: string,
  contentType?: string
): Promise<string> => {
  try {
    const key = folder ? `${folder}/${fileName}` : fileName;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType || "application/octet-stream",
      // Note: Public access should be configured via S3 bucket policy, not ACL
    });

    await s3Client.send(command);

    // Return only the key (path), not the full URL
    return key;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
};

/**
 * Delete file from S3
 * @param fileKeyOrUrl - S3 key (path) or full S3 URL
 * @returns true if successful
 */
export const deleteFromS3 = async (fileKeyOrUrl: string): Promise<boolean> => {
  try {
    if (!fileKeyOrUrl) return true;

    // Extract key from URL if full URL is provided
    let key = fileKeyOrUrl;
    if (fileKeyOrUrl.includes("amazonaws.com/")) {
      key = fileKeyOrUrl.split("amazonaws.com/")[1];
    } else if (fileKeyOrUrl.includes("cloudfront.net/")) {
      key = fileKeyOrUrl.split("cloudfront.net/")[1];
    } else if (fileKeyOrUrl.startsWith("/uploads/")) {
      // Old local path - skip deletion
      return true;
    }
    // Otherwise, it's already a key, use as is
    // Strip query string if present
    key = key.split("?")[0];
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting from S3:", error);
    // Don't throw - file might not exist
    return false;
  }
};

export { s3Client, BUCKET_NAME };
