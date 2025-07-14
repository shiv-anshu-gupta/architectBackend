const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const expressLayouts = require("express-ejs-layouts");

const app = express();

// 🌍 Load environment variables
dotenv.config();

// ✅ Set port
const PORT = process.env.PORT || 4000;

// 🌐 Allowed Frontend URLs (for CORS)
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",").map((url) => url.trim())
  : [];

console.log("🌍 Allowed Frontend URLs:", allowedOrigins);

// ✅ CORS Setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("❌ CORS Not Allowed: " + origin));
      }
    },
    credentials: true,
  })
);

// ✅ Middleware
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// ✅ Connect to PostgreSQL
require("./connect");

// ✅ Set EJS as view engine with layout support
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout"); // default layout file = views/layout.ejs

// ✅ Serve static files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Routes
const adminRoutes = require("./routes/admin.route");
const projectRoutes = require("./routes/project.route");
const messageRoutes = require("./routes/message.route");

app.use("/admin", adminRoutes);
app.use("/project", projectRoutes);
app.use("/message", messageRoutes);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("✅ Project & Message API is running");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
