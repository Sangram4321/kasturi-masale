const User = require('../models/User'); // Adjust path as needed
const { sendOTP } = require('../services/fast2sms.service');
const jwt = require('jsonwebtoken'); // Assuming you use JWT for auth

// Helper to generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// 1. Send OTP
exports.sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone || phone.length !== 10) {
            return res.status(400).json({ message: "Invalid phone number. Must be 10 digits." });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

        // Check if user exists, if not, we can either create a temp record or just update/find an existing one
        // Strategy: We will upsert (update or insert) based on phone number? 
        // OR simply find the user. If user doesn't exist, we might want to CREATE them on verification step 
        // to collect name/email later, or just store OTP in a temporary way.
        // EASIER: Find user by phone. If not found, create a placeholder user or handle "signup" flow.

        // For now, let's find user. If found, save OTP. If not found, create new user with phone.
        let user = await User.findOne({ phone });

        if (!user) {
            // Create a new partial user
            // We need a UID for the user model. Let's start with a placeholder or generate one.
            // Since `uid` is required and unique, we can use `phone` as `uid` initially or generate a UUID.
            const { v4: uuidv4 } = require('uuid');
            user = new User({
                uid: uuidv4(),
                phone: phone,
                name: "New User", // Placeholder
            });
        }

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Call Fast2SMS Service
        await sendOTP(phone, otp);

        res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error("OTP Send Error:", error);
        res.status(500).json({ message: "Failed to send OTP", error: error.message });
    }
};

// 2. Verify OTP
exports.verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        console.log(`[OTP VERIFY] Verifying for ${phone}. Received: ${otp}`);

        if (!phone || !otp) {
            return res.status(400).json({ message: "Phone and OTP are required" });
        }

        const user = await User.findOne({ phone });

        if (!user) {
            console.log(`[OTP VERIFY] User not found for ${phone}`);
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`[OTP VERIFY] Found user. Stored OTP: ${user.otp}, Expires: ${user.otpExpires}`);

        // Check Validity
        if (String(user.otp) !== String(otp)) {
            console.log(`[OTP VERIFY] Mismatch!`);
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        // Clear OTP after successful use
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Issue Token (Similar to your existing login controller)
        // Adjust payload as per your auth middleware requirement
        const token = jwt.sign(
            { uid: user.uid, role: user.role, phone: user.phone },
            process.env.JWT_SECRET || 'secret_key', // Ensure you have JWT_SECRET in env
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                uid: user.uid,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                photo: user.photo
            }
        });

    } catch (error) {
        console.error("OTP Verify Error:", error);
        res.status(500).json({ message: "Verification failed", error: error.message });
    }
};
