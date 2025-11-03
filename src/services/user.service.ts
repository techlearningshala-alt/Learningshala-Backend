import { UserRepository } from "../repositories/user.repository";
import { AppError } from "../middlewares/error.middleware";
import { logger } from "../utills/logger";

const userRepo = new UserRepository();

// export const listUsers = async () => {
//   return await userRepo.findAll();
// };

export const getUserById = async (id: number) => {
  const user = await userRepo.findById(id);
  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const addUser = async (name: string, email: string) => {
  if (!email.includes("@")) throw new AppError("Invalid email format", 400);

  logger.info(`Creating user: ${name} - ${email}`);
  // await userRepo.create({ name, email });
  logger.info(`User created successfully: ${email}`);
  return { message: "User created successfully" };
};
