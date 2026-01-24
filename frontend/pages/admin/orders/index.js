import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
    Search,
    Filter,
    ChevronRight,
    Calendar,
    MoreHorizontal,
    ArrowUpDown,
    Download
} from "lucide-react";
import { motion } from "framer-motion";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function OrderList() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/orders/admin/all`);
            const data = await res.json();
            if (data.success) {
                // Sort by newest first
                const sorted = data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sorted);
            }
        } catch (err) {
            console.error("Orders Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.phone?.includes(searchTerm);

        const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <AdminLayout>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Orders</h1>
                    <p style={styles.subtitle}>Manage and track all customer orders</p>
                </div>
                <button style={styles.exportBtn}>
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {/* FILTERS */}
            <div style={styles.controls}>
                <div style={styles.searchBox}>
                    <Search size={18} color="#6B7280" />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Name, Phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>

                <div style={styles.filterGroup}>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={styles.select}
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING_SHIPMENT">New / Pending</option>
                        <option value="PACKED">Packed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="RTO_INITIATED">RTO Initiated</option>
                    </select>
                </div>
            </div>

            {/* TABLE */}
            <div style={styles.tableCard}>
                {loading ? (
                    <div style={styles.loadingState}>Loading Orders...</div>
                ) : filteredOrders.length > 0 ? (
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thead}>
                                <th style={styles.th}>Order ID</th>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Customer</th>
                                <th style={styles.th}>Total</th>
                                <th style={styles.th}>Payment</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <motion.tr
                                    key={order._id}
                                    style={styles.tr}
                                    whileHover={{ backgroundColor: "#F9FAFB" }}
                                    onClick={() => router.push(`/admin/orders/${order.orderId}`)}
                                >
                                    <td style={styles.tdPrimary}>#{order.orderId.substring(0, 8).toUpperCase()}...</td>
                                    <td style={styles.tdSec}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Calendar size={12} />
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ fontWeight: 500 }}>{order.customer?.name}</div>
                                        <div style={{ fontSize: 12, color: '#6B7280' }}>{order.customer?.phone}</div>
                                    </td>
                                    <td style={styles.td}>₹{order.pricing?.total}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.paymentBadge,
                                            background: order.paymentMethod === 'COD' ? '#FFF7ED' : '#F3F4F6',
                                            color: order.paymentMethod === 'COD' ? '#C2410C' : '#374151'
                                        }}>
                                            {order.paymentMethod}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td style={styles.td}>
                                        <button style={styles.actionBtn}>
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={styles.emptyState}>
                        No orders found matching your filters.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

const StatusBadge = ({ status }) => {
    const getStyle = (s) => {
        switch (s) {
            case 'DELIVERED': return { bg: '#ECFDF5', color: '#059669' };
            case 'CANCELLED': return { bg: '#FEF2F2', color: '#DC2626' };
            case 'SHIPPED':
            case 'OUT_FOR_DELIVERY': return { bg: '#EFF6FF', color: '#2563EB' };
            case 'PACKED': return { bg: '#FFFBEB', color: '#D97706' };
            case 'PENDING_SHIPMENT': return { bg: '#EFF6FF', color: '#4F46E5' }; // Blue for New
            case 'RTO_INITIATED': return { bg: '#FEF2F2', color: '#DC2626' };
            default: return { bg: '#F3F4F6', color: '#4B5563' };
        }
    };

    const style = getStyle(status);

    return (
        <span style={{
            padding: "4px 10px",
            borderRadius: 50,
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            background: style.bg,
            color: style.color,
            display: 'inline-block'
        }}>
            {status?.replace(/_/g, " ")}
        </span>
    );
};

const styles = {
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 },
    title: { fontSize: 28, fontWeight: 700, color: "#111827", margin: 0, letterSpacing: '-0.5px' },
    subtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
    exportBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: "8px 16px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", cursor: "pointer", fontWeight: 500 },

    controls: { display: "flex", gap: 12, marginBottom: 24 },
    searchBox: { display: 'flex', alignItems: 'center', gap: 10, padding: "10px 16px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, flex: 1, maxWidth: 400 },
    searchInput: { border: "none", outline: "none", width: "100%", fontSize: 14 },
    select: { padding: "10px 16px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", outline: "none", fontSize: 14, cursor: 'pointer' },

    tableCard: { background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
    table: { width: "100%", borderCollapse: "collapse" },
    thead: { background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" },
    th: { padding: "12px 24px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase" },
    tr: { borderBottom: "1px solid #F3F4F6", cursor: 'pointer', transition: 'background 0.1s' },
    td: { padding: "16px 24px", fontSize: 14, color: "#111827" },
    tdPrimary: { padding: "16px 24px", fontSize: 14, color: "#4F46E5", fontWeight: 600, fontFamily: 'monospace' },
    tdSec: { padding: "16px 24px", fontSize: 13, color: "#6B7280" },

    actionBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 },
    paymentBadge: { padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 },

    loadingState: { padding: 40, textAlign: 'center', color: '#6B7280' },
    emptyState: { padding: 40, textAlign: 'center', color: '#6B7280' }
};
