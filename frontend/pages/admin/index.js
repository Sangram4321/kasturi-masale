import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  Clock,
  Package,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Copy,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FADE_IN_UP, STAGGER_CONTAINER, MODAL_VARIANTS } from "../../utils/motion";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminDashboard() {
  const getDaysAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days === 0 ? "Today" : `${days}d ago`;
  };

  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d"); // today, 7d, 30d

  /* 🔐 PASSWORD CHANGE ENFORCEMENT */
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [pwdData, setPwdData] = useState({ new: "", confirm: "" });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showModalPasswords, setShowModalPasswords] = useState({ new: false, confirm: false });

  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [otp, setOtp] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);

  /* 🔒 ADMIN AUTH GUARD & 2FA ENFORCEMENT */
  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    const userStr = localStorage.getItem("admin_user");
    const time = localStorage.getItem("admin_auth_time");

    if (!auth || !time || (Date.now() - Number(time) > 24 * 60 * 60 * 1000)) {
      router.replace("/admin/login");
      return;
    }

    if (userStr) {
      const user = JSON.parse(userStr);

      // 1. Check Password Change First
      if (user.isPasswordChangeRequired) {
        setShowPasswordChange(true);
        return; // Stop here, don't show 2FA yet
      }

      // 2. Check 2FA
      if (!user.isTwoFactorEnabled) {
        setShow2FASetup(true);
        initiate2FASetup();
      }
    }
  }, []);

  /* 📊 FETCH DASHBOARD STATS */
  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/orders/admin/stats?range=${range}`, {
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Stats Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showPasswordChange) { // Only fetch if not stuck on password change
      fetchStats();
      // Real-time refresh every 60s
      const interval = setInterval(fetchStats, 60000);
      return () => clearInterval(interval);
    }
  }, [range, showPasswordChange]);

  const initiate2FASetup = async () => {
    try {
      const res = await fetch(`${API}/api/admin/setup-2fa`, {
        headers: { "Content-Type": "application/json" }, // Auth handled by cookie
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setQrData(data);
      }
    } catch (err) {
      console.error("2FA Setup Error:", err);
    }
  };

  const verifyAndEnable2FA = async () => {
    setSetupLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: otp })
      });
      const data = await res.json();
      if (data.success) {
        alert("2FA Secured! Please login again.");
        // Logout to force re-login with 2FA
        localStorage.removeItem("admin_auth");
        router.replace("/admin/login");
      } else {
        alert("Invalid Code. Please try again.");
      }
    } catch (err) {
      alert("Verification failed.");
    } finally {
      setSetupLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (pwdData.new !== pwdData.confirm) {
      alert("Passwords do not match");
      return;
    }
    if (pwdData.new.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    setPwdLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        },
        credentials: "include",
        body: JSON.stringify({ newPassword: pwdData.new })
      });
      const data = await res.json();
      if (data.success) {
        alert("Password Updated! Please login with your new password.");
        localStorage.removeItem("admin_auth");
        router.replace("/admin/login");
      } else {
        alert(data.message || "Update Failed");
      }
    } catch (err) {
      alert("Error updating password");
    } finally {
      setPwdLoading(false);
    }
  };

  if (!stats && loading && !show2FASetup && !showPasswordChange) return (
    <AdminLayout>
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#6B7280' }}>Loading Dashboard...</h2>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      {/* HEADER CONTROLS */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>Dashboard Overview</h1>
          <p style={styles.subtitle}>Welcome back, here's what's happening today.</p>
        </div>
        <div style={styles.controls}>
          <select style={styles.select} value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button onClick={fetchStats} style={styles.refreshBtn}>
            Refresh
          </button>
        </div>
      </div>

      {/* 💵 REVENUE METRICS */}
      <motion.div
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
        style={styles.grid}
      >
        <StatCard
          label="Gross Revenue"
          value={`₹${stats?.revenue?.gross?.toLocaleString() || 0}`}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          label="Delivered Revenue"
          value={`₹${stats?.revenue?.delivered?.toLocaleString() || 0}`}
          icon={CheckCircle}
          color="green"
          sub={stats?.revenue?.delivered === 0 ? "No delivered orders" : "Cash Banked"}
          trend={stats?.revenue?.trend}
        />
        <StatCard
          label="COD Pending"
          value={`₹${stats?.revenue?.codPending?.toLocaleString() || 0}`}
          icon={Clock}
          color="orange"
          sub="Risk Amount"
          meta={stats?.codMeta?.count > 0 ? `${stats.codMeta.count} Orders • Oldest: ${getDaysAgo(stats.codMeta.oldest)}` : "No pending COD"}
        />
        <StatCard
          label="Active Orders"
          value={stats?.orders?.active || 0}
          icon={Package}
          color="indigo"
          sub="Processing / In Transit"
        />
      </motion.div>

      {/* ⚠️ RISK & HEALTH */}
      <motion.div
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
        style={{ ...styles.grid, marginTop: 24, gridTemplateColumns: "1fr 1fr" }}
      >
        <StatCard
          label="Total Orders"
          value={stats?.orders?.total || 0}
          icon={ShoppingBag}
          color="gray"
        />
        <RtoCard stats={stats} />
      </motion.div>

      {/* 📊 STATUS BREAKDOWN */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{ marginTop: 40 }}
      >
        <h2 style={styles.sectionTitle}>Order Status Breakdown</h2>
        <div style={styles.statusGrid}>
          {Object.entries(stats?.statusBreakdown || {}).map(([status, count], i) => (
            <motion.div
              key={status}
              style={styles.statusPill}
              whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
            >
              <span style={styles.statusName}>{status.replace(/_/g, " ")}</span>
              <span style={styles.statusCount}>{count}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 🕒 RECENT ORDERS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{ marginTop: 40 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Recent Activity</h2>
          <button onClick={() => router.push('/admin/orders')} style={styles.viewAllBtn}>
            View All Orders <ArrowRight size={16} />
          </button>
        </div>

        {stats?.recent?.length > 0 ? (
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Order ID</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Time</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent?.map((o, i) => (
                  <tr
                    key={o.orderId}
                    style={{ ...styles.tr, cursor: "pointer" }}
                    className="hover:bg-gray-50"
                    onClick={() => router.push(`/admin/orders/${o.orderId}`)}
                  >
                    <td
                      style={{ ...styles.td, color: "#4F46E5", fontWeight: 600 }}
                    >
                      #{o.orderId.slice(-6).toUpperCase()}
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{o.customer?.name}</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>{o.customer?.phone}</div>
                    </td>
                    <td style={styles.td}>₹{o.pricing?.total}</td>
                    <td style={styles.td}>
                      <StatusBadge status={o.status} />
                    </td>
                    <td style={styles.td}>{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ ...styles.kpibox, textAlign: 'center', padding: 40, color: '#6B7280' }}>
            No recent orders found.
          </div>
        )}
      </motion.div>

      {/* 🛡️ MANDATORY 2FA SETUP MODAL */}
      <AnimatePresence>
        {show2FASetup && qrData && !showPasswordChange && (
          <div style={styles.modalOverlay}>
            <motion.div
              variants={MODAL_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ ...styles.modalBox, textAlign: 'center' }}
            >
              <div style={{ margin: '0 auto 16px', background: '#ECFDF5', padding: 12, borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={32} color="#059669" />
              </div>
              <h3 style={styles.modalTitle}>Secure Your Account</h3>
              <p style={styles.modalDesc}>
                Mandatory Security Update: Please set up Google Authenticator to continue accessing the dashboard.
              </p>

              <div style={{ background: '#F9FAFB', padding: 20, borderRadius: 12, margin: '20px 0' }}>
                {qrData.qrCode ? (
                  <img src={qrData.qrCode} alt="2FA QR" style={{ width: 160, height: 160, margin: '0 auto' }} />
                ) : (
                  <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading QR...</div>
                )}
                <div style={{ marginTop: 16, fontSize: 13, color: '#4B5563', fontFamily: 'monospace', background: '#fff', padding: 8, borderRadius: 6, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {qrData.secret}
                  <Copy size={12} style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(qrData.secret)} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={styles.inputLabel}>Enter 6-digit Code from App</label>
                <input
                  type="text"
                  placeholder="000 000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  style={{ ...styles.select, textAlign: 'center', fontSize: 18, letterSpacing: 4 }}
                />
              </div>

              <button
                onClick={verifyAndEnable2FA}
                disabled={otp.length !== 6 || setupLoading}
                style={{ ...styles.refreshBtn, width: '100%', padding: 14 }}
              >
                {setupLoading ? "Verifying..." : "Verify & Enable 2FA"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔐 PASSWORD CHANGE MODAL */}
      <AnimatePresence>
        {showPasswordChange && (
          <div style={styles.modalOverlay}>
            <motion.div
              variants={MODAL_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ ...styles.modalBox, textAlign: 'center' }}
            >
              <div style={{ margin: '0 auto 16px', background: '#FEF2F2', padding: 12, borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={32} color="#DC2626" />
              </div>
              <h3 style={styles.modalTitle}>Change Password Required</h3>
              <p style={styles.modalDesc}>
                For your security, you must change the default password before continuing.
              </p>

              <div style={{ marginBottom: 16, textAlign: 'left' }}>
                <label style={styles.inputLabel}>New Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showModalPasswords.new ? "text" : "password"}
                    style={{ ...styles.select, width: '100%', paddingRight: 40 }}
                    placeholder="Min 8 characters"
                    value={pwdData.new}
                    onChange={e => setPwdData({ ...pwdData, new: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPasswords({ ...showModalPasswords, new: !showModalPasswords.new })}
                    style={styles.eyeBtn}
                  >
                    {showModalPasswords.new ? <EyeOff size={18} color="#6B7280" /> : <Eye size={18} color="#6B7280" />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 24, textAlign: 'left' }}>
                <label style={styles.inputLabel}>Confirm New Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showModalPasswords.confirm ? "text" : "password"}
                    style={{ ...styles.select, width: '100%', paddingRight: 40 }}
                    placeholder="Re-enter password"
                    value={pwdData.confirm}
                    onChange={e => setPwdData({ ...pwdData, confirm: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPasswords({ ...showModalPasswords, confirm: !showModalPasswords.confirm })}
                    style={styles.eyeBtn}
                  >
                    {showModalPasswords.confirm ? <EyeOff size={18} color="#6B7280" /> : <Eye size={18} color="#6B7280" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={pwdLoading}
                style={{ ...styles.refreshBtn, width: '100%', padding: 14, background: '#DC2626' }}
              >
                {pwdLoading ? "Updating..." : "Update Password"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

/* --- COMPONENTS --- */

const StatCard = ({ label, value, icon: Icon, color, sub, trend, meta }) => {
  const colors = {
    blue: { bg: '#EFF6FF', text: '#3B82F6' },
    green: { bg: '#ECFDF5', text: '#10B981' },
    orange: { bg: '#FFF7ED', text: '#F59E0B' },
    indigo: { bg: '#EEF2FF', text: '#6366F1' },
    gray: { bg: '#F3F4F6', text: '#6B7280' },
  };

  const theme = colors[color] || colors.gray;

  return (
    <motion.div
      variants={FADE_IN_UP}
      style={styles.kpibox}
      whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={styles.kpiLabel}>{label}</div>
          <div style={{ ...styles.kpiValue }}>{value}</div>
        </div>
        <div style={{
          padding: 10,
          borderRadius: 12,
          background: theme.bg,
          color: theme.text
        }}>
          <Icon size={24} />
        </div>
      </div>

      {/* Subtext or Trend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        {sub && <div style={styles.kpiSub}>{sub}</div>}

        {trend !== undefined && trend !== null && (
          <div style={{
            ...styles.badge,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: Number(trend) >= 0 ? '#ECFDF5' : '#FEF2F2',
            color: Number(trend) >= 0 ? '#059669' : '#DC2626',
          }}>
            {Number(trend) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(Number(trend))}%
          </div>
        )}
      </div>

      {meta && (
        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 12, borderTop: '1px solid #F3F4F6', paddingTop: 8 }}>
          {meta}
        </div>
      )}
    </motion.div>
  );
};

const RtoCard = ({ stats }) => (
  <motion.div
    variants={FADE_IN_UP}
    style={styles.kpibox}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={styles.kpiLabel}>RTO Rate</div>
      <div style={{ padding: 10, borderRadius: 12, background: '#FEF2F2', color: '#EF4444' }}>
        <AlertCircle size={24} />
      </div>
    </div>

    <div style={{
      ...styles.kpiValue,
      color: stats?.orders?.rtoRate > 15 ? "#DC2626" : "#059669"
    }}>
      {(!stats?.orders?.shipped || stats.orders.shipped === 0) ? "0%" : `${stats.orders.rtoRate}%`}
    </div>

    <div style={styles.kpiSub}>
      {(!stats?.orders?.shipped || stats.orders.shipped === 0)
        ? "No shipped orders to calculate RTO"
        : `${stats?.orders?.rto} RTOs out of ${stats?.orders?.shipped} Shipped`}
    </div>
  </motion.div>
);

const StatusBadge = ({ status }) => {
  const getStyle = (s) => {
    switch (s) {
      case 'DELIVERED': return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' };
      case 'CANCELLED': return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' };
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY': return { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' };
      case 'PACKED': return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' };
      default: return { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' };
    }
  };

  const style = getStyle(status);

  return (
    <span style={{
      ...styles.badge,
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      fontSize: 11
    }}>
      {status}
    </span>
  );
};

/* --- STYLES --- */
const styles = {
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 },
  title: { fontSize: 24, fontWeight: 700, color: "#111827", margin: 0, letterSpacing: '-0.02em' },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  controls: { display: "flex", gap: 12 },
  select: {
    padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.6)", fontWeight: 500, fontSize: 14, outline: 'none',
    boxShadow: "0 1px 2px rgba(0,0,0,0.02), 0 0 0 1px rgba(255,255,255,0.2) inset", transition: "all 0.2s"
  },
  refreshBtn: {
    padding: "10px 16px", borderRadius: 12, border: "none", background: "#111827", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", transition: "all 0.2s"
  },
  viewAllBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#4F46E5', fontWeight: 600, cursor: 'pointer', fontSize: 14 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 },
  kpibox: {
    background: "rgba(255, 255, 255, 0.7)", padding: 24, borderRadius: 24,
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid rgba(255, 255, 255, 0.6)", backdropFilter: "blur(12px)"
  },
  kpiLabel: { fontSize: 12, color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" },
  kpiValue: { fontSize: 32, fontWeight: 700, marginTop: 4, letterSpacing: "-1px", color: '#111827' },
  kpiSub: { fontSize: 13, color: "#6B7280", fontWeight: 500 },

  sectionTitle: { fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 16 },
  statusGrid: { display: "flex", flexWrap: "wrap", gap: 12 },
  statusPill: {
    background: "rgba(255,255,255,0.6)", padding: "10px 16px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 10,
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)", cursor: 'default', backdropFilter: "blur(4px)"
  },
  statusName: { fontSize: 13, fontWeight: 600, color: "#374151" },
  statusCount: { background: "rgba(0,0,0,0.05)", padding: "2px 8px", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#111827" },

  tableCard: {
    background: "rgba(255,255,255,0.7)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.5)", overflow: "hidden",
    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)", backdropFilter: "blur(8px)"
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "rgba(249, 250, 251, 0.6)", borderBottom: "1px solid rgba(0,0,0,0.03)" },
  th: { padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: '0.5px' },
  tr: { borderBottom: "1px solid rgba(0,0,0,0.03)", transition: 'background 0.2s' },
  td: { padding: "16px 24px", fontSize: 14, color: "#111827", fontWeight: 500 },
  badge: { padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: '0.05em', boxShadow: "0 1px 2px rgba(0,0,0,0.02)" },

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalBox: {
    background: 'rgba(255,255,255,0.9)', padding: 40, borderRadius: 32, width: 440, maxWidth: '90%',
    boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255,255,255,0.5) inset', border: '1px solid rgba(255,255,255,0.5)'
  },
  modalTitle: { fontSize: 24, fontWeight: 800, marginBottom: 8, color: '#111827', letterSpacing: '-0.02em' },
  modalDesc: { fontSize: 15, color: '#6B7280', marginBottom: 24, lineHeight: 1.5 },
  inputLabel: { display: 'block', marginBottom: 12, fontWeight: 600, fontSize: 14, color: '#374151', textAlign: 'left' },
  passwordWrapper: { position: "relative", width: "100%" },
  eyeBtn: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: '50%' },

};
