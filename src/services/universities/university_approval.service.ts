import { UniversityApprovalRepository } from "../../repositories/universities/university_approval.repository";

const repo = new UniversityApprovalRepository();

export const listUniversityApprovals = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const data = await repo.findAll(limit, offset);
  const total = await repo.count();
  const pages = Math.ceil(total / limit);

  return { data, total, page, pages };
};

export const listApprovals = async () => {
  return repo.find();
};

export const getUniversityApprovalById = async (id: number) => {
  return repo.findById(id);
};

export const addUniversityApproval = async (data: any) => {
  return repo.create(data);
};

export const updateUniversityApproval = async (id: number, data: any) => {
  return repo.update(id, data);
};

export const deleteUniversityApproval = async (id: number) => {
  return repo.delete(id);
};
