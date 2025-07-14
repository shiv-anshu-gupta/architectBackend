const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");

// ✅ Create app
const app = express();

// ✅ Smart environment defaults
const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 4000;
const SESSION_SECRET = process.env.SESSION_SECRET || "default_super_secret";

// ✅ Default allowed origins (can be customized in env if needed)
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",").map((url) => url.trim())
  : ["http://localhost:4000", "https://api.nweaverarchitect.in"];

console.log("🌍 Allowed Frontend URLs:", allowedOrigins);
console.log("🔐 Using secure cookies:", isProduction);

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

// ✅ Session Middleware
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
  })
);

// ✅ Connect to PostgreSQL
require("./connect");

// ✅ Set EJS as view engine with layout support
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout"); // default layout = views/layout.ejs

// ✅ Serve static files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Routes
const adminRoutes = require("./routes/admin.route");
const projectRoutes = require("./routes/project.route");
const messageRoutes = require("./routes/message.route");

app.use("/admin", adminRoutes);
app.use("/project", projectRoutes);
app.use("/message", messageRoutes);

// ✅ Root Test Route
app.get("/", (req, res) => {
  res.send("✅ Project & Message API is running");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
