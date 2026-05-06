const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");

const {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer
} = require("../controllers/customerController");

router.post("/", protect, createCustomer);
router.get("/", protect, getCustomers);
router.put("/:id", protect, updateCustomer);
router.delete("/:id", protect, deleteCustomer);

module.exports = router;