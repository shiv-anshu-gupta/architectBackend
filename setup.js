const pool = require("./connect.js");
const bcrypt = require("bcryptjs");

const createTables = async () => {
  try {
    // Create `projects` table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create `contacts` table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create `users` table (with password column)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Tables created successfully.");
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  }
};

const ensurePasswordColumn = async () => {
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT '';
    `);
    console.log("✅ 'password' column added to users table.");
  } catch (err) {
    if (
      err.message.includes(
        'column "password" of relation "users" already exists'
      )
    ) {
      console.log("ℹ️ 'password' column already exists in users table.");
    } else {
      console.error("❌ Error adding password column:", err);
    }
  }
};

const seedAdminUser = async () => {
  const username = "admin";
  const email = "admin@example.com";
  const plainPassword = "admin123";

  try {
    // Check if admin user already exists
    const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    if (rows.length > 0) {
      console.log("ℹ️ Admin user already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3)`,
      [username, email, hashedPassword]
    );

    console.log("✅ Admin user seeded successfully.");
  } catch (err) {
    console.error("❌ Error seeding admin user:", err);
  }
};

const run = async () => {
  await createTables();
  await ensurePasswordColumn();
  await seedAdminUser();
  pool.end(); // Close connection at the end
};

run();
