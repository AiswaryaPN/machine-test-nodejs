const express = require("express");
const router = express.Router();
const { User } = require("../models/user_vegetable_schema");
const {
  userValidationSchema,
} = require("../validation/user_vegetables_Validation");
const bcrypt = require("bcryptjs");
const {
  authenticateToken,
  authorizeRole,
} = require("../middlewares/authMiddleware");

// Fetch all users data
router.get("/userList",  authenticateToken,
  authorizeRole("Admin"),async (req, res) => {
  try {
    const userList = await User.find();
    res.json(userList);
  } catch (err) {
    console.error("Error fetching users list:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create User
router.post(
  "/create",
  authenticateToken,
  authorizeRole("Admin"),
  async (req, res) => {
    try {
      const { error, value } = userValidationSchema.validate(req.body);
      if (error)
        return res.status(400).json({ error: error.details[0].message });

      const existingUser = await User.findOne({ email: value.email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(value.password, 10);
      const newUser = new User({ ...value, password: hashedPassword });
      const savedUser = await newUser.save();
      res
        .status(201)
        .json({ message: "User created successfully", savedUser });
    } catch (err) {
      console.error("Error inserting user data:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Create multiple users
router.post(
  "/createMany",
  authenticateToken,
  authorizeRole("Admin"),
  async (req, res) => {
    // Validate request body
    const users = req.body;
    const validationErrors = [];
    const userArray = [];

    if (!users.length)
      return res.status(400).json({ message: "No data received" });

    // Validate each user in the array
    for (const user of users) {
      const { error, value } = userValidationSchema.validate(user);
      if (error) {
        validationErrors.push({
          user,
          errors: error.details.map((err) => err.message),
        });
      } else {
        const existingUser = await User.findOne({ email: value.email });
        if (!existingUser) {
          userArray.push(value);
        }
      }
    }
    if (
      validationErrors.length > 0 &&
      users.length === validationErrors.length
    ) {
      return res
        .status(400)
        .json({ message: "Error in data received", errors: validationErrors });
    }
    try {
      if (userArray.length < 1) {
        res
          .status(201)
          .json({ message: "Users already exists!", errors: validationErrors });
      } else {
        // Insert multiple users
        await User.collection.insertMany(userArray);
        responseMessage = "Users created successfully";
        res.status(201).json({
          message: "Users created successfully",
          userArray,
          errors: validationErrors,
        });
      }
    } catch (err) {
      console.error("Error inserting users:", err);
      res.status(500).json({ error: "Error inserting users" });
    }
  }
);

// Update User
router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole("Admin"),
  async (req, res) => {
    const { error, value } = userValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    try {
      const userById = await User.findById(req.params.id);
      if (!userById) {
        return res.status(404).json({ error: "User not found" });
      }
      Object.assign(userById, value);
      if (value.password) {
        userById.password = await bcrypt.hash(value.password, 10);
      }
      const updatedUser = await userById.save();
      res
        .status(201)
        .json({ message: "User data updated successfully", updatedUser });
    } catch (err) {
      console.error("Error updating user data:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Delete User
router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole("Admin"),
  async (req, res) => {
    try {
      const userByIdDel = await User.findByIdAndDelete(req.params.id);
      if (!userByIdDel) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(201).json({ message: "User deleted successfully" });
    } catch (err) {
      console.error("Error deleted user data:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

//Pagination, Sort with all fields except profilepic
router.get(
  "/sortAndPagination",
  authenticateToken,
  authorizeRole("Admin"),
  async (req, res) => {
    try {
      // setting default values
      const {
        page = 1,
        limit = 10,
        sortBy = "firstName",
        sortOrder = "asc",
        search = "",
      } = req.query;
      const pageNumber = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);
      // sortable fields except profile pic
      const sortableFields = ["firstName", "lastName", "email", "userType"];
      const sortObject = {};
      if (sortableFields.includes(sortBy)) {
        sortObject[sortBy] = sortOrder === "asc" ? 1 : -1;
      } else {
        return res.status(400).json({ error: "Invalid sortBy field" });
      }
      // Fetch users with pagination and sorting
      const users = await User.find({})
        .sort(sortObject)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

      // Get total count of users
      const totalUsers = await User.countDocuments();
      res.status(200).json({
        page: pageNumber,
        limit: pageSize,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / pageSize),
        data: users,
      });
    } catch (err) {
      console.error("Error sorting users:", err);
      res.status(500).json({ error: "Error fetching users" });
    }
  }
);

//Pagination, Search with all fileds except profile pic
router.get(
  "/searchAndPagination",
  authenticateToken,
  authorizeRole("Admin"),
  async (req, res) => {
    try {
      // setting default values
      const { page = 1, limit = 10, search = "" } = req.query;
      const pageNumber = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);
      const searchQuery = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { userType: { $regex: search, $options: "i" } },
        ],
      };
      const users = await User.find(searchQuery)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);
      const totalUsers = await User.countDocuments(searchQuery);
      res.status(200).json({
        page: pageNumber,
        limit: pageSize,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / pageSize),
        data: users,
      });
    } catch (err) {
      console.error("Error searching users:", err);
      res.status(500).json({ error: "Error searching users" });
    }
  }
);

//Sorting and searchhing combined
router.get(
  "/sortSearchPagination",
  authenticateToken,
  authorizeRole("Admin"),
  async (req, res) => {
    try {
      // setting default values
      const {
        page = 1,
        limit = 10,
        sortBy = "firstName",
        sortOrder = "asc",
        search = "",
      } = req.query;
      const pageNumber = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);
      // sortable fields except profile pic
      const sortableFields = ["firstName", "lastName", "email", "userType"];
      const sortObject = {};
      if (sortableFields.includes(sortBy) && search !== "profilePicture") {
        sortObject[sortBy] = sortOrder === "asc" ? 1 : -1;
      } else {
        console.error("Invalid sortBy field or search field", sortBy, search);
      }
      const searchQuery = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { userType: { $regex: search, $options: "i" } },
        ],
      };
      const users = await User.find(searchQuery)
        .sort(sortObject)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);
      const totalUsers = await User.countDocuments(searchQuery);
      res.status(200).json({
        page: pageNumber,
        limit: pageSize,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / pageSize),
        data: users,
      });
    } catch (err) {
      console.error("Error searcing and sorting users:", err);
      res.status(500).json({ error: "Error fetching users" });
    }
  }
);

module.exports = router;
