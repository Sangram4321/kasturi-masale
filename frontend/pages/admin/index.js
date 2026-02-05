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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'; // 📊 RECHARTS

const API = "";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🎛️ DASHBOARD CONTROLS
  const [selectedMetric, setSelectedMetric] = useState("delivered"); // delivered, orders, income, stock
  const [incomeTimeRange, setIncomeTimeRange] = useState("1M"); // 1M, 3M, 6M, FY, PREV
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (selectedMetric === 'stock' && inventoryStats?.chartData) {
      setChartData(inventoryStats.chartData.map(d => ({
        name: new Date(d.date).getDate(), // Just day number for compactness
        fullDate: d.date,
        in: d.stockIn,
        out: (d.stockOut_Online + d.stockOut_Offline) // Combine for simpler view
      })));
    } else if (stats?.dailyTrend) {
      // ... existing logic for other metrics if any ...
      // For now, assuming static/stats-based data for others or handled locally
    }
  }, [selectedMetric, inventoryStats, stats]);

  /* 🔐 AUTH & FETCH LOGIC */
  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (!auth) { router.replace("/admin/login"); return; }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Parallel Fetch
      const [orderRes, invRes] = await Promise.all([
        fetch(`${API}/api/orders/admin/stats?range=30d`),
        fetch(`${API}/api/batches/stats`)
      ]);

      const orderData = await orderRes.json();
      const invData = await invRes.json();

      if (orderData.success) setStats(orderData.data);
      if (invData.success) setInventoryStats(invData);

    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <AdminLayout>
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#9CA3AF' }}>Loading Neural Dashboard...</h2>
      </div>
    </AdminLayout>
  );

  const couriers = stats?.couriers || [];

  return (
    <AdminLayout>
      {/* HEADER */}
      <div style={styles.pageHeader}>
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={styles.title}
          >
            Dashboard Overview
          </motion.h1>
          <p style={styles.subtitle}>Real-time performance analytics.</p>
        </div>
        <div style={styles.controls}>
          <button style={styles.refreshBtn} onClick={fetchStats}>Refresh Data</button>
        </div>
      </div>

      {/* 🔮 MAIN INTERACTIVE GRID */}
      <div className="top-grid" style={styles.topGrid}>

        {/* LEFT: METRIC CARDS (Selectable) */}
        <div style={styles.metricColumn}>
          <InteractiveCard
            label="Delivered Revenue"
            value={`₹${stats?.revenue?.delivered?.toLocaleString() || 0}`}
            icon={CheckCircle}
            color="green"
            active={selectedMetric === 'delivered'}
            onClick={() => setSelectedMetric('delivered')}
            sub="Cash Banked"
          />
          <InteractiveCard
            label="Total Orders"
            value={stats?.orders?.total || 0}
            icon={ShoppingBag}
            color="purple"
            active={selectedMetric === 'orders'}
            onClick={() => setSelectedMetric('orders')}
          />
          <InteractiveCard
            label="Net Stock Change (Month)"
            value={inventoryStats?.monthStats?.net > 0 ? `+${inventoryStats.monthStats.net}` : inventoryStats?.monthStats?.net || 0}
            icon={Package}
            color="blue"
            active={selectedMetric === 'stock'}
            onClick={() => setSelectedMetric('stock')}
            sub={`In: ${inventoryStats?.monthStats?.in || 0}  •  Out: ${inventoryStats?.monthStats?.out || 0}`}
          />
          <InteractiveCard
            label="Total Income"
            value={`₹${stats?.revenue?.profit?.toLocaleString() || 0}`}
            icon={DollarSign}
            color="gold"
            active={selectedMetric === 'income'}
            onClick={() => setSelectedMetric('income')}
            sub="Net Profit (Calculated)"
          />
        </div>

        {/* RIGHT: FUTURISTIC CHART AREA */}
        <motion.div
          layout
          style={styles.chartContainer}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={styles.chartHeader}>
            <div>
              <h3 style={styles.chartTitle}>
                {selectedMetric === 'delivered' && "Delivered Revenue Trend"}
                {selectedMetric === 'orders' && "Order Volume Analysis"}
                {selectedMetric === 'stock' && "Stock Movement (30 Days)"}
                {selectedMetric === 'income' && "Net Income Growth"}
              </h3>
              <p style={styles.chartSubtitle}>
                {selectedMetric === 'stock' ? 'In vs Out flow' : `Performance over ${incomeTimeRange === '1M' ? 'Last Month' : incomeTimeRange}`}
              </p>
            </div>

            {/* TIME FILTERS */}
            {selectedMetric !== 'stock' && (
              <div style={styles.timeFilters}>
                {['1M', '3M', '6M', 'FY', 'PREV'].map(t => (
                  <button
                    key={t}
                    onClick={() => setIncomeTimeRange(t)}
                    style={incomeTimeRange === t ? styles.timeBtnActive : styles.timeBtn}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ height: "40vh", minHeight: 300, width: "100%", marginTop: 20 }}>
            {(!chartData || chartData.length === 0) && selectedMetric !== 'stock' ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563', flexDirection: 'column' }}>
                <TrendingUp size={48} opacity={0.2} style={{ marginBottom: 16 }} />
                No Data Available for this period
              </div>
            ) : selectedMetric === 'stock' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                  />
                  <Legend wrapperStyle={{ paddingTop: 20 }} />
                  <Bar dataKey="in" name="Stock In" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="out" name="Stock Out" fill="#EF4444" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getMetricColor(selectedMetric)} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={getMetricColor(selectedMetric)} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => selectedMetric === 'orders' ? val : `₹${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={getMetricColor(selectedMetric)}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* 🚨 ALERTS & STATUS */}
      <div className="grid-2" style={styles.grid2}>
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Order Status</h3>
          <div style={styles.statusGrid}>
            {Object.entries(stats?.statusBreakdown || {}).map(([status, count], i) => (
              <div key={status} style={styles.statusRow}>
                <span style={styles.statusName}>{status.replace(/_/g, " ")}</span>
                <span style={styles.statusCount}>{count}</span>
              </div>
            ))}
            {Object.keys(stats?.statusBreakdown || {}).length === 0 && (
              <div style={{ color: '#6B7280', fontSize: 13, textAlign: 'center', padding: 20 }}>No Orders Yet</div>
            )}
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Courier Health</h3>
          {couriers.length > 0 ? couriers.map((c, i) => (
            <div key={i} style={styles.courierRow}>
              <span style={styles.courierName}>{c.courier}</span>
              <div style={styles.courierBar}>
                <div style={{ ...styles.courierFill, width: `${c.deliveredPercent}%` }} />
              </div>
              <span style={styles.courierVal}>{c.deliveredPercent.toFixed(0)}%</span>
            </div>
          )) : (
            <div style={{ color: '#6B7280', fontSize: 13, textAlign: 'center', padding: 20 }}>No Courier Data</div>
          )}
        </div>
      </div>

      <style jsx>{`
        .top-grid {
          grid-template-columns: 1fr 2.5fr;
        }
        .grid-2 {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 1024px) {
          .top-grid {
            grid-template-columns: 1fr !important;
          }
          .grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
           .top-grid { gap: 16px; }
           .grid-2 { gap: 16px; }
        }
      `}</style>
    </AdminLayout>
  );
}

// 🎨 HELPERS
const getMetricColor = (metric) => {
  switch (metric) {
    case 'gross': return '#3B82F6'; // Blue
    case 'delivered': return '#10B981'; // Green
    case 'orders': return '#A855F7'; // Purple
    case 'income': return '#EAB308'; // Gold
    case 'stock': return '#3B82F6'; // Blue for stock default
    default: return '#3B82F6';
  }
}

// 🧩 COMPONENTS
const InteractiveCard = ({ label, value, icon: Icon, color, active, onClick, trend, sub }) => {
  const activeStyle = active ? {
    borderColor: getMetricColor(color === 'gold' ? 'income' : color === 'purple' ? 'orders' : color === 'green' ? 'delivered' : 'gross'),
    background: 'rgba(31, 41, 55, 0.6)',
    boxShadow: `0 0 20px -5px ${getMetricColor(color === 'gold' ? 'income' : color === 'purple' ? 'orders' : color === 'green' ? 'delivered' : 'gross')}30`
  } : {};

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{ ...styles.metricCard, ...activeStyle }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <p style={styles.mcLabel}>{label}</p>
          <h4 style={styles.mcValue}>{value}</h4>
          {sub && <p style={styles.mcSub}>{sub}</p>}
        </div>
        <div style={{ ...styles.iconBox, color: getMetricColor(color === 'gold' ? 'income' : color === 'purple' ? 'orders' : color === 'green' ? 'delivered' : 'gross') }}>
          <Icon size={24} />
        </div>
      </div>
      {trend && (
        <div style={styles.trendBadge}>
          <TrendingUp size={14} /> +{trend}%
        </div>
      )}
    </motion.div>
  )
}

const styles = {
  // 🌑 DASH DARK THEME VARIABLES
  pageHeader: { marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 28, fontWeight: 700, color: "#fff", margin: 0 },
  subtitle: { color: "#9CA3AF", marginTop: 4 },
  refreshBtn: { background: "#1F2937", color: "#fff", border: "1px solid #374151", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 500 },

  // 📐 LAYOUT - Responsive via CSS now
  topGrid: { display: "grid", gap: 24, marginBottom: 32 },
  metricColumn: { display: "flex", flexDirection: "column", gap: 16 },

  // 🃏 CARDS
  metricCard: {
    background: "#111827",
    padding: 20,
    borderRadius: 16,
    border: "1px solid #1F2937",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden"
  },
  mcLabel: { fontSize: 13, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 },
  mcValue: { fontSize: 28, color: "#fff", fontWeight: 700, margin: "6px 0", letterSpacing: "-0.5px" },
  mcSub: { fontSize: 12, color: "#6B7280" },
  iconBox: { background: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 12, height: 'fit-content' },
  trendBadge: { position: 'absolute', bottom: 20, right: 20, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 6 },

  // 📈 CHART AREA
  chartContainer: {
    background: "#111827",
    padding: 24,
    borderRadius: 20,
    border: "1px solid #1F2937",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.3)"
  },
  chartHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  chartTitle: { fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 },
  chartSubtitle: { fontSize: 13, color: "#9CA3AF", marginTop: 4 },
  timeFilters: { display: "flex", gap: 8, background: "#1F2937", padding: 4, borderRadius: 10 },
  timeBtn: { padding: "6px 12px", borderRadius: 8, background: "transparent", border: "none", color: "#9CA3AF", fontSize: 12, cursor: "pointer", fontWeight: 600 },
  timeBtnActive: { padding: "6px 12px", borderRadius: 8, background: "#374151", border: "none", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600, boxShadow: "0 1px 2px rgba(0,0,0,0.2)" },

  // 🧱 SECONDARY GRID
  grid2: { display: "grid", gap: 24 },
  card: { background: "#111827", padding: 24, borderRadius: 16, border: "1px solid #1F2937" },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 20, borderBottom: "1px solid #1F2937", pb: 10 },

  // STATUS LIST
  statusGrid: { display: 'flex', flexDirection: 'column', gap: 12 },
  statusRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" },
  statusName: { fontSize: 14, color: "#D1D5DB" },
  statusCount: { background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#fff" },

  // COURIER LIST
  courierRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  courierName: { width: 80, fontSize: 13, color: "#D1D5DB", fontWeight: 500 },
  courierBar: { flex: 1, height: 6, background: "#374151", borderRadius: 3 },
  courierFill: { height: '100%', background: "#10B981", borderRadius: 3 },
  courierVal: { width: 40, fontSize: 13, color: "#fff", textAlign: 'right' }
};
