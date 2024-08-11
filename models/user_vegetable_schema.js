const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  profilePicture: { type: String },
  userType: { type: String, enum: ["Admin", "Manager"], required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const vegetableSchema = new mongoose.Schema({
  color: { type: String, required: true },
  price: { type: Number, required: true },
  name: { type: String, required: true },
});

const User = new mongoose.model("User", userSchema);
const Vegetable = new mongoose.model("Vegetable", vegetableSchema);
module.exports = { User, Vegetable };
