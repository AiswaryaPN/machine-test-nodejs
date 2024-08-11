const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const userAuthRoute = require('./routes/userAuthentication');
const userRoute = require("./routes/users");
const vegetableRoute = require("./routes/vegetables");
require("dotenv").config();

// Initialize Express
const app = express();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;
const SECRET_KEY = process.env.SECRET_KEY;

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Middleware
app.use(bodyParser.json());
app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport
require("./passport-setup");

// Routes
app.use("/api/users", userRoute);
app.use("/api/vegetables", vegetableRoute);
app.use("/api/userAuth", userAuthRoute);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  // Set status code depending on the error type
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});
// Error handling for unknown routes
app.use((req, res) => {
  res.status(404).send("Not Found");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
