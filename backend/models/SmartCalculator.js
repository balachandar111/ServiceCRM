const mongoose = require("mongoose");

const smartCalculatorSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
    },

    orderNo: {
      type: String,
    },

    fileName: {
      type: String,
    },

    fileUrl: {
      type: String,
    },

    // Track which user uploaded this record
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SmartCalculator", smartCalculatorSchema);