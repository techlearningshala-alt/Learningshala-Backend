import UniversityCourseSpecializationSectionRepository from "../../repositories/universities/university_course_specialization_section.repository";

/**
 * Helper function to convert title to section_key format
 * Example: "Popular Courses" -> "Popular_Courses"
 */
export function generateSectionKey(title: string): string {
  return String(title || "")
    .trim()
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_]/g, ""); // Remove special characters except underscores
}

export default class UniversityCourseSpecializationSectionService {
  static async addSection(data: any) {
    // Validate required fields
    if (!data.title || !data.title.trim()) {
      throw new Error("Section title is required and cannot be empty");
    }
    
    if (!data.component || !data.component.trim()) {
      throw new Error("Section component is required and cannot be empty");
    }

    // Generate section_key from title if not provided
    if (!data.section_key || !data.section_key.trim()) {
      data.section_key = generateSectionKey(data.title);
    }

    // Ensure title and component are trimmed strings
    data.title = String(data.title).trim();
    data.component = String(data.component).trim();
    data.section_key = String(data.section_key).trim();

    return UniversityCourseSpecializationSectionRepository.create(data);
  }

  static async getSectionsBySpecializationId(specializationId: number) {
    return UniversityCourseSpecializationSectionRepository.findBySpecializationId(specializationId);
  }

  static async updateSection(id: number, data: any) {
    // If title is updated, regenerate section_key
    if (data.title && !data.section_key) {
      data.section_key = generateSectionKey(data.title);
    }
    return UniversityCourseSpecializationSectionRepository.update(id, data);
  }

  static async deleteSection(id: number) {
    return UniversityCourseSpecializationSectionRepository.remove(id);
  }

  static async deleteBySpecializationId(specializationId: number) {
    return UniversityCourseSpecializationSectionRepository.removeBySpecializationId(specializationId);
  }
}

