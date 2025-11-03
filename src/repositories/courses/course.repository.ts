import pool from "../../config/db";

export interface Course {
  id: number;
  domain_id: number;
  name: string;
  slug: string;
  thumbnail: string;
  description: string;
  priority: string;
  menu_visibility: string;
  is_active: string;
  created_at: Date;
  updated_at: Date;
}

export default class CourseRepo {
  // async findAll(page = 1, limit = 10) {
  //   const offset = (page - 1) * limit;
  //   const [rows]: any = await pool.query(
  //     "SELECT SQL_CALC_FOUND_ROWS * FROM courses ORDER BY id DESC LIMIT ? OFFSET ?",
  //     [limit, offset]
  //   );
  //   const [[{ "FOUND_ROWS()": total }]]: any = await pool.query("SELECT FOUND_ROWS()");
  //   return { data: rows, page, pages: Math.ceil(total / limit), total };
  // }

  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [rows]: any = await pool.query(
      `
    SELECT 
      c.*, 
      d.name AS domain_name,
      d.slug AS domain_slug
    FROM courses c
    LEFT JOIN domains d ON c.domain_id = d.id
    ORDER BY c.priority ASC, c.updated_at DESC
    LIMIT ? OFFSET ?
    `,
      [limit, offset]
    );

    const [countRows] = await pool.query("SELECT COUNT(*) as total FROM courses");
    const total = (countRows as any)[0].total;
    return {
      data: rows,
      page,
      pages: Math.ceil(total / limit),
      total,
    };
  }

  async findAllCourseName() {
    const [rows]: any = await pool.query("SELECT id, name FROM courses ORDER BY name ASC");
    return rows;
  }


  async findById(id: number) {
    const [rows]: any = await pool.query("SELECT * FROM courses WHERE id = ?", [id]);
    return rows.length ? rows[0] : null;
  }

  async create(item: Partial<Course>) {
    const [result]: any = await pool.query(
      "INSERT INTO courses (domain_id, name, slug, thumbnail, description, priority,menu_visibility,is_active ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [item.domain_id, item.name, item.slug, item.thumbnail, item.description, item.priority, item.menu_visibility, item.is_active]
    );
    const [rows]: any = await pool.query("SELECT * FROM courses WHERE id = ?", [result.insertId]);
    return rows[0];
  }

  async update(id: number, item: Partial<Course>, saveWithDate = true) {
    const fields: string[] = [];
    const values: any[] = [];
    if (item.domain_id !== undefined) { fields.push("domain_id = ?"); values.push(item.domain_id); }
    if (item.name !== undefined) { fields.push("name = ?"); values.push(item.name); }
    if (item.slug !== undefined) { fields.push("slug = ?"); values.push(item.slug); }
    if (item.thumbnail !== undefined) { fields.push("thumbnail = ?"); values.push(item.thumbnail); }
    if (item.description !== undefined) { fields.push("description = ?"); values.push(item.description); }
    if (item.menu_visibility !== undefined) { fields.push("menu_visibility = ?"); values.push(item.menu_visibility); }
    if (item.is_active !== undefined) { fields.push("is_active = ?"); values.push(item.is_active); }
    if (item.priority !== undefined) { fields.push("priority = ?"); values.push(item.priority); }

    if (!fields.length) return null;
    if (saveWithDate) fields.push("updated_at = NOW()");

    values.push(id);
    const [result]: any = await pool.query(`UPDATE courses SET ${fields.join(", ")} WHERE id = ?`, values);

    if (result.affectedRows === 0) return null;

    const [rows]: any = await pool.query("SELECT * FROM courses WHERE id = ?", [id]);
    return rows[0];
  }

  async delete(id: number) {
    const [result]: any = await pool.query("DELETE FROM courses WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}
