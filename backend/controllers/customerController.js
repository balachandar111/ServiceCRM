const Customer = require("../models/Customer");
const User = require("../models/User");
const Admin = require("../models/Admin");
const SuperAdmin = require("../models/SuperAdmin");
const Approval = require("../models/Approval");
const bcrypt = require("bcryptjs");

const generateToken = require("../utils/generateToken");
const resolveCreatedBy = require("../utils/resolve-created-by");
const XLSX = require("xlsx");

// Helper to auto-create incentive approval when a Closed customer has allocation saved
const triggerIncentiveApproval = async (customer, requestedById) => {
  try {
    const alloc = customer.closedDetails?.bottomLineAllocation;
    const hasAlloc = alloc &&
      (alloc.accountManagerName || alloc.backendSupportName || alloc.serviceDeliveryName);

    if (customer.leadStatus === "Closed" && hasAlloc) {
      // Check if there is already a pending/approved incentive approval for this customer
      const existing = await Approval.findOne({
        customer: customer._id,
        approvalType: "incentive",
        status: { $in: ["Pending", "Approved"] },
      });

      if (!existing) {
        await Approval.create({
          customer: customer._id,
          customerName: customer.name || "",
          requestedBy: requestedById,
          approvalType: "incentive",
          previousAssignedTo: "",
          requestedAssignedTo: customer.assignedTo || "",
        });
      }
    }
  } catch (err) {
    console.error("triggerIncentiveApproval error:", err.message);
  }
};
// USER / ADMIN / SUPER_ADMIN live in 3 separate collections (User, Admin,
// SuperAdmin) - not one shared "User" model. To correctly attribute a
// remark edit we must look the editor up in the collection that matches
// their role, otherwise the name lookup silently fails ("Unknown").
const getEditorInfo = async (reqUser) => {
  try {
    if (reqUser.role === "SUPER_ADMIN") {
      const sa = await SuperAdmin.findById(reqUser.id).select("name");
      return { name: sa?.name || "Unknown", role: "SUPER_ADMIN" };
    }

    if (reqUser.role === "ADMIN") {
      const admin = await Admin.findById(reqUser.id).select("name role");
      return { name: admin?.name || "Unknown", role: admin?.role || "ADMIN" };
    }

    // USER
    const user = await User.findById(reqUser.id).select("name role");
    return { name: user?.name || "Unknown", role: user?.role || "USER" };
  } catch (err) {
    console.error("getEditorInfo error:", err.message);
    return { name: "Unknown", role: reqUser.role };
  }
};

// SUPER_ADMINs see all customers;
// ADMINs see customers created by their users (or themselves);
// USERs only see the customers they created.
const buildCreatedByFilter = async (user) => {
  if (user.role === "USER") {
    return { createdBy: user.id };
  }
  if (user.role === "ADMIN") {
    // Find all users created by this admin
    const adminUsers = await User.find({ createdBy: user.id, role: "USER" }).select("_id");
    const userIds = adminUsers.map((u) => u._id);
    // Include the admin's own id too (in case admin directly created customers)
    userIds.push(user.id);
    return { createdBy: { $in: userIds } };
  }
  return {};
};

