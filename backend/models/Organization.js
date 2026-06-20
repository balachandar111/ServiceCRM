const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
{
    orgName: {
        type: String,
        required: true,
        trim: true
    },

    orgCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },

    companyType: {
        type: String,
        required: true
    },

    companySize: {
        type: String,
        required: true
    },

    logo: {
        type: String,
        default: ""
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
    "Organization",
    organizationSchema
);