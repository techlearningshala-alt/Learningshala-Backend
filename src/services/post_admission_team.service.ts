import { PostAdmissionTeamRepository } from "../repositories/post_admission_team.repository";
import { AppError } from "../middlewares/error.middleware";

const repo = new PostAdmissionTeamRepository();

export const listPostAdmissionTeam = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const data = await repo.findAll(limit, offset);
  const total = await repo.count();
  const pages = Math.ceil(total / limit) || 1;
  return { data, total, page, pages };
};

export const getPostAdmissionTeamMember = async (id: number) => {
  const member = await repo.findById(id);
  if (!member) throw new AppError("Post admission team member not found", 404);
  return member;
};

export const addPostAdmissionTeamMember = async (data: {
  name: string;
  thumbnail: string;
  experience: number;
  verified: boolean;
  assist_student?: number | null;
  qualification?: string | null;
  connection_link?: string | null;
  label?: string | null;
}) =>
  repo.create({
    name: data.name,
    thumbnail: data.thumbnail,
    experience: data.experience,
    verified: data.verified,
    assist_student: data.assist_student ?? 0,
    qualification: data.qualification ?? null,
    connection_link: data.connection_link ?? null,
    label: data.label ?? null,
  });

export const updatePostAdmissionTeamMember = async (
  id: number,
  data: Partial<{
    name: string;
    thumbnail: string;
    experience: number;
    verified: boolean;
    assist_student: number | null;
    qualification: string | null;
    connection_link: string | null;
    label: string | null;
  }>,
  saveWithDate: boolean
) => {
  const member = await repo.findById(id);
  if (!member) throw new AppError("Post admission team member not found", 404);

  const {
    assist_student,
    name,
    thumbnail,
    experience,
    verified,
    qualification,
    connection_link,
    label,
  } = data;

  await repo.update(
    id,
    {
      ...(name !== undefined ? { name } : {}),
      ...(thumbnail !== undefined ? { thumbnail } : {}),
      ...(experience !== undefined ? { experience } : {}),
      ...(verified !== undefined ? { verified } : {}),
      ...(assist_student !== undefined ? { assist_student: assist_student ?? 0 } : {}),
      ...(qualification !== undefined ? { qualification } : {}),
      ...(connection_link !== undefined ? { connection_link } : {}),
      ...(label !== undefined ? { label } : {}),
    },
    saveWithDate
  );
  return { message: "Post admission team member updated successfully" };
};

export const deletePostAdmissionTeamMember = async (id: number) => {
  const member = await repo.findById(id);
  if (!member) throw new AppError("Post admission team member not found", 404);
  await repo.delete(id);
  return { message: "Post admission team member deleted successfully" };
};
