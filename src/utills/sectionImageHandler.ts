import { uploadToS3, deleteFromS3 } from "../config/s3";
import { generateFileName } from "../config/multer";

interface ProcessSectionImagesOptions {
  files: any;
  sections: any[];
  s3BasePath: string;
  existingSections?: any[];
  enableLogging?: boolean;
}

/**
 * Processes section images by uploading to S3 and replacing filenames with S3 URLs
 * Supports both upload.fields() and upload.any() multer configurations
 */
export async function processSectionImages({
  files,
  sections,
  s3BasePath,
  existingSections,
  enableLogging = false,
}: ProcessSectionImagesOptions): Promise<void> {
  if (!files || typeof files !== "object" || !sections || sections.length === 0) {
    return;
  }

  // Handle both upload.fields() and upload.any() formats
  let sectionImageFiles: any[] = [];

  // Check if using upload.any() (array format with fieldname property)
  const filesArray = Array.isArray(files) ? files : Object.values(files).flat();
  if (filesArray.length > 0 && filesArray[0]?.fieldname) {
    // Using upload.any() - files have fieldname property
    sectionImageFiles = filesArray.filter((f: any) => 
      f.fieldname && f.fieldname.startsWith("section_image_")
    );
  } else {
    // Using upload.fields() - files accessed by key
    const sectionImageKeys = Object.keys(files).filter((key) => key.startsWith("section_image_"));
    sectionImageFiles = sectionImageKeys.map((key) => files[key][0]).filter(Boolean);
  }

  if (sectionImageFiles.length === 0) {
    return;
  }

  if (enableLogging) {
    console.log("🟢 [SECTION IMAGES] Section image files found:", sectionImageFiles.length);
  }

  // Build map from original filename → S3 URL
  const fileMap = new Map<string, string>();
  for (const file of sectionImageFiles) {
    const fileName = generateFileName(file.originalname);
    const s3Url = await uploadToS3(
      file.buffer,
      fileName,
      s3BasePath,
      file.mimetype
    );
    fileMap.set(file.originalname, s3Url);
    
    if (enableLogging) {
      console.log(`🔍 [SECTION IMAGES] File uploaded: ${file.originalname} → ${s3Url}`);
    }
  }

  if (enableLogging) {
    console.log("🔍 [SECTION IMAGES] FileMap contents:", Array.from(fileMap.entries()));
  }

  // Replace filenames with S3 URLs in sections
  sections.forEach((section: any, sIndex: number) => {
    if (section.props) {
      replaceSectionImagesInProps(section.props, fileMap, existingSections?.[sIndex]?.props);
    }
  });
}

/**
 * Recursively replaces image filenames with S3 URLs in section props
 * Also handles image removal (empty strings)
 */
function replaceSectionImagesInProps(
  obj: any,
  fileMap: Map<string, string>,
  existingProps?: any
): void {
  Object.entries(obj).forEach(([key, val]) => {
    // Check if this is an image field that was removed (empty string)
    if (
      typeof val === "string" &&
      val === "" &&
      (key.toLowerCase().includes("img") ||
        key.toLowerCase().includes("logo") ||
        key.toLowerCase().includes("image") ||
        key.toLowerCase().includes("sample"))
    ) {
      // Image was removed - set to null and delete from S3 if it exists
      if (existingProps?.[key] && typeof existingProps[key] === "string" && !existingProps[key].startsWith("/uploads/")) {
        deleteFromS3(existingProps[key]).catch((err) =>
          console.error("Error deleting section image from S3:", err)
        );
      }
      obj[key] = null;
    } else if (typeof val === "string" && fileMap.has(val)) {
      // Replace filename with S3 URL
      obj[key] = fileMap.get(val);
    }

    // Recursively process arrays and objects
    if (Array.isArray(val)) {
      val.forEach((item) => {
        if (item && typeof item === "object") {
          replaceSectionImagesInProps(item, fileMap);
        }
      });
    } else if (val && typeof val === "object") {
      replaceSectionImagesInProps(val, fileMap);
    }
  });
}

/**
 * Handles section image removal (empty strings) even when no new files are uploaded
 */
export function handleSectionImageRemoval(
  sections: any[],
  existingSections?: any[]
): void {
  if (!sections || sections.length === 0) {
    return;
  }

  sections.forEach((section: any, sIndex: number) => {
    if (section.props) {
      const handleImageRemoval = (obj: any, existingObj?: any) => {
        Object.entries(obj).forEach(([key, val]) => {
          // Check if this is an image field that was removed (empty string)
          if (
            typeof val === "string" &&
            val === "" &&
            (key.toLowerCase().includes("img") ||
              key.toLowerCase().includes("logo") ||
              key.toLowerCase().includes("image") ||
              key.toLowerCase().includes("sample"))
          ) {
            // Image was removed - set to null and delete from S3 if it exists
            if (
              existingObj?.[key] &&
              typeof existingObj[key] === "string" &&
              !existingObj[key].startsWith("/uploads/")
            ) {
              deleteFromS3(existingObj[key]).catch((err) =>
                console.error("Error deleting section image from S3:", err)
              );
            }
            obj[key] = null;
          }

          // Recursively process arrays and objects
          if (Array.isArray(val)) {
            val.forEach((item) => {
              if (item && typeof item === "object") {
                handleImageRemoval(item);
              }
            });
          } else if (val && typeof val === "object") {
            handleImageRemoval(val, existingObj?.[key]);
          }
        });
      };

      handleImageRemoval(section.props, existingSections?.[sIndex]?.props);
    }
  });
}

