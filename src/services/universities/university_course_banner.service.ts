import courseBannerRepo from "../../repositories/universities/university_course_banner.repository";
import { deleteFromS3 } from "../../config/s3";

interface SyncCourseBannerPayload {
  banner_key?: string;
  banner_image?: string | null;
  video_id?: string | null;
  video_title?: string | null;
}

export async function syncCourseBanners(
  courseId: number,
  banners: SyncCourseBannerPayload[]
) {
  const existingBanners = await courseBannerRepo.findByCourseId(courseId);
  const existingKeys = new Set(existingBanners.map((b) => b.banner_key));
  const incomingKeys = new Set(
    banners.map((b) => b.banner_key).filter(Boolean)
  );

  const toDelete = existingBanners.filter(
    (b) => !incomingKeys.has(b.banner_key)
  );

  for (const banner of toDelete) {
    await courseBannerRepo.remove(courseId, banner.banner_key);
    safeDelete(banner.banner_image);
  }

  const results = [];
  for (const banner of banners) {
    if (!banner.banner_key) continue;

    const existing = existingBanners.find((b) => b.banner_key === banner.banner_key);
    
    if (existing) {
      if (banner.banner_image && banner.banner_image !== existing.banner_image) {
        safeDelete(existing.banner_image);
      }
    }

    const updated = await courseBannerRepo.upsert(courseId, banner);
    results.push(updated);
  }

  return results;
}

export async function syncPrimaryCourseBanner(
  courseId: number,
  payload: SyncCourseBannerPayload
) {
  const existing = await courseBannerRepo.findPrimary(courseId);

  const updated = await courseBannerRepo.upsert(courseId, payload);

  if (existing && payload.banner_image === null && existing.banner_image) {
    safeDelete(existing.banner_image);
  }

  if (existing && payload.banner_image && payload.banner_image !== existing.banner_image) {
    safeDelete(existing.banner_image);
  }


  return updated;
}

export async function clearPrimaryCourseBanner(courseId: number) {
  const existing = await courseBannerRepo.findPrimary(courseId);
  if (!existing) return false;

  await courseBannerRepo.remove(courseId, existing.banner_key);

  safeDelete(existing.banner_image);

  return true;
}

function safeDelete(key?: string | null) {
  if (!key) return;
  deleteFromS3(key).catch((err) => {
    console.error("Error deleting course banner asset from S3", err);
  });
}

export async function getCourseBanners(courseId: number) {
  return courseBannerRepo.findByCourseId(courseId);
}
