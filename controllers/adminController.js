const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const pool = require("../connect");
const { findUserByEmail } = require("../models/adminModel");

// GET login page
exports.renderLogin = (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.redirect("/admin/dashboard");
  }
  res.render("login", { layout: false });
};

// POST login form
exports.handleLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).send("Invalid email or password.");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("Invalid email or password.");

    // ✅ Set session
    req.session.isAdmin = true;
    req.session.adminEmail = user.email;

    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).send("Server error");
  }
};

// 🔒 Dashboard (protected)
exports.dashboard = async (req, res) => {
  try {
    const projectData = await pool.query(
      "SELECT * FROM projects ORDER BY created_at DESC LIMIT 5"
    );
    const messageData = await pool.query(
      "SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5"
    );

    const countProjects = await pool.query("SELECT COUNT(*) FROM projects");
    const countMessages = await pool.query("SELECT COUNT(*) FROM contacts");

    res.render("dashboard", {
      layout: "layout",
      latestProjects: projectData.rows,
      latestMessages: messageData.rows,
      projectCount: countProjects.rows[0].count,
      messageCount: countMessages.rows[0].count,
    });
  } catch (err) {
    console.error("❌ Error loading dashboard:", err);
    res.status(500).send("Dashboard load error");
  }
};

exports.projects = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM projects ORDER BY created_at DESC"
    );
    res.render("projects", { layout: "layout", projects: result.rows });
  } catch (err) {
    console.error("❌ Error fetching projects:", err);
    res.status(500).send("Server Error");
  }
};

exports.messages = (req, res) => {
  res.render("messages", { layout: "layout" });
};

exports.services = (req, res) => {
  res.render("services", { layout: "layout" });
};

// ADD Project
exports.addProject = async (req, res) => {
  const { title, description, category } = req.body;
  const imageFile = req.file;

  if (!imageFile) return res.status(400).send("Image upload failed.");
  const image_url = `/uploads/projects/${imageFile.filename}`;

  try {
    await pool.query(
      `INSERT INTO projects (title, description, image_url, category) VALUES ($1, $2, $3, $4)`,
      [title, description, image_url, category]
    );
    res.redirect("/admin/projects");
  } catch (err) {
    console.error("❌ Error adding project:", err);
    res.status(500).send("Error adding project");
  }
};

// EDIT form
exports.editProjectForm = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM projects WHERE id = $1`, [
      id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).send("Project not found");

    const project = result.rows[0];
    res.render("addProject", { layout: "layout", project });
  } catch (err) {
    console.error("❌ Error loading edit form:", err);
    res.status(500).send("Error loading form");
  }
};

// UPDATE project
exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { title, description, category } = req.body;
  const imageFile = req.file;

  try {
    // Get existing image_url
    const existing = await pool.query(`SELECT * FROM projects WHERE id = $1`, [
      id,
    ]);
    if (existing.rows.length === 0)
      return res.status(404).send("Project not found");

    let image_url = existing.rows[0].image_url;

    // If new image uploaded, replace
    if (imageFile) {
      const oldPath = path.join(__dirname, "..", "public", image_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      image_url = `/uploads/projects/${imageFile.filename}`;
    }

    await pool.query(
      `UPDATE projects SET title=$1, description=$2, image_url=$3, category=$4 WHERE id=$5`,
      [title, description, image_url, category, id]
    );

    res.redirect("/admin/projects");
  } catch (err) {
    console.error("❌ Error updating project:", err);
    res.status(500).send("Error updating project");
  }
};

// DELETE project
exports.deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM projects WHERE id = $1`, [
      id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).send("Project not found");

    const project = result.rows[0];

    // Delete image file
    const imagePath = path.join(__dirname, "..", "public", project.image_url);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    await pool.query(`DELETE FROM projects WHERE id = $1`, [id]);
    res.redirect("/admin/projects");
  } catch (err) {
    console.error("❌ Error deleting project:", err);
    res.status(500).send("Error deleting project");
  }
};

// 🚪 LOGOUT
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
};
