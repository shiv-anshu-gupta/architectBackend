const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.post("/", messageController.submitMessage);
router.get("/messages", messageController.getAllMessages);
module.exports = router;
