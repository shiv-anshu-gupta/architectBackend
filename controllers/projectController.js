const ProjectModel = require("../models/projectModel");

// 📥 Add new project
exports.createProject = async (req, res) => {
  try {
    const project = await ProjectModel.addProject(req.body);
    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error("❌ Error adding project:", error);
    res.status(500).json({ success: false, message: "Failed to add project" });
  }
};

// 📤 Get all or filtered projects
exports.getProjects = async (req, res) => {
  try {
    const category = req.query.category;
    const projects = await ProjectModel.getProjects(category);
    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch projects" });
  }
};
