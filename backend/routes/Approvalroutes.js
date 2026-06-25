const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  createApproval,
  getApprovals,
  approveApproval,
  rejectApproval,
} = require("../controllers/ApprovalController");

// POST  /api/approvals        — user creates an approval request
router.post("/", protect, createApproval);

// GET   /api/approvals        — admin lists all requests (?status=Pending etc.)
router.get("/", protect, getApprovals);

// PUT   /api/approvals/:id/approve — admin approves
router.put("/:id/approve", protect, approveApproval);

// PUT   /api/approvals/:id/reject  — admin rejects
router.put("/:id/reject", protect, rejectApproval);

module.exports = router;