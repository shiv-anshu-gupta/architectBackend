const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
} = require("../controllers/projectController");

router.post("/", createProject); // POST /project
router.get("/", getProjects); // GET /project?category=...

module.exports = router;
