const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const upload = require("../middlewares/upload");
const methodOverride = require("method-override");

// Enable method override to support PUT & DELETE in HTML forms
router.use(methodOverride("_method"));

// 🟢 Auth
router.get("/", adminController.renderLogin);
router.post("/", adminController.handleLogin);

// 🟢 Dashboard
router.get("/dashboard", adminController.dashboard);

// 🟢 Pages
router.get("/projects", adminController.projects);
router.get("/messages", adminController.messages);
router.get("/services", adminController.services);

// 🟢 Create Project (Form + Action)
router.get("/projects/new", (req, res) => {
  res.render("addProject", { layout: "layout", project: null });
});
router.post("/projects", upload.single("image"), adminController.addProject);

// 🟡 Edit Project (Form + Action)
router.get("/projects/:id/edit", adminController.editProjectForm);
router.put(
  "/projects/:id",
  upload.single("image"),
  adminController.updateProject
);

// 🔴 Delete Project
router.delete("/projects/:id", adminController.deleteProject);

module.exports = router;
