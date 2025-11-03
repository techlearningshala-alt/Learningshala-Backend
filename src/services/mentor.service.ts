import { MentorRepository } from "../repositories/mentor.repository";
import { AppError } from "../middlewares/error.middleware";

const repo = new MentorRepository();

export const listMentors = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const data = await repo.findAll(limit, offset);
  const total = await repo.count();
  const pages = Math.ceil(total / limit);

  return { data, total, page, pages };
};

export const getMentor = async (id: number) => {
  const mentor = await repo.findById(id);
  if (!mentor) throw new AppError("Mentor not found", 404);
  return mentor;
};

// service
export const addMentor = async (data: {
  name: string;
  thumbnail: string;
  experience: number;
  verified: boolean;
  assist_student: number;
  connection_link: string;
  label: string;
}) => {
 const result =  await repo.create(data);
 return result
  // return { message: "Mentor created successfully" };
};

export const updateMentor = async (
  id: number,
  data: Partial<{
    name: string;
    thumbnail: string;
    experience: number;
    verified: boolean;
    assist_student: number;
    connection_link: string;
    label: string;
  }>,
  saveWithDate: boolean
) => {
  console.log(saveWithDate,"service")
  const mentor = await repo.findById(id);
  if (!mentor) throw new AppError("Mentor not found", 404);
  await repo.update(id, data,saveWithDate);
  return { message: "Mentor updated successfully" };
};

export const deleteMentor = async (id: number) => {
  const mentor = await repo.findById(id);
  if (!mentor) throw new AppError("Mentor not found", 404);
  await repo.delete(id);
  return { message: "Mentor deleted successfully" };
};
