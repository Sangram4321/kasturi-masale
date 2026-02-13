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
  Truck,
  RotateCcw,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

/* ✅ FIX 1 — correct API base */
const API = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedMetric, setSelectedMetric] = useState("delivered");
  const [incomeTimeRange, setIncomeTimeRange] = useState("1M");
  const [chartData, setChartData] = useState([]);

  /* ================= CHART BUILD ================= */
  useEffect(() => {
    if (selectedMetric === 'stock' && inventoryStats?.chartData) {
      setChartData(inventoryStats.chartData.map(d => ({
        name: new Date(d.date).getDate(),
        fullDate: d.date,
        in: d.stockIn,
        out: (d.stockOut_Online + d.stockOut_Offline)
      })));
    }
  }, [selectedMetric, inventoryStats]);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      localStorage.clear();
      router.replace("/admin/login");
      return;
    }

    fetchStats();
  }, []);


  /* ================= FETCH ================= */
  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        localStorage.clear();
        router.replace("/admin/login");
        return;
      }


      const [orderRes, invRes] = await Promise.all([
        fetch(`${API}/api/orders/admin/stats?range=30d`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API}/api/batches/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      /* ✅ FIX 2 — auto logout on 401 */
      if (orderRes.status === 401 || invRes.status === 401) {
        localStorage.clear();
        router.replace("/admin/login");
        return;
      }

      /* ✅ FIX 3 — crash protection */
      if (!orderRes.ok || !invRes.ok) {
        throw new Error("API request failed");
      }

      const orderData = await orderRes.json();
      const invData = await invRes.json();

      if (orderData.success) setStats(orderData.data);
      if (invData.success) setInventoryStats(invData);

    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) return (
    <AdminLayout>
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#9CA3AF' }}>Loading Neural Dashboard...</h2>
      </div>
    </AdminLayout>
  );

  const couriers = stats?.couriers || [];

  /* ================= UI ================= */
  return (
    <AdminLayout>
      <div style={styles.pageHeader}>
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={styles.title}>
            Dashboard Overview
          </motion.h1>
          <p style={styles.subtitle}>Real-time performance analytics.</p>
        </div>
        <div style={styles.controls}>
          <button style={styles.refreshBtn} onClick={fetchStats}>Refresh Data</button>
        </div>
      </div>

      <div className="top-grid" style={styles.topGrid}>

        <div style={styles.metricColumn}>
          <InteractiveCard
            label="Delivered Revenue"
            value={`₹${stats?.revenue?.delivered?.toLocaleString() || 0}`}
            icon={CheckCircle}
            active={selectedMetric === 'delivered'}
            onClick={() => setSelectedMetric('delivered')}
          />
          <InteractiveCard
            label="Total Orders"
            value={stats?.orders?.total || 0}
            icon={ShoppingBag}
            active={selectedMetric === 'orders'}
            onClick={() => setSelectedMetric('orders')}
          />
          <InteractiveCard
            label="Net Stock Change (Month)"
            value={inventoryStats?.monthStats?.net || 0}
            icon={Package}
            active={selectedMetric === 'stock'}
            onClick={() => setSelectedMetric('stock')}
          />
          <InteractiveCard
            label="Total Income"
            value={`₹${stats?.revenue?.profit?.toLocaleString() || 0}`}
            icon={DollarSign}
            active={selectedMetric === 'income'}
            onClick={() => setSelectedMetric('income')}
          />
        </div>

        <motion.div layout style={styles.chartContainer}>
          <div style={{ height: "40vh", minHeight: 300, width: "100%", marginTop: 20 }}>
            {selectedMetric === 'stock' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="in" stackId="a" />
                  <Bar dataKey="out" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

/* ================= COMPONENT ================= */

const InteractiveCard = ({ label, value, icon: Icon, active, onClick }) => (
  <div onClick={onClick} style={{ ...styles.metricCard, ...(active && styles.metricActive) }}>
    <p style={styles.mcLabel}>{label}</p>
    <h4 style={styles.mcValue}>{value}</h4>
    <Icon size={22} />
  </div>
);

/* ================= STYLES ================= */

const styles = {
  pageHeader: { marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 28, fontWeight: 700, color: "#fff", margin: 0 },
  subtitle: { color: "#9CA3AF", marginTop: 4 },
  refreshBtn: { background: "#1F2937", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer" },

  topGrid: { display: "grid", gap: 24, marginBottom: 32, gridTemplateColumns: "1fr 2fr" },
  metricColumn: { display: "flex", flexDirection: "column", gap: 16 },

  metricCard: { background: "#111827", padding: 20, borderRadius: 16, cursor: "pointer" },
  metricActive: { outline: "2px solid #10B981" },

  mcLabel: { fontSize: 13, color: "#9CA3AF" },
  mcValue: { fontSize: 28, color: "#fff" },

  chartContainer: { background: "#111827", padding: 24, borderRadius: 20 }
};
