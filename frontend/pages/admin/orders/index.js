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
    Download,
    RefreshCw,
    Activity,
    Clock,
    Truck,
    MapPin,
    CheckCircle,
    RotateCcw,
    XCircle,
    AlertTriangle,
    AlertCircle,
    Package // Added missing import for Package icon
} from "lucide-react";
import { motion } from "framer-motion";

const API = "";

export default function OrderList() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [refreshingIds, setRefreshingIds] = useState([]); // Track refreshing orders
    const [lastGlobalSync, setLastGlobalSync] = useState(null); // Track last global refresh

    useEffect(() => {
        fetchOrders();
    }, []);

    // ⚡ AUTO-REFRESH STALE ORDERS ON MOUNT & PERIODICALLY
    useEffect(() => {
        const checkAndRefresh = () => {
            if (orders.length > 0) {
                const staleOrders = orders.filter(o => {
                    // Refresh if active shipment AND (never synced OR older than 15 mins)
                    const activeSts = ["SHIPPED", "ON_THE_WAY", "OUT_FOR_DELIVERY", "RTO_INITIATED"];
                    if (!activeSts.includes(o.status)) return false;
                    if (!o.shipping?.awbNumber) return false;

                    const lastSync = o.shipping?.lastSync ? new Date(o.shipping.lastSync).getTime() : 0;
                    return (Date.now() - lastSync) > 15 * 60 * 1000;
                });

                if (staleOrders.length > 0) {
                    const ids = staleOrders.map(o => o.orderId);
                    console.log("Found stale orders, auto-refreshing:", ids.length);
                    bulkRefresh(ids);
                }
            }
        };

        // Run immediately on load (after orders fetch)
        checkAndRefresh();

        // Run every 10 minutes
        const interval = setInterval(checkAndRefresh, 10 * 60 * 1000);
        return () => clearInterval(interval);

    }, [orders.length]); // Re-evaluate when orders list changes

    const handleManualRefresh = () => {
        // Force refresh all active shipments
        const activeIds = orders
            .filter(o => o.shipping?.awbNumber && ["SHIPPED", "ON_THE_WAY", "OUT_FOR_DELIVERY"].includes(o.status))
            .map(o => o.orderId);

        if (activeIds.length > 0) {
            bulkRefresh(activeIds);
        } else {
            fetchOrders(); // Just reload DB if no active shipments
        }
    };

    const bulkRefresh = async (ids) => {
        setRefreshingIds(prev => [...prev, ...ids]);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API}/api/orders/admin/orders/refresh-tracking`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderIds: ids }),
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                // Determine which statuses changed (if any)
                // For simplicity, just re-fetch the list to be clean.
                setLastGlobalSync(new Date());
                fetchOrders();
            }
        } catch (err) {
            console.error("Auto Refresh Failed:", err);
        } finally {
            setRefreshingIds(prev => prev.filter(id => !ids.includes(id)));
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API}/api/orders/admin/all?t=${Date.now()}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                console.log("Admin Orders Fetched:", data.orders.length);

                // DEBUG: Check reception
                const found = data.orders.find(o => o.orderId === "KASTURI-AA462ADB");
                if (found) console.log("✅ [FRONTEND] API Response INCLUDES Target Order");
                else console.warn("❌ [FRONTEND] API Response MISSING Target Order");

                // Sort by newest first
                const sorted = data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sorted);
            } else {
                console.error("Fetch Failed Logic:", data);
                if (data.message === "Not authorized" || data.message.includes("session")) {
                    alert("Session expired. Please login again.");
                    router.push("/admin/login");
                } else {
                    alert("Failed to load orders: " + data.message);
                }
            }
        } catch (err) {
            console.error("Orders Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (!filteredOrders.length) return alert("No orders to export.");

        const headers = ["Order ID", "Date", "Customer Name", "Phone", "Amount", "Payment", "Status", "Courier", "AWB"];

        const rows = filteredOrders.map(o => [
            o.orderId,
            new Date(o.createdAt).toLocaleDateString(),
            `"${o.customer?.name || ''}"`, // Quote strings
            o.customer?.phone || '',
            o.pricing?.total || 0,
            o.paymentMethod,
            o.status,
            o.shipping?.courierName || '',
            o.shipping?.awbNumber || ''
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        const orderId = order.orderId || "";
        const matchesSearch =
            orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.phone?.includes(searchTerm);

        const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

        // DEBUG: Specific Order Check
        if (orderId === "KASTURI-AA462ADB") {
            console.log(`🔍 [FRONTEND] Filtering Target: SearchMatch=${matchesSearch}, StatusMatch=${matchesStatus} (${order.status} vs ${statusFilter})`);
        }

        return matchesSearch && matchesStatus;
    });

    return (
        <AdminLayout>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Orders</h1>
                    <p style={styles.subtitle}>Manage and track all customer orders</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    {lastGlobalSync && (
                        <div style={{ fontSize: 12, color: '#6B7280', alignSelf: 'center' }}>
                            Last Synced: {lastGlobalSync.toLocaleTimeString()}
                        </div>
                    )}
                    <button onClick={handleManualRefresh} style={styles.exportBtn}>
                        <RefreshCw size={16} /> Sync Live Status
                    </button>
                    <button onClick={handleExportCSV} style={styles.exportBtn}>
                        <Download size={16} /> Export CSV
                    </button>
                </div>
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
                <div style={{ overflowX: 'auto' }}>
                    {loading ? (
                        <div style={styles.loadingState}>Loading Orders...</div>
                    ) : filteredOrders.length > 0 ? (
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thead}>
                                    <th style={styles.th}>Order ID</th>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>Customer</th>
                                    <th style={styles.th}>Amount</th>
                                    <th style={styles.th}>Payment</th>
                                    <th style={styles.th}>Track</th>
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
                                        <td style={styles.tdPrimary}>#{order.orderId ? order.orderId.substring(0, 8).toUpperCase() : 'N/A'}...</td>
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
                                            {/* Tracking Info */}
                                            {order.shipping?.awbNumber ? (
                                                <div>
                                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                                                        {order.shipping.courierName || "Courier"}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: '#6B7280', fontFamily: 'monospace' }}>
                                                        {order.shipping.awbNumber}
                                                    </div>
                                                    <div style={{ fontSize: 10, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                        {refreshingIds.includes(order.orderId) ? (
                                                            <RefreshCw size={10} className="spin" />
                                                        ) : (
                                                            <Activity size={10} color={order.shipping.lastSync ? "#10B981" : "#D1D5DB"} />
                                                        )}
                                                        {refreshingIds.includes(order.orderId) ? "Syncing..." : "Live"}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: 12, color: '#D1D5DB' }}>-</span>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            <LiveStatusBadge
                                                status={order.status}
                                                shippingStatus={order.shipping?.shipmentStatus}
                                                lastSync={order.shipping?.lastSync}
                                            />
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
            </div>
        </AdminLayout>
    );
}

const LiveStatusBadge = ({ status, shippingStatus, lastSync }) => {
    // 1. Determine Display Status & Color & Icon
    let label = status?.replace(/_/g, " ");
    let color = { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' }; // Default Gray
    let Icon = Clock; // Default

    // Priority: RTO/Cancelled > Delivered > Courier Status > Internal Status

    if (status === 'CANCELLED') {
        color = { bg: '#F3F4F6', color: '#9CA3AF', border: '#E5E7EB' }; // Grey for Cancelled
        Icon = XCircle;
    }
    else if (status === 'RTO_DELIVERED') {
        color = { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' }; // Red
        Icon = RotateCcw;
        label = "RTO";
    }
    else if (status === 'DELIVERED') {
        color = { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' }; // Green
        Icon = CheckCircle;
    }
    else if (shippingStatus) {
        // Map iThink Statuses
        const s = shippingStatus.toLowerCase();

        if (s.includes('delivered')) {
            label = "DELIVERED";
            color = { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' }; // Green
            Icon = CheckCircle;
        }
        else if (s.includes('out for delivery')) {
            label = "OFD"; // Abbreviation
            color = { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' }; // Orange
            Icon = MapPin;
        }
        else if (s.includes('transit') || s.includes('shipped') || s.includes('dispatched')) {
            label = "SHIPPED"; // Normalized
            color = { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' }; // Blue
            Icon = Truck;
        }
        else if (s.includes('pending') || s.includes('manifest') || s.includes('pickup')) {
            label = "PENDING";
            color = { bg: '#FEF9C3', color: '#CA8A04', border: '#FDE047' }; // Yellow
            Icon = Clock;
        }
        else if (s.includes('rto') || s.includes('undelivered') || s.includes('returned')) {
            label = "RTO";
            color = { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' }; // Red
            Icon = RotateCcw;
        }
        else {
            // Fallback
            label = shippingStatus;
            color = { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' };
            Icon = AlertCircle;
        }
    }
    else {
        // Internal Fallback
        if (status === 'SHIPPED') { color = { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' }; Icon = Truck; }
        if (status === 'PACKED') { color = { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' }; Icon = Package; label = "PACKED"; }
        if (status === 'PENDING_SHIPMENT') { color = { bg: '#FEF9C3', color: '#CA8A04', border: '#FDE047' }; Icon = Clock; label = "PENDING"; }
        if (status === 'RTO_INITIATED') { color = { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' }; Icon = RotateCcw; label = "RTO"; }
    }

    if (!Icon) Icon = Clock;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
            <span style={{
                padding: "4px 8px",
                paddingLeft: 6,
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                background: color.bg,
                color: color.color,
                border: `1px solid ${color.border}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap'
            }}>
                <Icon size={12} strokeWidth={2.5} />
                {label}
            </span>
            {lastSync && shippingStatus && (
                <span style={{ fontSize: 9, color: '#9CA3AF', marginLeft: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Activity size={8} /> {new Date(lastSync).getHours()}:{String(new Date(lastSync).getMinutes()).padStart(2, '0')}
                </span>
            )}
        </div>
    );
};

const styles = {
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 },
    title: { fontSize: 28, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: '-0.5px' },
    subtitle: { fontSize: 14, color: "#9CA3AF", marginTop: 4 },
    exportBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: "8px 16px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", cursor: "pointer", fontWeight: 500 },

    controls: { display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" },
    searchBox: { display: 'flex', alignItems: 'center', gap: 10, padding: "10px 16px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, flex: 1, minWidth: 280 },
    searchInput: { border: "none", outline: "none", width: "100%", fontSize: 14 },
    select: { padding: "10px 16px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", outline: "none", fontSize: 14, cursor: 'pointer' },

    tableCard: { background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
    table: { width: "100%", minWidth: 900, borderCollapse: "collapse" },
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
