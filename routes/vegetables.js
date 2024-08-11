const express = require("express");
const router = express.Router();
const { Vegetable } = require("../models/user_vegetable_schema");
const {
  vegetableValidationSchema,
} = require("../validation/user_vegetables_Validation");

// Fetch all vegetables
router.get("/allItems", async (req, res) => {
  try {
    const allVegetables = await Vegetable.find();
    res.json(allVegetables);
  } catch (err) {
    console.error("Error fetching vegetables data:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create Vegetable
router.post("/create", async (req, res) => {
  try {
    const { error, value } = vegetableValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const newVegetable = new Vegetable(value);
    const savedVegetable = await newVegetable.save();
    res
      .status(201)
      .json({ message: "Vegetable data created successfully", savedVegetable });
  } catch (err) {
    console.error("Error inserting vegetables data:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create Vegetable
router.post("/createMany", async (req, res) => {
  try {
    const vegetables = req.body;
    const validationErrors = [];
    const vegArray = [];
    for (const veg of vegetables) {
      const { error, value } = vegetableValidationSchema.validate(veg);
      if (error) {
        validationErrors.push({
          veg,
          errors: error.details.map((err) => err.message),
        });
      } else {
        const existingVeg = await Vegetable.findOne(veg);
        if (!existingVeg) {
          vegArray.push(value);
        }
      }
    }
    if (
      validationErrors.length > 0 &&
      vegetables.length === validationErrors.length
    ) {
      return res
        .status(400)
        .json({ message: "Error in data received", errors: validationErrors });
    }
    if (vegArray.length < 1) {
      res.status(201).json({
        message: "Vegetable already exists!",
        errors: validationErrors,
      });
    } else {
      // Insert multiple Vegetable
      await Vegetable.collection.insertMany(vegArray);
      // responseMessage = "Vegetable created successfully";
      res.status(201).json({
        message: "Vegetable created successfully",
        vegArray,
        errors: validationErrors,
      });
    }
  } catch (err) {
    console.error("Error inserting vegetables data:", err);
    res.status(500).json({ error: "Error inserting vegetables data" });
  }
});

// Update Vegetable
router.put("/update/:id", async (req, res) => {
  try {
    const { error, value } = vegetableValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const vegetableByID = await Vegetable.findById(req.params.id);
    if (!vegetableByID) {
      return res.status(404).json({ error: "Item not found" });
    }
    Object.assign(vegetableByID, value);
    const updatedVegetable = await vegetableByID.save();
    res.status(201).json({
      message: "Vegetable updated successfully",
      updatedVegetable,
    });
  } catch (err) {
    console.error("Error updating vegetables data:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Vegetable
router.delete("/delete/:id", async (req, res) => {
  try {
    const vegetableByIdDel = await Vegetable.findByIdAndDelete(req.params.id);
    if (!vegetableByIdDel) {
      return res.status(404).json({ error: "Vegetable not found" });
    }
    res.status(201).json({
      message: "Vegetable deleted successfully",
      vegetableByIdDel,
    });
  } catch (err) {
    console.error("Error deleting vegetables data:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
