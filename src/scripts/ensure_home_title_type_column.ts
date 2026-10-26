import pool from "../config/db";

async function main() {
  const [rows]: any = await pool.query(
    `SHOW COLUMNS FROM home_title_descriptions LIKE 'type'`
  );

  if (!rows.length) {
    await pool.query(
      `ALTER TABLE home_title_descriptions
       ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'home' AFTER id`
    );
    console.log("OK: added type column");
  } else {
    console.log("OK: type column already exists");
  }

  await pool.query(
    `UPDATE home_title_descriptions SET type = 'home' WHERE type IS NULL OR type = ''`
  );
  console.log("OK: existing rows set to type=home");
  await pool.end();
}

main().catch(async (e) => {
  console.error(e.message || e);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});
