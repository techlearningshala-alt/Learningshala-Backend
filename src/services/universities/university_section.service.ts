import UniversitySectionRepository from "../../repositories/universities/university_section.repository";

export default class UniversitySectionService {
  static async addSection(data: any) {
    return UniversitySectionRepository.create(data);
  }

  static async getSectionsByUniversity(universityId: number) {
    return UniversitySectionRepository.findByUniversity(universityId);
  }

  static async updateSection(id: number, data: any) {
    return UniversitySectionRepository.update(id, data);
  }

  static async deleteSection(id: number) {
    return UniversitySectionRepository.remove(id);
  }
}
