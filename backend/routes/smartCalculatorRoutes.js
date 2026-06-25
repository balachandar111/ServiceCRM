const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { protect } = require("../middlewares/authMiddleware");

const {
  createSmartCalculator,
  getSmartCalculators,
} = require("../controllers/smartCalculatorController");

// POST /api/smartcalculator/create  — protected so req.user.id is available
router.post(
  "/create",
  protect,
  upload.single("file"),
  createSmartCalculator
);

// GET  /api/smartcalculator/all     — protected; role-based filtering inside controller
router.get(
  "/all",
  protect,
  getSmartCalculators
);

module.exports = router;