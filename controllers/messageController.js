const MessageModel = require("../models/messageModel");

// 📥 Submit contact message
exports.submitMessage = async (req, res) => {
  try {
    const { username, email, phone, subject, message } = req.body;
    await MessageModel.saveMessage({
      name: username,
      email,
      phone,
      subject,
      message,
    });
    res.status(200).json({ message: "Message submitted successfully!" });
  } catch (err) {
    console.error("❌ Error saving message:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await MessageModel.getAllMessages();
    res.render("messages", {
      layout: "layout",
      messages,
    });
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).send("Failed to load messages");
  }
};
