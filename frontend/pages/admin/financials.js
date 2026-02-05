import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import {
    DollarSign, TrendingUp, Package, Activity,
    Calendar, Download, AlertCircle, Plus
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';

// 🎨 THEME STYLES (Dashdark X)
const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    title: { fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 },
    subtitle: { color: '#9CA3AF', fontSize: 14, marginTop: 4 },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 },

    card: { background: '#111827', borderRadius: 16, padding: 24, border: '1px solid #1F2937' },
    cardTitle: { color: '#9CA3AF', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
    cardValue: { color: '#fff', fontSize: 32, fontWeight: 700, marginTop: 8, letterSpacing: '-1px' },

    btn: {
        background: '#7C3AED', color: '#fff', border: 'none', padding: '10px 20px',
        borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
    },

    tableContainer: { background: '#111827', borderRadius: 16, border: '1px solid #1F2937', overflow: 'hidden' },
    th: { padding: '16px 24px', textAlign: 'left', color: '#9CA3AF', fontSize: 12, fontWeight: 600, borderBottom: '1px solid #1F2937' },
    td: { padding: '16px 24px', color: '#E5E7EB', fontSize: 14, borderBottom: '1px solid #1F2937' }
};

const Financials = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const API = "";

    const fetchFinancials = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API}/api/orders/admin/financial-stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setStats(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFinancials(); }, []);

    if (loading) return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
                <div className="loader">Loading Financials...</div>
            </div>
        </AdminLayout>
    );

    // Safe Accessors
    const lifetime = stats?.lifetime?.[0] || {};
    const currentMonth = stats?.currentMonth?.[0] || {};
    const lastMonth = stats?.lastMonth?.[0] || {};
    const products = stats?.products || [];
    const trend = stats?.monthlyTrend || [];

    const handleExportGST = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API}/api/orders/admin/export-gst`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `gst-report-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert("Export Failed");
            }
        } catch (err) {
            console.error("Export Error:", err);
            alert("Export Error");
        }
    };

    return (
        <AdminLayout>
            {/* HEAD */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Financial HQ</h1>
                    <p style={styles.subtitle}>Real-time Profit & Loss Analysis (Delivered Orders Only)</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={handleExportGST} style={{ ...styles.btn, background: '#1F2937' }}>
                        <Download size={18} /> Export GST Report
                    </button>
                </div>
            </div>

            {/* KEY METRICS */}
            <div style={styles.grid}>
                <MetricCard
                    label="Lifetime Revenue (Ex-Tax)"
                    value={`₹${(lifetime.taxableRevenue || 0).toLocaleString()}`}
                    sub={`₹${(lifetime.totalGST || 0).toLocaleString()} GST Collected`}
                    color="#10B981"
                />
                <MetricCard
                    label="Net Profit"
                    value={`₹${(lifetime.totalProfit || 0).toLocaleString()}`}
                    sub={`${((lifetime.totalProfit / lifetime.taxableRevenue) * 100 || 0).toFixed(1)}% Margin`}
                    color="#8B5CF6" // Violet
                />
                <MetricCard
                    label="Available Inventory Value"
                    value="₹--"
                    sub="Based on Batch Costs"
                    color="#F59E0B"
                />
            </div>

            {/* CHARTS ROW 1: TRENDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 32 }}>

                {/* 1. MONTHLY REVENUE & PROFIT */}
                <div style={styles.card}>
                    <div style={{ marginBottom: 20 }}>
                        <div style={styles.cardTitle}>Monthly Financial Trend</div>
                        <div style={styles.subtitle}>Net Profit vs Taxable Revenue</div>
                    </div>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="_id.month" stroke="#6B7280" tickFormatter={(m) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]} />
                                <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8 }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value) => [`₹${value.toLocaleString()}`, ""]}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                                <Area type="monotone" dataKey="profit" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorProf)" name="Net Profit" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. DAILY REVENUE (Current Month) */}
                <div style={styles.card}>
                    <div style={{ marginBottom: 20 }}>
                        <div style={styles.cardTitle}>Daily Revenue (This Month)</div>
                        <div style={styles.subtitle}>Day-wise Sales Performance</div>
                    </div>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.dailyTrend || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="_id.day" stroke="#6B7280" />
                                <YAxis stroke="#6B7280" tickFormatter={(v) => `₹${v / 1000}k`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8 }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* CHARTS ROW 2: SPLIT */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 32 }}>

                {/* 3. PAYMENT METHOD SPLIT */}
                <div style={styles.card}>
                    <div style={{ marginBottom: 20 }}>
                        <div style={styles.cardTitle}>Revenue Source (COD vs Online)</div>
                    </div>
                    <div style={{ height: 250, display: 'flex', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.paymentSplit || []}
                                    dataKey="revenue"
                                    nameKey="_id"
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                >
                                    {(stats?.paymentSplit || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry._id === 'COD' ? '#F59E0B' : '#8B5CF6'} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: 8 }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. ORDERS TREND (Mixed) */}
                <div style={styles.card}>
                    <div style={{ marginBottom: 20 }}>
                        <div style={styles.cardTitle}>Order Volume Trend</div>
                    </div>
                    <div style={{ height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="_id.month" stroke="#6B7280" tickFormatter={(m) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]} />
                                <YAxis stroke="#6B7280" />
                                <Tooltip contentStyle={{ background: '#1F2937', border: 'none' }} />
                                <Bar dataKey="orders" fill="#10B981" name="Orders Delivered" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* PRODUCT PERFORMANCE TABLE */}
            <div style={styles.card}>
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
                    <div style={styles.cardTitle}>Product Profitability (Batch Accurate)</div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={styles.th}>PRODUCT / VARIANT</th>
                                <th style={styles.th}>QTY SOLD</th>
                                <th style={styles.th}>REVENUE (GROSS)</th>
                                <th style={styles.th}>GST (5%)</th>
                                <th style={styles.th}>AVG COST</th>
                                <th style={styles.th}>EST. PROFIT</th>
                                <th style={styles.th}>MARGIN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p, i) => (
                                <tr key={i}>
                                    <td style={styles.td}>
                                        <div style={{ fontWeight: 500, color: '#fff' }}>{p.name}</div>
                                        <div style={{ fontSize: 12, color: '#6B7280' }}>{p._id}</div>
                                    </td>
                                    <td style={styles.td}>{p.totalQty}</td>
                                    <td style={styles.td}>₹{p.totalRevenue.toLocaleString()}</td>
                                    <td style={styles.td}><span style={{ color: '#9CA3AF' }}>₹{Math.round(p.totalRevenue - p.taxableRev)}</span></td>
                                    <td style={styles.td}><span style={{ color: '#F59E0B' }}>₹{Math.round(p.avgCost)}</span></td>
                                    <td style={styles.td}><span style={{ color: '#10B981' }}>+₹{Math.round(p.estProfit)}</span></td>
                                    <td style={styles.td}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: 4,
                                            background: p.estMargin > 20 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: p.estMargin > 20 ? '#34D399' : '#F87171',
                                            fontWeight: 600, fontSize: 12
                                        }}>
                                            {p.estMargin.toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </AdminLayout>
    );
};

const MetricCard = ({ label, value, sub, color }) => (
    <div style={styles.card}>
        <div style={styles.cardTitle}>{label}</div>
        <div style={{ ...styles.cardValue, color: color || '#fff' }}>{value}</div>
        <div style={{ ...styles.subtitle, color: '#6B7280' }}>{sub}</div>
    </div>
);

export default Financials;
