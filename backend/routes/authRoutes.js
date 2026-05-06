const express = require("express");
const router = express.Router();
const { register, login,logout,getMe } = require("../controllers/authController");

router.post("/register", register);
router.post("/login",login);

const protect = require("../middlewares/authMiddleware");
const { updateUser } = require("../controllers/authController");

router.get("/me", protect, getMe);
router.put("/update", protect, updateUser);
router.post("/logout", protect, logout);

module.exports = router;