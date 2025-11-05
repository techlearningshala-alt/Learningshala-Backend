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

/**
 * Get S3 base URL from environment or construct from bucket name and region
 * @returns S3 base URL
 */
export const getS3BaseUrl = (): string => {
  if (process.env.AWS_S3_BASE_URL) {
    return process.env.AWS_S3_BASE_URL;
  }
  return `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com`;
};

/**
 * Get full S3 URL from key
 * @param key - S3 key (path)
 * @returns Full S3 URL
 */
export const getS3Url = (key: string): string => {
  if (!key) return "";
  // If already a full URL, return as is
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }
  // If old local path, return as is (for backward compatibility)
  if (key.startsWith("/uploads/")) {
    return key;
  }
  // Construct full URL from key
  const baseUrl = getS3BaseUrl();
  return `${baseUrl}/${key}`;
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
    } else if (fileKeyOrUrl.startsWith("/uploads/")) {
      // Old local path - skip deletion
      return true;
    }
    // Otherwise, it's already a key, use as is

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
