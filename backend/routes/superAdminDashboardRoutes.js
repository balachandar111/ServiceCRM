// superAdminDashboardRoutes.js
// Mount in server.js:  app.use("/api/superadmin-dashboard", superAdminDashboardRoutes);
//
// UPDATED: every route below is now protected — only a logged-in SUPER_ADMIN
// (valid JWT + role === "SUPER_ADMIN") can call these endpoints.
// Previously these routes had no auth middleware at all.

const express = require("express");
const router  = express.Router();

const { protect }        = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const {
  getSuperAdminOverview,
  getAllAdminsForSuperAdmin,
  getAllUsersForSuperAdmin,
  getAllCustomersForSuperAdmin,
  getAdminDashboardForSuperAdmin,
  getUsersUnderAdmin,
  getUserDashboardForSuperAdmin,
  createCustomerBySuperAdmin,
  updateCustomerBySuperAdmin,
  reassignCustomerBySuperAdmin,
  deleteCustomerBySuperAdmin,
  getAllSmartCalculators,
  getSmartCalculatorsByAdmin,
  getSmartCalculatorsByUser,
} = require("../controllers/superAdminDashboardController");

const {
  getSuperAdminIncentiveApprovals,
  superAdminApproveIncentive,
  superAdminRejectIncentive,
} = require("../controllers/ApprovalController");

// Apply to every route in this router: must be logged in AND be SUPER_ADMIN
router.use(protect, authorizeRoles("SUPER_ADMIN"));

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get("/overview",              getSuperAdminOverview);
router.get("/admins",                getAllAdminsForSuperAdmin);
router.get("/users",                 getAllUsersForSuperAdmin);       // all users
router.get("/admin/:adminId",        getAdminDashboardForSuperAdmin);
router.get("/admin/:adminId/users",  getUsersUnderAdmin);
router.get("/user/:userId",          getUserDashboardForSuperAdmin);

// ── Customers (SuperAdmin CRUD — no approval) ─────────────────────────────────
router.get("/customers",                  getAllCustomersForSuperAdmin);
router.post("/customers",                 createCustomerBySuperAdmin);
router.put("/customers/:id",              updateCustomerBySuperAdmin);
router.put("/customers/:id/reassign",     reassignCustomerBySuperAdmin);
router.delete("/customers/:id",           deleteCustomerBySuperAdmin);

// ── Smart Calculator ──────────────────────────────────────────────────────────
router.get("/smart-calculator",                   getAllSmartCalculators);
router.get("/smart-calculator/admin/:adminId",    getSmartCalculatorsByAdmin);
router.get("/smart-calculator/user/:userId",      getSmartCalculatorsByUser);

// ── Incentive Approvals (SuperAdmin manages all incentive approvals) ──────────
router.get("/incentive-approvals",                    getSuperAdminIncentiveApprovals);
router.put("/incentive-approvals/:id/approve",        superAdminApproveIncentive);
router.put("/incentive-approvals/:id/reject",         superAdminRejectIncentive);

module.exports = router;