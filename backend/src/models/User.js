const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        uid: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        name: { type: String, default: "" },
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        otp: { type: String },         // Stores the current OTP
        otpExpires: { type: Date },    // Expiration timestamp
        photo: { type: String, default: "" },
        referralCode: { type: String, unique: true, sparse: true, index: true }, // Unique Referral Code
        coins: { type: Number, default: 0 }, // Kasturi Coins Balance

        // Role based access can be added here
        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer"
        }
    },
    {
        timestamps: true,
        collection: "users"
    }
);

module.exports = mongoose.model("User", UserSchema);