exports.createCustomer = async (req, res) => {
  try {
    const body = { ...req.body };

    // Empty-string outsourceCustomerId breaks ObjectId casting - normalize to null
    if (body.closedDetails && body.closedDetails.outsourceCustomerId === "") {
      body.closedDetails.outsourceCustomerId = null;
    }

    // If admin/super_admin assigns to a user, set createdBy to that user
    if (
      (req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN") &&
      body.assignedToUserId
    ) {
      body.createdBy = body.assignedToUserId;
      delete body.assignedToUserId;
    } else {
      body.createdBy = req.user.id;
      delete body.assignedToUserId;
    }

    const customer = await Customer.create(body);

    // Log the initial remark (if any) as the first history entry too.
    if (body.remark) {
      const editor = await getEditorInfo(req.user);
      customer.remarkHistory = [
        {
          remark: body.remark,
          updatedBy: req.user.id,
          updatedByName: editor.name,
          updatedByRole: editor.role,
          updatedAt: new Date(),
        },
      ];
      await customer.save();
    }

    // Auto-trigger incentive approval if Closed + allocation saved
    await triggerIncentiveApproval(customer, body.createdBy || req.user.id);

    res.status(201).json({
      success: true,
      message: "Customer Created",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const filter = await buildCreatedByFilter(req.user);

    const customers = await Customer.find(filter).sort({ createdAt: -1 });

    // NOTE: a customer can be createdBy a real User OR directly by an
    // Admin/SuperAdmin (when it wasn't assigned to a specific user).
    // A plain `.populate("createdBy")` only checks the User collection
    // and silently nulls out the field otherwise — which made those
    // customers invisible to the SuperAdmin admin/user filters on the
    // frontend. resolveCreatedBy checks User, Admin, and SuperAdmin.
    const resolved = await resolveCreatedBy(customers);

    res.status(200).json({ success: true, data: resolved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    const resolved = await resolveCreatedBy(customer);

    if (
      req.user.role === "USER" &&
      resolved.createdBy &&
      resolved.createdBy._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: resolved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const existing = await Customer.findById(req.params.id);

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    if (
      req.user.role === "USER" &&
      existing.createdBy &&
      existing.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied: you can only update your own customers",
      });
    }

    const body = { ...req.body };

    // Empty-string outsourceCustomerId breaks ObjectId casting - normalize to null
    if (body.closedDetails && body.closedDetails.outsourceCustomerId === "") {
      body.closedDetails.outsourceCustomerId = null;
    }

    // If admin/super_admin is changing assignedTo, also update createdBy
    if (
      (req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN") &&
      body.assignedToUserId
    ) {
      body.createdBy = body.assignedToUserId;
      delete body.assignedToUserId;
    } else {
      delete body.assignedToUserId;
    }

    // ---- Remark edit history tracking ----
    // Only log a history entry when "remark" was actually sent in the
    // request AND the value is actually different from what's stored.
    // updatedByRole tells us whether it was a USER, ADMIN or SUPER_ADMIN
    // edit, and updatedByName/updatedAt are shown in the UI.
    const updateOps = { $set: body };

    if (
      Object.prototype.hasOwnProperty.call(body, "remark") &&
      (body.remark || "") !== (existing.remark || "")
    ) {
      const editor = await getEditorInfo(req.user);

      updateOps.$push = {
        remarkHistory: {
          $each: [
            {
              remark: body.remark || "",
              updatedBy: req.user.id,
              updatedByName: editor.name,
              updatedByRole: editor.role,
              updatedAt: new Date(),
            },
          ],
          // newest first - keep COMPLETE history, no slice/cap
          $position: 0,
        },
      };
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      updateOps,
      { new: true }
    );

    // Auto-trigger incentive approval if Closed + allocation saved
    await triggerIncentiveApproval(customer, req.user.id);

    res.status(200).json({
      success: true,
      message: "Customer Updated",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin-only: reassign a customer to a different user
exports.reassignCustomer = async (req, res) => {
  try {
    if (req.user.role === "USER") {
      return res.status(403).json({
        success: false,
        message: "Only admins can reassign customers",
      });
    }

    const { userId, assignedTo } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "Target user not found" });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        createdBy: userId,
        assignedTo: assignedTo || targetUser.name,
      },
      { new: true }
    );

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({
      success: true,
      message: `Customer reassigned to ${targetUser.name}`,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const existing = await Customer.findById(req.params.id);

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    if (
      req.user.role === "USER" &&
      existing.createdBy &&
      existing.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied: you can only delete your own customers",
      });
    }

    await Customer.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Customer Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.customerDashboard = async (req, res) => {
  try {
    const filter = await buildCreatedByFilter(req.user);
    const customers = await Customer.find(filter);

    const dashboard = {
      totalCustomers: customers.length,
      quotationShared: customers.filter(
        (c) => c.leadStatus === "Quotation Shared"
      ).length,
      closedCustomers: customers.filter((c) => c.leadStatus === "Closed")
        .length,
      callFollowups: customers.filter((c) => c.followUpType === "Calls").length,
      paymentFollowups: customers.filter((c) => c.followUpType === "Payment")
        .length,
      users: customers,
    };

    res.status(200).json({ success: true, data: dashboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkUploadCustomers = async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const customers = [];

    for (const row of rows) {
      const customerData = {
        name: row.name || "",
        company: row.company || "",
        phoneNumber: row.phoneNumber || "",
        email: row.email || "",
        service: row.service || "Service",
        status: row.status || "Waiting for Internal",
        customerLevel: row.customerLevel || "New",
        callType: row.callType || "AMC",
        leadStatus: row.leadStatus || "Quotation Shared",
        followUpType: row.followUpType || "Payment",
        followUpDate: row.followUpDate ? new Date(row.followUpDate) : null,
        leadStage: row.leadStage || "Awareness",
        priority: row.priority || "Medium",
        source: row.source || "Website",
        assignedTo: row.assignedTo || "",
        sector: row.sector || "",
        expense: Number(row.expense) || 0,
        remark: row.remark || "",
        createdBy: req.user.id,
      };

      if (row.leadStatus === "Quotation Shared") {
        customerData.quotationShared = {
          whatsappShared:
            row.whatsappShared === true || row.whatsappShared === "TRUE",
          emailShared:
            row.emailShared === true || row.emailShared === "TRUE",
          gstType: row.gstType || "GST",
          quotationNumber: row.quotationNumber || "",
        };
      }

      if (row.leadStatus === "Closed") {
        customerData.closedDetails = {
          engineers: row.engineers
            ? row.engineers.split(",").map((e) => e.trim())
            : [],
          fieldEngineer: row.fieldEngineer || "",
          outsourceName: row.outsourceName || "",
          outsourceDate: row.outsourceDate ? new Date(row.outsourceDate) : null,
          internalName: row.internalName || "",
          internalDate: row.internalDate ? new Date(row.internalDate) : null,
          invoiceNumber: row.invoiceNumber || "",
        };
      }

      customers.push(customerData);
    }

    await Customer.insertMany(customers);

    res
      .status(201)
      .json({ success: true, message: "Customers uploaded successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadCustomers = async (req, res) => {
  try {
    const filter = await buildCreatedByFilter(req.user);
    const customers = await Customer.find(filter);
    const worksheet = XLSX.utils.json_to_sheet(customers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    const filePath = "./uploads/customers.xlsx";
    XLSX.writeFile(workbook, filePath);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.customerAnalytics = async (req, res) => {
  try {
    const filter = await buildCreatedByFilter(req.user);
    const customers = await Customer.find(filter);

    const analytics = {
      totalCustomers: customers.length,
      awareness: customers.filter((x) => x.leadStage === "Awareness").length,
      interest: customers.filter((x) => x.leadStage === "Interest").length,
      desire: customers.filter((x) => x.leadStage === "Desire").length,
      closure: customers.filter((x) => x.leadStage === "Closure").length,
      highPriority: customers.filter((x) => x.priority === "High").length,
      quotationShared: customers.filter(
        (x) => x.leadStatus === "Quotation Shared"
      ).length,
      closed: customers.filter((x) => x.leadStatus === "Closed").length,
      customers,
    };

    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};