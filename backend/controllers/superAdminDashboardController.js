// superAdminDashboardController.js
// All SuperAdmin dashboard endpoints — no auth middleware required (matched to project pattern)

const Admin           = require("../models/Admin");
const User            = require("../models/User");
const Customer        = require("../models/Customer");
const SmartCalculator = require("../models/SmartCalculator");
const resolveCreatedBy = require("../utils/resolveCreatedBy");

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: build stats from a customer array
// ─────────────────────────────────────────────────────────────────────────────
const buildStats = (customers) => {
  const total            = customers.length;
  const activeLeads      = customers.filter(c => c.leadStatus !== "Closed").length;
  const closedLeads      = customers.filter(c => c.leadStatus === "Closed").length;
  const quotationShared  = customers.filter(c => c.leadStatus === "Quotation Shared").length;
  const followUpCalls    = customers.filter(c => c.followUpType === "Calls").length;
  const paymentFollowups = customers.filter(c => c.followUpType === "Payment").length;
  const newCustomers     = customers.filter(c => c.customerLevel === "New").length;
  const oldCustomers     = customers.filter(c => c.customerLevel === "Old").length;

  const today = new Date().toISOString().slice(0, 10);
  const todayReminders = customers.filter(c =>
    c.followUpDate && new Date(c.followUpDate).toISOString().slice(0, 10) === today
  ).length;

  const leadStageData = ["Awareness", "Interest", "Desire", "Closure"].map(s => ({
    name: s, value: customers.filter(c => c.leadStage === s).length,
  }));
  const priorityData = ["Low", "Medium", "High"].map(p => ({
    name: p, value: customers.filter(c => c.priority === p).length,
  }));
  const sourceData = ["Website", "Referral", "Expo", "Social media"].map(s => ({
    name: s, value: customers.filter(c => c.source === s).length,
  }));

  const monthMap = {};
  customers.forEach(c => {
    const d   = new Date(c.createdAt);
    const key = `${d.toLocaleString("default", { month: "short" })}-${d.getFullYear()}`;
    monthMap[key] = (monthMap[key] || 0) + 1;
  });
  const monthlyTrendData = Object.keys(monthMap).map(k => ({ month: k, customers: monthMap[k] }));

  return {
    total, activeLeads, closedLeads, quotationShared,
    followUpCalls, paymentFollowups, newCustomers, oldCustomers,
    todayReminders, leadStageData, priorityData, sourceData, monthlyTrendData,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 1.  GLOBAL OVERVIEW
//     GET /api/superadmin-dashboard/overview
// ─────────────────────────────────────────────────────────────────────────────
exports.getSuperAdminOverview = async (req, res) => {
  try {
    const admins    = await Admin.find({ role: "ADMIN" }).populate("organization", "orgName").select("-password");
    const users     = await User.find({ role: "USER" });
    const customersRaw = await Customer.find();
    const customers = await resolveCreatedBy(customersRaw);

    const stats = buildStats(customers);

    const adminSummaries = await Promise.all(
      admins.map(async admin => {
        const adminUserIds = (
          await User.find({ createdBy: admin._id, role: "USER" }).select("_id")
        ).map(u => u._id);

        const adminCustomers = await Customer.find({
          createdBy: { $in: [...adminUserIds, admin._id] },
        }).select("leadStatus");

        return {
          _id:             admin._id,
          name:            admin.name,
          organization:    admin.organization,
          status:          admin.status,
          totalUsers:      adminUserIds.length,
          totalCustomers:  adminCustomers.length,
          closedCustomers: adminCustomers.filter(c => c.leadStatus === "Closed").length,
          quotationShared: adminCustomers.filter(c => c.leadStatus === "Quotation Shared").length,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        totalAdmins: admins.length,
        totalUsers:  users.length,
        totalCustomers: customers.length,
        ...stats,
        admins,
        adminSummaries,
        customers,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2.  ALL ADMINS (lightweight, for dropdowns)
//     GET /api/superadmin-dashboard/admins
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllAdminsForSuperAdmin = async (req, res) => {
  try {
    const admins = await Admin.find({ role: "ADMIN" })
      .populate("organization", "orgName orgCode")
      .select("-password");

    const result = await Promise.all(
      admins.map(async admin => {
        const userCount = await User.countDocuments({ createdBy: admin._id, role: "USER" });
        return { ...admin.toObject(), userCount };
      })
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3.  ALL USERS (for SuperAdmin dropdown — returns ALL users, not scoped)
//     GET /api/superadmin-dashboard/users
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllUsersForSuperAdmin = async (req, res) => {
  try {
    const users = await User.find({ role: "USER" }).select("-password");
    // Users are createdBy an Admin (different collection) — resolve
    // across User/Admin/SuperAdmin instead of a single-collection populate.
    const resolved = await resolveCreatedBy(users);
    res.status(200).json({ success: true, data: resolved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4.  ALL CUSTOMERS (for SuperAdmin — every customer)
//     GET /api/superadmin-dashboard/customers
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllCustomersForSuperAdmin = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    // createdBy can be a User OR an Admin/SuperAdmin (when not assigned
    // to a specific user) — resolve across all three collections.
    const resolved = await resolveCreatedBy(customers);
    res.status(200).json({ success: true, data: resolved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5.  SPECIFIC ADMIN DASHBOARD
//     GET /api/superadmin-dashboard/admin/:adminId
// ─────────────────────────────────────────────────────────────────────────────
exports.getAdminDashboardForSuperAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const admin = await Admin.findById(adminId)
      .populate("organization", "orgName orgCode")
      .select("-password");
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    const users     = await User.find({ createdBy: adminId, role: "USER" })
      .select("name username loginStatus createdAt");
    const userIds   = users.map(u => u._id);
    const customersRaw = await Customer.find({ createdBy: { $in: [...userIds, adminId] } });
    const customers = await resolveCreatedBy(customersRaw);
    const stats     = buildStats(customers);

    res.status(200).json({
      success: true,
      data: { admin, users, customers, totalUsers: users.length, totalCustomers: customers.length, ...stats },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6.  USERS UNDER AN ADMIN (cascading dropdown)
//     GET /api/superadmin-dashboard/admin/:adminId/users
// ─────────────────────────────────────────────────────────────────────────────
exports.getUsersUnderAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const users = await User.find({ createdBy: adminId, role: "USER" })
      .select("name username loginStatus createdAt");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 7.  SPECIFIC USER DASHBOARD
//     GET /api/superadmin-dashboard/user/:userId
// ─────────────────────────────────────────────────────────────────────────────
exports.getUserDashboardForSuperAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const customersRaw = await Customer.find({ createdBy: userId });
    const customers = await resolveCreatedBy(customersRaw);
    const stats     = buildStats(customers);

    res.status(200).json({
      success: true,
      data: { user, customers, totalCustomers: customers.length, ...stats },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 8.  CREATE CUSTOMER (SuperAdmin)
//     POST /api/superadmin-dashboard/customers
// ─────────────────────────────────────────────────────────────────────────────
exports.createCustomerBySuperAdmin = async (req, res) => {
  try {
    const body = { ...req.body };

    if (body.closedDetails?.outsourceCustomerId === "") {
      body.closedDetails.outsourceCustomerId = null;
    }

    // assignedToUserId tells us whose bucket the customer goes into
    if (body.assignedToUserId) {
      body.createdBy = body.assignedToUserId;
    }
    delete body.assignedToUserId;

    const customer = await Customer.create(body);
    const populated = await resolveCreatedBy(customer);

    res.status(201).json({ success: true, message: "Customer Created", data: populated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 9.  UPDATE CUSTOMER (SuperAdmin)
//     PUT /api/superadmin-dashboard/customers/:id
// ─────────────────────────────────────────────────────────────────────────────
exports.updateCustomerBySuperAdmin = async (req, res) => {
  try {
    const existing = await Customer.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Customer not found" });

    const body = { ...req.body };

    if (body.closedDetails?.outsourceCustomerId === "") {
      body.closedDetails.outsourceCustomerId = null;
    }

    if (body.assignedToUserId) {
      body.createdBy = body.assignedToUserId;
    }
    delete body.assignedToUserId;

    const customerRaw = await Customer.findByIdAndUpdate(req.params.id, body, { new: true });
    const customer = await resolveCreatedBy(customerRaw);

    res.status(200).json({ success: true, message: "Customer Updated", data: customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. REASSIGN CUSTOMER (SuperAdmin — no approval needed)
//     PUT /api/superadmin-dashboard/customers/:id/reassign
//     body: { userId }
// ─────────────────────────────────────────────────────────────────────────────
exports.reassignCustomerBySuperAdmin = async (req, res) => {
  try {
    const { userId, assignedTo } = req.body;

    if (!userId) return res.status(400).json({ success: false, message: "userId is required" });

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ success: false, message: "Target user not found" });

    const customerRaw = await Customer.findByIdAndUpdate(
      req.params.id,
      { createdBy: userId, assignedTo: assignedTo || targetUser.name },
      { new: true }
    );

    if (!customerRaw) return res.status(404).json({ success: false, message: "Customer not found" });

    const customer = await resolveCreatedBy(customerRaw);

    res.status(200).json({
      success: true,
      message: `Customer reassigned to ${targetUser.name}`,
      data: customer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 11. DELETE CUSTOMER (SuperAdmin)
//     DELETE /api/superadmin-dashboard/customers/:id
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteCustomerBySuperAdmin = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    res.status(200).json({ success: true, message: "Customer Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 12. SMART CALCULATOR — ALL RECORDS
//     GET /api/superadmin-dashboard/smart-calculator
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllSmartCalculators = async (req, res) => {
  try {
    const records = await SmartCalculator.find()
      .populate("createdBy", "name username")
      .sort({ createdAt: -1 });

    // Enrich each record with the admin who owns the user
    const enriched = await Promise.all(
      records.map(async rec => {
        const obj = rec.toObject();
        if (rec.createdBy?._id) {
          const user = await User.findById(rec.createdBy._id).select("createdBy");
          if (user?.createdBy) {
            const admin = await Admin.findById(user.createdBy).select("name _id");
            obj.adminId   = admin?._id   || null;
            obj.adminName = admin?.name  || "—";
          }
        }
        return obj;
      })
    );

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 13. SMART CALCULATOR — BY ADMIN
//     GET /api/superadmin-dashboard/smart-calculator/admin/:adminId
// ─────────────────────────────────────────────────────────────────────────────
exports.getSmartCalculatorsByAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const users   = await User.find({ createdBy: adminId, role: "USER" }).select("_id name username");
    const userIds = users.map(u => u._id);

    const records = await SmartCalculator.find({ createdBy: { $in: userIds } })
      .populate("createdBy", "name username")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: records, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 14. SMART CALCULATOR — BY USER
//     GET /api/superadmin-dashboard/smart-calculator/user/:userId
// ─────────────────────────────────────────────────────────────────────────────
exports.getSmartCalculatorsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const records = await SmartCalculator.find({ createdBy: userId })
      .populate("createdBy", "name username")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};