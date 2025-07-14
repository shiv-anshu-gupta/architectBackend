const db = require("../connect");

// 🔹 Save contact message
exports.saveMessage = async ({ name, email, phone, subject, message }) => {
  const query = `
    INSERT INTO contacts (name, email, phone, subject, message, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *;
  `;
  const values = [name, email, phone, subject, message];
  const { rows } = await db.query(query, values);
  return rows[0];
};

exports.getAllMessages = async () => {
  const result = await db.query(
    `SELECT * FROM contacts ORDER BY created_at DESC`
  );
  return result.rows;
};
