
const express = require("express");
const fs = require("fs");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// CREATE EXPENSE
router.post("/", authMiddleware, upload.single("receipt"), async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Receipt is required" });
    }

    const expense = await Expense.create({
      user: req.user.userId,
      title,
      amount,
      category,
      receiptPath: req.file.path
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET USER EXPENSES
router.get("/", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.user.userId
    }).sort({ createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE EXPENSE
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (expense.receiptPath) {
      fs.unlink(expense.receiptPath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error(err);
        }
      });
    }

    await expense.deleteOne();

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
