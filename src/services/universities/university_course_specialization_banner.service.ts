import specializationBannerRepo from "../../repositories/universities/university_course_specialization_banner.repository";
import { deleteFromS3 } from "../../config/s3";

interface SyncSpecializationBannerPayload {
  banner_key?: string;
  banner_image?: string | null;
  video_id?: string | null;
  video_title?: string | null;
}

export async function syncSpecializationBanners(
  specializationId: number,
  banners: SyncSpecializationBannerPayload[]
) {
  const existingBanners = await specializationBannerRepo.findBySpecializationId(specializationId);
  const existingKeys = new Set(existingBanners.map((b) => b.banner_key));
  const incomingKeys = new Set(
    banners.map((b) => b.banner_key).filter(Boolean)
  );

  const toDelete = existingBanners.filter(
    (b) => !incomingKeys.has(b.banner_key)
  );

  for (const banner of toDelete) {
    await specializationBannerRepo.remove(specializationId, banner.banner_key);
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

    const updated = await specializationBannerRepo.upsert(specializationId, banner);
    results.push(updated);
  }

  return results;
}

export async function syncPrimarySpecializationBanner(
  specializationId: number,
  payload: SyncSpecializationBannerPayload
) {
  const existing = await specializationBannerRepo.findPrimary(specializationId);

  const updated = await specializationBannerRepo.upsert(specializationId, payload);

  if (existing && payload.banner_image === null && existing.banner_image) {
    safeDelete(existing.banner_image);
  }

  if (existing && payload.banner_image && payload.banner_image !== existing.banner_image) {
    safeDelete(existing.banner_image);
  }

  return updated;
}

export async function clearPrimarySpecializationBanner(specializationId: number) {
  const existing = await specializationBannerRepo.findPrimary(specializationId);
  if (!existing) return false;

  await specializationBannerRepo.remove(specializationId, existing.banner_key);

  safeDelete(existing.banner_image);

  return true;
}

function safeDelete(key?: string | null) {
  if (!key) return;
  deleteFromS3(key).catch((err) => {
    console.error("Error deleting specialization banner asset from S3", err);
  });
}

export async function getSpecializationBanners(specializationId: number) {
  return specializationBannerRepo.findBySpecializationId(specializationId);
}

