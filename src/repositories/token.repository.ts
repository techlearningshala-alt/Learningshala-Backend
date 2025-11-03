import pool from "../config/db";

export class TokenRepository {
  async saveRefreshToken(userId: number, token: string, expiresAt: string) {
    await pool.query("INSERT INTO refresh_tokens (user_id, token, expires_at, created_at) VALUES (?, ?, ?, NOW())", [userId, token, expiresAt]);
  }

  async findRefreshToken(token: string) {
    const [rows]: any = await pool.query("SELECT * FROM refresh_tokens WHERE token = ?", [token]);
    return rows[0] || null;
  }

  async deleteRefreshToken(token: string) {
    await pool.query("DELETE FROM refresh_tokens WHERE token = ?", [token]);
  }

  async deleteAllForUser(userId: number) {
    await pool.query("DELETE FROM refresh_tokens WHERE user_id = ?", [userId]);
  }
}
export default new TokenRepository();
