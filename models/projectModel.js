const db = require("../connect");

exports.addProject = async ({ title, description, image_url, category }) => {
  const query = `
    INSERT INTO projects (title, description, image_url, category, created_at)
    VALUES ($1, $2, $3, $4, NOW()) RETURNING *;
  `;
  const values = [title, description, image_url, category];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// 🔹 Get all projects or filtered by category
exports.getProjects = async (category) => {
  let query = "SELECT * FROM projects";
  const values = [];

  if (category) {
    query += " WHERE category = $1";
    values.push(category);
  }

  const { rows } = await db.query(query, values);
  return rows;
};
