const Approval = require("../models/Approval");
const Customer = require("../models/Customer");
const User = require("../models/User");

// GET INCENTIVE APPROVALS — admin sees incentive approvals for their users
exports.getIncentiveApprovals = async (req, res) => {
  try {
    // Find users created by this admin
    const adminUsers = await User.find({
      createdBy: req.user.id,
      role: "USER",
    }).select("_id");

    const userIds = adminUsers.map((u) => u._id);
    userIds.push(req.user.id); // include admin's own requests too

    const filter = {
      approvalType: "incentive",
      requestedBy: { $in: userIds },
    };

    if (req.query.status) filter.status = req.query.status;

    const approvals = await Approval.find(filter)
      .populate("customer", "name company leadStatus closedDetails")
      .populate("requestedBy", "name username")
      .populate("reviewedBy", "name username")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: approvals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// APPROVE INCENTIVE — admin approves incentive approval
exports.approveIncentive = async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.id);

    if (!approval) {
      return res.status(404).json({ success: false, message: "Approval not found" });
    }

    if (approval.approvalType !== "incentive") {
      return res.status(400).json({ success: false, message: "Not an incentive approval" });
    }

    if (approval.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Already reviewed" });
    }

    approval.status = "Approved";
    approval.reviewedBy = req.user.id;
    approval.reviewedAt = new Date();
    await approval.save();

    res.status(200).json({ success: true, message: "Incentive Approved" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// REJECT INCENTIVE
exports.rejectIncentive = async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.id);

    if (!approval) {
      return res.status(404).json({ success: false, message: "Approval not found" });
    }

    if (approval.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Already reviewed" });
    }

    approval.status = "Rejected";
    approval.reviewedBy = req.user.id;
    approval.reviewedAt = new Date();
    await approval.save();

    res.status(200).json({ success: true, message: "Incentive Rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// GET APPROVAL STATUS FOR A SPECIFIC CUSTOMER
exports.getCustomerApprovalStatus = async (req, res) => {
  try {
    const approval = await Approval.findOne({
      customer: req.params.customerId,
      approvalType: "incentive",
    })
      .populate("reviewedBy", "name username")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: approval || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createApproval = async (req, res) => {
  try {
    const { customerId, previousAssignedTo, requestedAssignedTo } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "customerId is required",
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const approval = await Approval.create({
      customer: customerId,
      customerName: customer.name || "",
      requestedBy: req.user.id,
      previousAssignedTo: previousAssignedTo || "",
      requestedAssignedTo: requestedAssignedTo || "",
    });

    const populated = await Approval.findById(approval._id)
      .populate("customer", "name company")
      .populate("requestedBy", "name username");

    res.status(201).json({
      success: true,
      message: "Approval request sent to admin",
      data: populated,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL — admin sees all requests, optionally filtered by status
exports.getApprovals = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const approvals = await Approval.find(filter)
      .populate("customer", "name company")
      .populate("requestedBy", "name username")
      .populate("reviewedBy", "name username")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: approvals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// APPROVE — admin approves:
//   1. Update customer.assignedTo  (the display name string)
//   2. Update customer.createdBy   (the ObjectId) → transfers ownership
//      so the reassigned user sees the customer in their list
exports.approveApproval = async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.id);

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: "Approval request not found",
      });
    }

    if (approval.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been reviewed",
      });
    }

    // Build query: match by name, role USER
    // Also scope by organization if admin has one
    const userQuery = {
      name: approval.requestedAssignedTo,
      role: "USER",
    };
    if (req.user.organization) {
      userQuery.organization = req.user.organization;
    }

    let targetUser = await User.findOne(userQuery);

    // Fallback: try without org scope if not found
    if (!targetUser && req.user.organization) {
      targetUser = await User.findOne({
        name: approval.requestedAssignedTo,
        role: "USER",
      });
    }

    // Build the update payload
    const customerUpdate = {
      assignedTo: approval.requestedAssignedTo,
    };

    // Transfer ownership so the customer appears in the new user's list
    if (targetUser) {
      customerUpdate.createdBy = targetUser._id;
    }

    await Customer.findByIdAndUpdate(approval.customer, customerUpdate, { new: true });

    approval.status = "Approved";
    approval.reviewedBy = req.user.id;
    approval.reviewedAt = new Date();
    await approval.save();

    res.status(200).json({
      success: true,
      message: targetUser
        ? `Reassignment approved — customer transferred to ${targetUser.name}`
        : "Reassignment approved and assignedTo updated (user account not found for full transfer)",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// REJECT — admin rejects; customer unchanged
exports.rejectApproval = async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.id);

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: "Approval request not found",
      });
    }

    if (approval.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been reviewed",
      });
    }

    approval.status = "Rejected";
    approval.reviewedBy = req.user.id;
    approval.reviewedAt = new Date();
    await approval.save();

    res.status(200).json({
      success: true,
      message: "Reassignment rejected",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// SUPER ADMIN — Incentive Approvals
// ─────────────────────────────────────────────────────────

// GET ALL incentive approvals across every user/admin in the system
exports.getSuperAdminIncentiveApprovals = async (req, res) => {
  try {
    const filter = { approvalType: "incentive" };
    if (req.query.status) filter.status = req.query.status;

    const approvals = await Approval.find(filter)
      .populate("customer", "name company leadStatus closedDetails")
      .populate({
        path: "requestedBy",
        select: "name username createdBy",
        populate: { path: "createdBy", select: "name username" }, // populate admin name
      })
      .populate("reviewedBy", "name username")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: approvals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// APPROVE incentive — super admin approves
exports.superAdminApproveIncentive = async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.id);

    if (!approval) {
      return res.status(404).json({ success: false, message: "Approval not found" });
    }
    if (approval.approvalType !== "incentive") {
      return res.status(400).json({ success: false, message: "Not an incentive approval" });
    }
    if (approval.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Already reviewed" });
    }

    approval.status     = "Approved";
    approval.reviewedBy = req.user.id;
    approval.reviewedAt = new Date();
    await approval.save();

    res.status(200).json({ success: true, message: "Incentive Approved" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// REJECT incentive — super admin rejects
exports.superAdminRejectIncentive = async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.id);

    if (!approval) {
      return res.status(404).json({ success: false, message: "Approval not found" });
    }
    if (approval.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Already reviewed" });
    }

    approval.status     = "Rejected";
    approval.reviewedBy = req.user.id;
    approval.reviewedAt = new Date();
    await approval.save();

    res.status(200).json({ success: true, message: "Incentive Rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};