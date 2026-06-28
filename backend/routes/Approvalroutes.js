const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  createApproval,
  getApprovals,
  approveApproval,
  rejectApproval,
  getIncentiveApprovals,
  approveIncentive,
  rejectIncentive,
  getCustomerApprovalStatus,
} = require("../controllers/ApprovalController");

// POST  /api/approvals        — user creates an approval request
router.post("/", protect, createApproval);

// GET   /api/approvals        — admin lists all requests (?status=Pending etc.)
router.get("/", protect, getApprovals);

// GET   /api/approvals/incentives — admin lists incentive approvals for their users
router.get("/incentives", protect, getIncentiveApprovals);

// GET   /api/approvals/customer/:customerId — get incentive approval for specific customer
router.get("/customer/:customerId", protect, getCustomerApprovalStatus);

// PUT   /api/approvals/:id/approve — admin approves reassignment
router.put("/:id/approve", protect, approveApproval);

// PUT   /api/approvals/:id/reject  — admin rejects reassignment
router.put("/:id/reject", protect, rejectApproval);

// PUT   /api/approvals/:id/approve-incentive — admin approves incentive
router.put("/:id/approve-incentive", protect, approveIncentive);

// PUT   /api/approvals/:id/reject-incentive — admin rejects incentive
router.put("/:id/reject-incentive", protect, rejectIncentive);

module.exports = router;