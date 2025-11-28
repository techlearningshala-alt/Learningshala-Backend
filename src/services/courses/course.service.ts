import type { PoolConnection } from "mysql2/promise";
import pool from "../../config/db";
import CourseRepo, { Course } from "../../repositories/courses/course.repository";
import courseBannerRepo, {
  CourseBannerInput,
} from "../../repositories/courses/course_banner.repository";
import courseSectionRepo, {
  CourseSectionInput,
} from "../../repositories/courses/course_section.repository";

const repo = new CourseRepo();
const bannerRepo = courseBannerRepo;
const sectionRepo = courseSectionRepo;

const attachRelations = async (course: any) => {
  if (!course) return null;
  const [banners, sections] = await Promise.all([
    bannerRepo.findByCourseId(course.id),
    sectionRepo.findByCourseId(course.id),
  ]);
  course.banners = banners || [];
  course.sections = sections || [];
  return course;
};

export const listCourses = (page = 1, limit = 10) => repo.findAll(page, limit);
export const listCoursesName = () => repo.findAllCourseName();

export const getCourse = async (id: number) => {
  const course = await repo.findById(id);
  return attachRelations(course);
};

const runInTransaction = async <T>(
  fn: (conn: PoolConnection) => Promise<T>
): Promise<T> => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

export const addCourse = async (
  item: Partial<Course>,
  banners: CourseBannerInput[] = [],
  sections: CourseSectionInput[] = []
) => {
  if ("course_intro" in (item as any)) {
    const intro = (item as any).course_intro;
    if (intro !== undefined) {
      item.description = intro ?? "";
    }
    delete (item as any).course_intro;
  }

  const course = await runInTransaction(async (conn) => {
    const created = await repo.create(item, conn);
    if (!created) {
      throw new Error("Unable to create course");
    }

    if (banners && banners.length) {
      await bannerRepo.replaceForCourse(created.id, banners, conn);
    }
    if (sections && sections.length) {
      await sectionRepo.replaceForCourse(created.id, sections, conn);
    }

    return created;
  });

  return getCourse(course.id);
};

export const updateCourse = async (
  id: number,
  item: Partial<Course>,
  saveWithDate = true,
  banners?: CourseBannerInput[] | null,
  sections?: CourseSectionInput[] | null
) => {
  if ("course_intro" in (item as any)) {
    const intro = (item as any).course_intro;
    if (intro !== undefined) {
      item.description = intro ?? "";
    }
    delete (item as any).course_intro;
  }

  const updated = await runInTransaction(async (conn) => {
    const record = await repo.update(id, item, saveWithDate, conn);
    if (!record) {
      return null;
    }

    if (banners !== undefined) {
      await bannerRepo.replaceForCourse(id, banners || [], conn);
    }
    if (sections !== undefined) {
      await sectionRepo.replaceForCourse(id, sections || [], conn);
    }

    return record;
  });

  if (!updated) {
    return null;
  }

  return getCourse(id);
};

export const deleteCourse = (id: number) => repo.delete(id);

export const toggleCourseStatus = async (id: number, isActive: boolean) => {
  const updated = await repo.update(
    id,
    {
      is_active: isActive,
    },
    false
  );
  return updated ? attachRelations(updated) : null;
};

export const toggleCourseMenuVisibility = async (
  id: number,
  isVisible: boolean
) => {
  const updated = await repo.update(
    id,
    {
      menu_visibility: isVisible,
    },
    false
  );
  return updated ? attachRelations(updated) : null;
};
