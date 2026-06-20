const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        default: null
    },

    name: {
        type: String,
        required: true
    },

    company: {
        type: String,
        default: ""
    },

    username: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        lowercase: true
    },

    phone: {
        type: String
    },

    password: {
        type: String,
        required: true
    },

    profile: {
        type: String,
        default: ""
    },

    role: {
        type: String,
        enum: [
            "SUPER_ADMIN",
            "ADMIN",
            "USER"
        ],
        required: true
    },

    status: {
        type: String,
        enum: [
            "ACTIVE",
            "INACTIVE"
        ],
        default: "ACTIVE"
    }

},
{
    timestamps: true
});

module.exports = mongoose.model(
    "Adim",
    userSchema
);