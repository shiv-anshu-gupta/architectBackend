const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const upload = require("../middlewares/upload");
const methodOverride = require("method-override");
const adminAuth = require("../middlewares/adminAuth"); // ✅ Add middleware

// ✅ Enable method override for PUT & DELETE in forms
router.use(methodOverride("_method"));

// ✅ Login Routes
router.get("/", adminController.renderLogin);
router.post("/", adminController.handleLogin);

// ✅ Logout Route
router.get("/logout", adminController.logout);

// ✅ Protected Admin Dashboard
router.get("/dashboard", adminAuth, adminController.dashboard);

// ✅ Pages (Protected)
router.get("/projects", adminAuth, adminController.projects);
router.get("/messages", adminAuth, adminController.messages);
router.get("/services", adminAuth, adminController.services);

// ✅ Create Project (Protected)
router.get("/projects/new", adminAuth, (req, res) => {
  res.render("addProject", { layout: "layout", project: null });
});
router.post(
  "/projects",
  adminAuth,
  upload.single("image"),
  adminController.addProject
);

// ✅ Edit Project (Protected)
router.get("/projects/:id/edit", adminAuth, adminController.editProjectForm);
router.put(
  "/projects/:id",
  adminAuth,
  upload.single("image"),
  adminController.updateProject
);

// ✅ Delete Project (Protected)
router.delete("/projects/:id", adminAuth, adminController.deleteProject);

module.exports = router;
