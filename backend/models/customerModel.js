const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: String,
  phone: String,
  company: String,
  status: {
    type: String,
    enum: ["lead", "customer"],
    default: "lead"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserDetails"
  }
}, { timestamps: true });

// 🔥 IMPORTANT: Collection name = CustomerDetails
module.exports = mongoose.model("CustomerDetails", customerSchema);