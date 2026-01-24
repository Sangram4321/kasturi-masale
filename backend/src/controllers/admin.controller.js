
/* ================= ADMIN CONTROLLER ================= */

exports.login = async (req, res) => {
    try {
        const { pin } = req.body;

        // Hardcoded secure PIN for now
        // In production, this should be in .env
        const ADMIN_PIN = process.env.ADMIN_PIN || "KASTURI2024";

        if (pin === ADMIN_PIN) {
            return res.json({
                success: true,
                message: "Welcome back, Admin!",
                token: "admin-token-12345" // Simple token simulation
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid Access PIN"
            });
        }

    } catch (error) {
        console.error("ADMIN LOGIN ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
