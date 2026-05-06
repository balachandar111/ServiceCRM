const generateToken = require("../utils/jwt");

const User = require("../models/userModel");

// Inject model dynamically (because multiple DB)
const setUserModel = (model) => {
  User = model;
};

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, setUserModel }; 
const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, email, password } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // 🔐 If password updated → hash it
    if (password) {
      const bcrypt = require("bcrypt");
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getMe = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
module.exports = { register, login, updateUser, logout, getMe, setUserModel };
