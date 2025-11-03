import CourseRepo, { Course } from "../../repositories/courses/course.repository";

const repo = new CourseRepo();

export const listCourses = (page = 1, limit = 10) => repo.findAll(page, limit);
export const listCoursesName = () => repo.findAllCourseName();
export const getCourse = (id: number) => repo.findById(id);
export const addCourse = (item: Partial<Course>) => repo.create(item);
export const updateCourse = (id: number, item: Partial<Course>, saveWithDate = true) =>
  repo.update(id, item, saveWithDate);
export const deleteCourse = (id: number) => repo.delete(id);
