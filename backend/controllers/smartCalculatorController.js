const fs = require("fs");
const cloudinary = require("../config/cloudinary");
const SmartCalculator = require("../models/SmartCalculator");

// CREATE — store file + tag with the logged-in user
exports.createSmartCalculator = async (req, res) => {
  try {
    const { companyName, orderNo } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File Required",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "smart-calculator",
      resource_type: "auto",
    });

    const data = await SmartCalculator.create({
      companyName,
      orderNo,
      fileName: req.file.originalname,
      fileUrl: result.secure_url,
      createdBy: req.user?.id || null,
    });

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: "Uploaded Successfully",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL — admin sees everything with createdBy populated;
// regular USER sees only their own uploads
exports.getSmartCalculators = async (req, res) => {
  try {
    const role = req.user?.role;

    // ADMINs and SUPER_ADMINs see all records
    const filter =
      role === "ADMIN" || role === "SUPER_ADMIN"
        ? {}
        : { createdBy: req.user?.id };

    const data = await SmartCalculator.find(filter)
      .populate("createdBy", "name username")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};