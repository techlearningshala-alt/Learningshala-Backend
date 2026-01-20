import pool from "../config/db";
import { OtpVerification } from "../models/otp_verification.model";

export class OtpVerificationRepository {
  async create(data: {
    email: string;
    otp: string;
    expires_at: Date;
  }): Promise<OtpVerification> {
    const [result]: any = await pool.query(
      `INSERT INTO otp_verifications (email, otp, expires_at, used, created_at)
       VALUES (?, ?, ?, 0, NOW())`,
      [data.email, data.otp, data.expires_at]
    );
    const created = await this.findById(result.insertId);
    if (!created) {
      throw new Error("Failed to create OTP verification record");
    }
    return created;
  }

  async findById(id: number): Promise<OtpVerification | null> {
    const [rows]: any = await pool.query(
      "SELECT * FROM otp_verifications WHERE id = ?",
      [id]
    );
    return rows[0] ? this.normalize(rows[0]) : null;
  }

  async findValidOtp(email: string, otp: string): Promise<OtpVerification | null> {
    const [rows]: any = await pool.query(
      `SELECT * FROM otp_verifications 
       WHERE email = ? AND otp = ? AND used = 0 AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [email, otp]
    );
    return rows[0] ? this.normalize(rows[0]) : null;
  }

  async markAsUsed(id: number): Promise<boolean> {
    const [result]: any = await pool.query(
      "UPDATE otp_verifications SET used = 1 WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  async deleteExpiredOtps(): Promise<number> {
    const [result]: any = await pool.query(
      "DELETE FROM otp_verifications WHERE expires_at < NOW() OR used = 1"
    );
    return result.affectedRows;
  }

  async deleteByEmail(email: string): Promise<number> {
    const [result]: any = await pool.query(
      "DELETE FROM otp_verifications WHERE email = ?",
      [email]
    );
    return result.affectedRows;
  }

  private normalize(row: any): OtpVerification {
    return {
      id: row.id,
      email: row.email,
      otp: row.otp,
      expires_at: new Date(row.expires_at),
      used: Boolean(row.used),
      created_at: new Date(row.created_at),
    };
  }
}

export default new OtpVerificationRepository();
