const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        passwordHash: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["SUPER_ADMIN", "ADMIN", "SUPPORT"],
            default: "ADMIN"
        },
        twoFactorSecret: {
            ascii: String,
            hex: String,
            base32: String,
            otpauth_url: String
        },
        isTwoFactorEnabled: {
            type: Boolean,
            default: false
        },
        isPasswordChangeRequired: {
            type: Boolean,
            default: false
        },
        lastLogin: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        collection: "admins"
    }
);

module.exports = mongoose.model("Admin", AdminSchema);
