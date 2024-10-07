const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");
const cors = require("cors");
const { config } = require("dotenv");
const port = process.env.PORT || 4000;
const errorController = require("./controllers/error");
const User = require("./models/user");

config();

const app = express();

const MONGODB_URI = process.env.MONGO_URL;

// CORS Configuration
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174','http://localhost:3000','https://nextjs-firefly.vercel.app'],
    credentials: true, // Allow session cookie to be sent cross-domain
  })
);

// Body Parser Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session Store Configuration
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

// Session Middleware
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Logging Middleware
const logStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a",
});
app.use(morgan("combined", { stream: logStream }));

// Security & Performance Middleware
app.use(helmet());
app.use(compression());

// Static Files Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

// User Retrieval Middleware
app.use((req, res, next) => {
  if (!req.session.userId) {
    return next();
  }
  User.findById(req.session.userId)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

// Flash Messages Middleware
app.use(flash());

// Global Variables Middleware
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  next();
});

// Routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// Error Handling Middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.statusCode || 500).json({ message: error.message });
});

// Fallback Routes for 404 and 500 Errors
app.get("/500", errorController.get500);
//app.use(errorController.get404);
//Server startup
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// MongoDB Connection 
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB", err);
  });

  app.get("/", (req, res) => {
    res.send({
        message: "Project Firefly Server",
        health: "ok",
    });
});
