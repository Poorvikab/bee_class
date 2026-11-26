
require("dotenv").config();


const express = require("express");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

// Error handler
app.use((err, req, res, next) => {
  if (err instanceof require("multer").MulterError) {
    return res.status(400).json({ message: err.message });
  }

  res.status(400).json({ message: err.message || "Something went wrong" });
});

connectDB();

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});
