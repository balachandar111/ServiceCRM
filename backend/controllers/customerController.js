const Customer = require("../models/customerModel");

// ➕ CREATE
const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      customer
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 📥 GET ALL
const getCustomers = async (req, res) => {
  try {
    const query = { createdBy: req.user.id };

    if (req.query.status) query.status = req.query.status;
    if (req.query.company) query.company = req.query.company;

    const customers = await Customer.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      customers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateCustomer = async (req, res) => {
  try {

    // 🔍 Find customer
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    // 🔐 Ensure only owner can update
    if (customer.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // ✏️ Update
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: "Customer updated successfully",
      customer: updatedCustomer
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// ❌ DELETE
const deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Customer deleted"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer
};