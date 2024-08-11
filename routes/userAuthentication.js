const express = require("express");
const router = express.Router();
const { User } = require("../models/user_vegetable_schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  userValidationSchema,
} = require("../validation/user_vegetables_Validation");

// Signup API
router.post("/signup", async (req, res) => {
  const { error, value } = userValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const userPresent = await User.findOne({
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
    });
    if (userPresent) {
      return res.status(400).json({ error: "User already exists!." });
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);
    await User.collection.insertOne({ ...value, password: hashedPassword });
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error while signup:", err);
    res.status(500).json({ error: err.message });
  }
});

// Login API
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPswdMatch = await bcrypt.compare(password, user.password);
    if (!isPswdMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ token, message: "Login was a success" });
  } catch (err) {
    console.error("Error while login:", err);
    res.status(500).json({
      message: "Error occured while tryig to login",
      error: err.message,
    });
  }
});

module.exports = router;
