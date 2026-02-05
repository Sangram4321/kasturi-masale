import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Lock, CheckCircle, AlertOctagon, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

const API = "";

export default function AdminSettings() {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }

        if (formData.newPassword.length < 8) {
            setMessage({ type: "error", text: "Password must be at least 8 characters" });
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API}/api/admin/rotate-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
                },
                credentials: "include",
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setMessage({ type: "success", text: "Password changed successfully!" });
                setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                setMessage({ type: "error", text: data.message || "Failed to update password" });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Server error. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div style={styles.container}>
                <h1 style={styles.title}>Account Settings</h1>
                <p style={styles.subtitle}>Manage your admin account security and preferences.</p>

                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}>
                            <Lock size={20} color="#4F46E5" />
                        </div>
                        <div>
                            <h2 style={styles.cardTitle}>Change Password</h2>
                            <p style={styles.cardDesc}>Ensure your account is secure by using a strong password.</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdatePassword} style={styles.form}>
                        {message.text && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    ...styles.alert,
                                    background: message.type === "error" ? "#FEF2F2" : "#ECFDF5",
                                    color: message.type === "error" ? "#DC2626" : "#059669",
                                    border: `1px solid ${message.type === "error" ? "#FECACA" : "#A7F3D0"}`
                                }}
                            >
                                {message.type === "error" ? <AlertOctagon size={16} /> : <CheckCircle size={16} />}
                                {message.text}
                            </motion.div>
                        )}

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Current Password</label>
                            <div style={styles.passwordWrapper}>
                                <input
                                    type={showPasswords.current ? "text" : "password"}
                                    name="currentPassword"
                                    placeholder="Enter current password"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    style={{ ...styles.input, paddingRight: 40 }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                    style={styles.eyeBtn}
                                >
                                    {showPasswords.current ? <EyeOff size={18} color="#6B7280" /> : <Eye size={18} color="#6B7280" />}
                                </button>
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>New Password</label>
                                <div style={styles.passwordWrapper}>
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        name="newPassword"
                                        placeholder="Min 8 characters"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        style={{ ...styles.input, paddingRight: 40 }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                        style={styles.eyeBtn}
                                    >
                                        {showPasswords.new ? <EyeOff size={18} color="#6B7280" /> : <Eye size={18} color="#6B7280" />}
                                    </button>
                                </div>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Confirm New Password</label>
                                <div style={styles.passwordWrapper}>
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Re-enter new password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        style={{ ...styles.input, paddingRight: 40 }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        style={styles.eyeBtn}
                                    >
                                        {showPasswords.confirm ? <EyeOff size={18} color="#6B7280" /> : <Eye size={18} color="#6B7280" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={styles.actions}>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

const styles = {
    container: { maxWidth: 800 },
    title: { fontSize: 24, fontWeight: 700, color: "#111827", margin: 0, letterSpacing: '-0.02em' },
    subtitle: { fontSize: 14, color: "#6B7280", marginTop: 4, marginBottom: 32 },
    card: {
        background: "rgba(255, 255, 255, 0.8)",
        borderRadius: 24,
        border: "1px solid rgba(255, 255, 255, 0.4)",
        overflow: "hidden",
        backdropFilter: "blur(12px)",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)"
    },
    cardHeader: {
        padding: 24,
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        display: "flex",
        gap: 16,
        background: "rgba(255,255,255,0.4)"
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        background: "#EEF2FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
    },
    cardTitle: { fontSize: 18, fontWeight: 600, color: "#111827", margin: 0 },
    cardDesc: { fontSize: 14, color: "#6B7280", margin: "4px 0 0 0" },
    form: { padding: 24 },
    inputGroup: { display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 250 },
    row: { display: "flex", gap: 24, margin: "24px 0", flexWrap: "wrap" },
    label: { fontSize: 13, fontWeight: 600, color: "#374151", marginLeft: 4 },
    input: {
        padding: "14px 18px",
        borderRadius: 16,
        border: "1px solid transparent",
        fontSize: 15,
        outline: "none",
        transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
        width: "100%",
        background: "rgba(255, 255, 255, 0.6)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02), 0 0 0 1px rgba(0,0,0,0.05) inset"
    },
    passwordWrapper: { position: "relative", width: "100%" },
    eyeBtn: {
        position: "absolute",
        right: 14,
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 6,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.2s"
    },
    actions: { marginTop: 32, display: "flex", justifyContent: "flex-end" },
    button: {
        padding: "12px 24px",
        background: "#111827",
        background: "linear-gradient(135deg, #1F2937 0%, #111827 100%)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        fontWeight: 600,
        cursor: "pointer",
        fontSize: 14,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        transition: "all 0.2s"
    },
    alert: { padding: 12, borderRadius: 12, marginBottom: 24, display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 500 },
};
