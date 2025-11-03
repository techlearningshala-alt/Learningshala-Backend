import UniversityBannerRepository from "../../repositories/universities/university_banner.repository";

export default class UniversityBannerService {
  static async addBanner(data: any) {
    return UniversityBannerRepository.create(data);
  }

  static async getBannersByUniversity(universityId: number) {
    return UniversityBannerRepository.findByUniversity(universityId);
  }

  static async updateBanner(id: number, data: any) {
    return UniversityBannerRepository.update(id, data);
  }

  static async deleteBanner(id: number) {
    return UniversityBannerRepository.remove(id);
  }
}
