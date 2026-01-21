import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserRepo from "../repositories/user.repository";
import TokenRepo from "../repositories/token.repository";
import OtpService from "./otp.service"; 
import { User } from "../models/user.model";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES: any = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES: any = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

class AuthService {
  async register(
    name: string, 
    email: string, 
    password: string, 
    role = "user"
  ) {
    const existing = await UserRepo.findByEmail(email);
    if (existing) throw new Error("Email already registered");

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    return UserRepo.create({ 
      name, 
      email, 
      password: hashed, 
      role
    });
  }

  // OTP Login (commented out - restore previous direct login)
  // Step 1: Validate credentials and send OTP
  async login(email: string, password: string) {
    const user = await UserRepo.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    // Validate password (uncomment if password validation is needed)
    // const ok = await bcrypt.compare(password, user.password);
    // if (!ok) throw new Error("Invalid credentials");

    // Generate and send OTP
    await OtpService.createAndSendOtp(email);

    // Return success message (no tokens yet)
    return {
      message: "OTP sent to your email",
      email: email, // Return email for frontend to use in OTP verification
    };
  }

  // Previous direct login (restored - OTP temporarily disabled)
  // async login(email: string, password: string) {
  //   const user = await UserRepo.findByEmail(email);
  //   if (!user) throw new Error("Invalid credentials");

  //   // const ok = await bcrypt.compare(password, user.password);
  //   // if (!ok) throw new Error("Invalid credentials");

  //   const accessToken = jwt.sign({ 
  //     id: user.id, 
  //     role: user.role,
  //     can_create: user.can_create || false,
  //     can_read: user.can_read || false,
  //     can_update: user.can_update || false,
  //     can_delete: user.can_delete || false
  //   }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
  //   const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

  //   // save refresh token in DB with expiry timestamp
  //   const decoded: any = jwt.decode(refreshToken);
  //   const expiresAtFromToken = decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();

  //   await TokenRepo.saveRefreshToken(user.id, refreshToken, expiresAtFromToken);

  //     return {
  //     accessToken,
  //     refreshToken,
  //     user: { 
  //       id: user.id, 
  //       name: user.name, 
  //       email: user.email, 
  //       role: user.role,
  //       can_create: user.can_create || false,
  //       can_read: user.can_read || false,
  //       can_update: user.can_update || false,
  //       can_delete: user.can_delete || false
  //     }
  //   };
  // }

  // OTP Verification (commented out - OTP temporarily disabled)
  // Step 2: Verify OTP and generate tokens
  async verifyOtp(email: string, otp: string) {
    // Verify OTP
    const isValid = await OtpService.verifyOtp(email, otp);
    if (!isValid) {
      throw new Error("Invalid or expired OTP");
    }

    // Get user
    const user = await UserRepo.findByEmail(email);
    if (!user) throw new Error("User not found");

    // Generate tokens
    const accessToken = jwt.sign({ 
      id: user.id, 
      role: user.role,
      can_create: user.can_create || false,
      can_read: user.can_read || false,
      can_update: user.can_update || false,
      can_delete: user.can_delete || false
    }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

    // Save refresh token in DB with expiry timestamp
    const decoded: any = jwt.decode(refreshToken);
    const expiresAtFromToken = decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();

    await TokenRepo.saveRefreshToken(user.id, refreshToken, expiresAtFromToken);

    return {
      accessToken,
      refreshToken,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        can_create: user.can_create || false,
        can_read: user.can_read || false,
        can_update: user.can_update || false,
        can_delete: user.can_delete || false
      }
    };
  }

  async refresh(refreshToken: string) {
    // validate format
    const stored = await TokenRepo.findRefreshToken(refreshToken);
    if (!stored) throw new Error("Invalid refresh token");

    try {
      const payload: any = jwt.verify(refreshToken, REFRESH_SECRET);
      const user = await UserRepo.findById(payload.id);
      if (!user) throw new Error("User not found");

      const accessToken = jwt.sign({ id: user.id, role: user.role }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
      return { accessToken };
    } catch (err) {
      // invalid token - delete stored token for safety
      await TokenRepo.deleteRefreshToken(refreshToken);
      throw new Error("Invalid refresh token");
    }
  }

  async logout(refreshToken: string) {
    await TokenRepo.deleteRefreshToken(refreshToken);
  }
}

export default new AuthService();
