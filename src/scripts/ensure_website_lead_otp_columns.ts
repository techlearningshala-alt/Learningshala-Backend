import pool from "../config/db";

async function main() {
  const [rows]: any = await pool.query(
    `SHOW COLUMNS FROM website_leads WHERE Field IN ('otp','otp_verified','campaign_id','job_id','custm_id','otp_expires_at')`
  );
  const existing = new Set(rows.map((r: any) => r.Field as string));
  console.log("existing:", [...existing].join(","));

  const alters: string[] = [];
  if (!existing.has("otp_verified")) {
    alters.push("ADD COLUMN otp_verified TINYINT(1) NOT NULL DEFAULT 0");
  }
  if (!existing.has("campaign_id")) {
    alters.push("ADD COLUMN campaign_id VARCHAR(100) NULL DEFAULT NULL");
  }
  if (!existing.has("job_id")) {
    alters.push("ADD COLUMN job_id VARCHAR(100) NULL DEFAULT NULL");
  }
  if (!existing.has("custm_id")) {
    alters.push("ADD COLUMN custm_id VARCHAR(100) NULL DEFAULT NULL");
  }
  if (!existing.has("otp_expires_at")) {
    alters.push("ADD COLUMN otp_expires_at DATETIME NULL DEFAULT NULL");
  }

  if (!alters.length) {
    console.log("OK: all otp login columns already present");
  } else {
    await pool.query(`ALTER TABLE website_leads ${alters.join(", ")}`);
    console.log("OK: added", alters.join(" | "));
  }

  await pool.end();
}

main().catch(async (e) => {
  console.error(e.message || e);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});
