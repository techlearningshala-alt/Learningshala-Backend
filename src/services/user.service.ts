import { UserRepository } from "../repositories/user.repository";
import { AppError } from "../middlewares/error.middleware";
import { logger } from "../utills/logger";

const userRepo = new UserRepository();

export const listUsers = async (page: number = 1, limit: number = 10, role?: string) => {
  return await userRepo.findAll(page, limit, role);
};

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

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  can_create?: boolean;
  can_read?: boolean;
  can_update?: boolean;
  can_delete?: boolean;
}) => {
  // Check if email already exists
  const existing = await userRepo.findByEmail(data.email);
  if (existing) {
    throw new AppError("Email already registered", 400);
  }

  // Hash password
  const bcrypt = require("bcryptjs");
  const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  // Create user
  const user = await userRepo.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role || "mentor",
    can_create: data.can_create !== undefined ? data.can_create : false,
    can_read: data.can_read !== undefined ? data.can_read : true,
    can_update: data.can_update !== undefined ? data.can_update : false,
    can_delete: data.can_delete !== undefined ? data.can_delete : false,
  });

  // Return user without password
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateUser = async (id: number, data: {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  can_create?: boolean;
  can_read?: boolean;
  can_update?: boolean;
  can_delete?: boolean;
}) => {
  const user = await userRepo.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // If email is being updated, check if it already exists
  if (data.email && data.email !== user.email) {
    const existing = await userRepo.findByEmail(data.email);
    if (existing) {
      throw new AppError("Email already registered", 400);
    }
  }

  // Hash password if provided
  let hashedPassword: string | undefined;
  if (data.password) {
    const bcrypt = require("bcryptjs");
    const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  // Update user
  const updatedUser = await userRepo.update(id, {
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role,
    can_create: data.can_create,
    can_read: data.can_read,
    can_update: data.can_update,
    can_delete: data.can_delete,
  });

  if (!updatedUser) {
    throw new AppError("Failed to update user", 500);
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

export const deleteUser = async (id: number) => {
  const user = await userRepo.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const deleted = await userRepo.delete(id);
  if (!deleted) {
    throw new AppError("Failed to delete user", 500);
  }

  return { message: "User deleted successfully" };
};