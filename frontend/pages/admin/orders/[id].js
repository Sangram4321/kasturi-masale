import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
    ChevronLeft,
    Printer,
    Download,
    Ban,
    Undo2,
    Package,
    Truck,
    User,
    MapPin,
    CreditCard,
    Clock,
    Phone,
    AlertCircle,
    RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MODAL_VARIANTS } from "../../../utils/motion";

const API = "";

export default function OrderDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [modal, setModal] = useState({ type: null, open: false }); // type: 'CANCEL' | 'RTO'
    const [reason, setReason] = useState("");

    useEffect(() => {
        if (!id) return;
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            // Try fetching single order first
            const resSingle = await fetch(`${API}/api/orders/admin/${id}`, {
                headers,
                credentials: "include"
            });
            if (resSingle.ok) {
                const data = await resSingle.json();
                if (data.success) setOrder(data.order);
            } else {
                // Fallback
                const resAll = await fetch(`${API}/api/orders/admin/all`, {
                    headers,
                    credentials: "include"
                });
                const d = await resAll.json();
                const found = d.orders?.find(o => o.orderId === id || o._id === id);
                setOrder(found);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        if (!order?.orderId) return;
        setRefreshing(true);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API}/api/orders/admin/orders/refresh-tracking`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderIds: [order.orderId] }),
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                fetchOrder(); // Reload data
            } else {
                alert("Tracking refresh failed");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleAction = async () => {
        if (!reason && modal.type === 'RTO') return alert("Reason is mandatory for RTO");

        setActionLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const endpoint = modal.type === 'CANCEL' ? 'cancel' : 'rto';
            const res = await fetch(`${API}/api/orders/admin/${order._id}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: "include",
                body: JSON.stringify({ reason })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                setModal({ type: null, open: false });
                setReason("");
                fetchOrder(); // Refresh
            } else {
                alert(data.message || "Action failed");
            }
        } catch (err) {
            console.error(err);
            alert("Network Error");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <AdminLayout>
            <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h2 style={{ color: '#6B7280' }}>Loading Order Details...</h2>
            </div>
        </AdminLayout>
    );

    if (!order) return (
        <AdminLayout>
            <div style={{ padding: 40, textAlign: 'center' }}>
                <h2>Order not found</h2>
                <button onClick={() => router.push("/admin/orders")} style={styles.btnSec}>
                    Back to Orders
                </button>
            </div>
        </AdminLayout>
    );

    // Timeline Logic: Sort by timestamp
    const logs = order.shipping?.logs?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) || [];

    const canCancel = ["PENDING_SHIPMENT", "PACKED"].includes(order.status);
    const canRTO = ["SHIPPED", "ON_THE_WAY", "OUT_FOR_DELIVERY"].includes(order.status);

    return (
        <AdminLayout>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* HEADER */}
                <header style={styles.header} className="admin-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button onClick={() => router.push("/admin/orders")} style={styles.backBtn}>
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <h1 style={styles.title}>Order #{order.orderId}</h1>
                                <StatusBadge status={order.status} />
                            </div>
                            <div style={styles.meta}>
                                Placed on {new Date(order.createdAt).toLocaleString()}
                                {order.shipping?.lastSync && (
                                    <span style={{ marginLeft: 8, color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        • Live Synced {Math.floor((Date.now() - new Date(order.shipping.lastSync).getTime()) / 60000)}m ago
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={styles.actions} className="admin-actions">
                        {/* UPDATE ACTION BUTTONS */}
                        {order.shipping?.awbNumber && (
                            <button onClick={handleRefresh} disabled={refreshing} style={styles.btnSec}>
                                <RefreshCw size={16} className={refreshing ? "spin" : ""} />
                                {refreshing ? "Syncing..." : "Refresh"}
                            </button>
                        )}

                        {canCancel && (
                            <button onClick={() => setModal({ type: 'CANCEL', open: true })} style={styles.btnDanger}>
                                <Ban size={16} /> Cancel Order
                            </button>
                        )}
                        {canRTO && (
                            <button onClick={() => setModal({ type: 'RTO', open: true })} style={styles.btnWarning}>
                                <Undo2 size={16} /> Initiate RTO
                            </button>
                        )}

                        <button onClick={() => window.open(`/admin/orders/${order.orderId}/invoice`, '_blank')} style={styles.btnSec}>
                            <Printer size={16} /> Invoice
                        </button>
                        {order.shipping?.labelUrl && (
                            <button onClick={() => window.open(order.shipping.labelUrl, '_blank')} style={styles.btnMain}>
                                <Download size={16} /> Shipping Label
                            </button>
                        )}
                    </div>
                </header>

                {/* ALERTS */}
                {order.status === 'CANCELLED' && (
                    <div style={styles.errorBanner}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <AlertCircle size={20} />
                            <div>
                                <b>Order Cancelled</b>
                                <div style={{ fontSize: 13, marginTop: 4 }}>
                                    By {order.cancellation?.cancelledBy} on {new Date(order.cancellation?.cancelledAt).toLocaleString()}
                                    <br />Reason: {order.cancellation?.reason || "N/A"}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {order.status === 'RTO_INITIATED' && (
                    <div style={styles.warningBanner}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Undo2 size={20} />
                            <div>
                                <b>RTO Initiated</b>
                                <div style={{ fontSize: 13, marginTop: 4 }}>
                                    Reason: {order.rto?.reason}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={styles.grid} className="admin-grid">
                    {/* LEFT COLUMN */}
                    <div style={styles.col}>
                        {/* ORDER ITEMS */}
                        <section style={styles.card} className="admin-card">
                            <h3 style={styles.cardTitle}>
                                <Package size={18} style={{ color: '#6B7280' }} /> Order Items
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {order.items.map((item, i) => (
                                    <div key={i} style={styles.itemRow}>
                                        <div style={{ flex: 1 }}>
                                            <div style={styles.itemName}>{item.variant}</div>
                                            <div style={styles.itemMeta}>Qty: {item.quantity} × ₹{item.price}</div>
                                        </div>
                                        <div style={styles.itemTotal}>₹{item.quantity * item.price}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={styles.divider} />

                            <div style={styles.pricingRow}>
                                <span>Subtotal</span>
                                <span>₹{order.pricing.subtotal}</span>
                            </div>
                            <div style={styles.pricingRow}>
                                <span>Discount</span>
                                <span style={{ color: '#059669' }}>- ₹{order.pricing.discount}</span>
                            </div>
                            <div style={styles.pricingRow}>
                                <span>COD Fee</span>
                                <span>+ ₹{order.pricing.codFee}</span>
                            </div>
                            <div style={styles.totalRow}>
                                <span>Total Amount</span>
                                <span>₹{order.pricing.total}</span>
                            </div>
                        </section>

                        {/* CUSTOMER DETAILS */}
                        <section style={styles.card} className="admin-card">
                            <h3 style={styles.cardTitle}>
                                <User size={18} style={{ color: '#6B7280' }} /> Customer Details
                            </h3>
                            <div style={styles.detailGrid}>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailLabel}>Name</span>
                                    <span style={styles.detailValue}>{order.customer.name}</span>
                                </div>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailLabel}>Contact</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Phone size={14} color="#6B7280" />
                                        <span style={styles.detailValue}>{order.customer.phone}</span>
                                    </div>
                                </div>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailLabel}>Payment Method</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <CreditCard size={14} color="#6B7280" />
                                        <span style={styles.detailValue}>{order.paymentMethod}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* SHIPPING ADDRESS */}
                        <section style={styles.card} className="admin-card">
                            <h3 style={styles.cardTitle}>
                                <MapPin size={18} style={{ color: '#6B7280' }} /> Delivery Address
                            </h3>
                            <div style={styles.addressBox}>
                                {order.customer.address}
                                <br />
                                <strong>Pincode: {order.customer.pincode}</strong>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: TIMELINE */}
                    <div style={styles.col}>
                        <section style={styles.card} className="admin-card">
                            <h3 style={styles.cardTitle}>
                                <Truck size={18} style={{ color: '#6B7280' }} /> Shipment Timeline
                            </h3>

                            {logs.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <Clock size={32} color="#D1D5DB" />
                                    <p>No shipment updates yet.</p>
                                </div>
                            ) : (
                                <div style={styles.timeline}>
                                    {logs.map((log, i) => (
                                        <div key={i} style={styles.timelineItem}>
                                            <div style={styles.timelineLine(i === logs.length - 1)} />
                                            <div style={styles.timelineDot(i === 0)} />
                                            <div style={{ flex: 1 }}>
                                                <div style={styles.logStatus}>{log.status}</div>
                                                <div style={styles.logDesc}>{log.description}</div>
                                                <div style={styles.logTime}>{new Date(log.timestamp).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </motion.div>

            {/* ACTION MODAL */}
            <AnimatePresence>
                {modal.open && (
                    <div style={styles.modalOverlay}>
                        <motion.div
                            variants={MODAL_VARIANTS}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            style={styles.modalBox}
                        >
                            <h3 style={styles.modalTitle}>
                                {modal.type === 'CANCEL' ? 'Cancel Order' : 'Initiate RTO'}
                            </h3>
                            <p style={styles.modalDesc}>
                                {modal.type === 'CANCEL'
                                    ? 'Are you sure? This action will cancel the order and cannot be undone.'
                                    : 'Please provide a reason for initiating RTO for this shipment.'}
                            </p>

                            <div style={{ marginBottom: 20 }}>
                                <label style={styles.inputLabel}>Reason for action</label>
                                <select
                                    style={styles.select}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                >
                                    <option value="">Select Reason...</option>
                                    {modal.type === 'CANCEL' ? (
                                        <>
                                            <option value="Customer Request">Customer Request</option>
                                            <option value="Duplicate Object">Duplicate Order</option>
                                            <option value="Fraudulent">Fraudulent / Suspicious</option>
                                            <option value="Out of Stock">Out of Stock</option>
                                            <option value="Other">Other</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Customer Refused">Customer Refused</option>
                                            <option value="Address Not Found">Address Not Found</option>
                                            <option value="Customer Not Available">Customer Not Available</option>
                                            <option value="Damaged">Damaged</option>
                                            <option value="Other">Other</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div style={styles.modalActions}>
                                <button onClick={() => setModal({ type: null, open: false })} style={styles.btnSec}>Cancel</button>
                                <button
                                    onClick={handleAction}
                                    disabled={actionLoading || !reason}
                                    style={modal.type === 'CANCEL' ? styles.btnDanger : styles.btnWarning}
                                >
                                    {actionLoading ? 'Processing...' : 'Confirm Action'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <MobileStyles />
        </AdminLayout>
    );
}

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
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            background: style.bg,
            color: style.color,
            border: `1px solid ${style.border}`,
            display: 'inline-block'
        }}>
            {status.replace(/_/g, " ")}
        </span>
    );
};

/* 📱 RESPONSIVE STYLES */
const MobileStyles = () => (
    <style jsx global>{`
        @media (max-width: 768px) {
            .admin-header {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 20px !important;
            }
            .admin-actions {
                width: 100%;
                flex-wrap: wrap !important;
                gap: 12px !important;
            }
            .admin-grid {
                grid-template-columns: 1fr !important;
                gap: 16px !important;
            }
            .admin-card {
                padding: 16px !important;
            }
            .admin-actions button {
                flex: 1;
                justify-content: center;
                white-space: nowrap;
            }
        }
    `}</style>
);

/* STYLES */
const styles = {
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
    title: { fontSize: 24, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: '-0.5px' },
    meta: { fontSize: 13, color: "#9CA3AF", marginTop: 4 },
    backBtn: { background: "white", border: "1px solid #E5E7EB", borderRadius: 8, padding: 8, cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', transition: 'all 0.2s', '&:hover': { background: '#F9FAFB' } },

    actions: { display: "flex", gap: 12 },
    btnMain: { display: 'flex', alignItems: 'center', gap: 8, background: "#111827", color: "#fff", padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 500, fontSize: 14 },
    btnSec: { display: 'flex', alignItems: 'center', gap: 8, background: "#fff", color: "#374151", padding: "8px 16px", borderRadius: 8, border: "1px solid #E5E7EB", cursor: "pointer", fontWeight: 500, fontSize: 14 },
    btnDanger: { display: 'flex', alignItems: 'center', gap: 8, background: "#FEF2F2", color: "#DC2626", padding: "8px 16px", borderRadius: 8, border: "1px solid #FECACA", cursor: "pointer", fontWeight: 600, fontSize: 14 },
    btnWarning: { display: 'flex', alignItems: 'center', gap: 8, background: "#FFFBEB", color: "#D97706", padding: "8px 16px", borderRadius: 8, border: "1px solid #FDE68A", cursor: "pointer", fontWeight: 600, fontSize: 14 },

    grid: { display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: 24, alignItems: 'start' },
    col: { display: "flex", flexDirection: "column", gap: 24 },

    card: { background: "#fff", padding: 24, borderRadius: 16, border: "1px solid #E5E7EB", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
    cardTitle: { fontSize: 15, fontWeight: 600, marginBottom: 20, color: "#111827", display: 'flex', alignItems: 'center', gap: 10, textTransform: 'uppercase', letterSpacing: '0.5px' },

    itemRow: { display: "flex", justifyContent: "space-between", alignItems: 'flex-start', borderBottom: '1px solid #F3F4F6', paddingBottom: 16, marginBottom: 16, '&:last-child': { borderBottom: 'none', paddingBottom: 0, marginBottom: 0 } },
    itemName: { fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 2 },
    itemMeta: { fontSize: 13, color: "#6B7280" },
    itemTotal: { fontWeight: 600, color: '#111827', fontSize: 15 },

    divider: { height: 1, background: "#E5E7EB", margin: "24px 0" },
    pricingRow: { display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 10, color: "#4B5563" },
    totalRow: { display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, marginTop: 16, paddingTop: 16, borderTop: "1px solid #E5E7EB", color: "#111827" },

    detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 20 },
    detailItem: { display: 'flex', flexDirection: 'column', gap: 4 },
    detailLabel: { fontSize: 12, color: '#6B7280', fontWeight: 500, textTransform: 'uppercase' },
    detailValue: { fontSize: 14, fontWeight: 600, color: '#111827' },

    addressBox: { background: '#F9FAFB', padding: 16, borderRadius: 8, fontSize: 14, lineHeight: '1.6', color: '#374151' },

    timeline: { position: "relative", paddingLeft: 8 },
    timelineItem: { display: "flex", gap: 16, paddingBottom: 32, position: "relative" },
    timelineLine: (isLast) => ({ position: 'absolute', top: 10, left: 5, width: 2, bottom: isLast ? 'auto' : -10, height: isLast ? 0 : 'auto', background: '#E5E7EB' }),
    timelineDot: (isActive) => ({ width: 12, height: 12, borderRadius: "50%", background: isActive ? "#10B981" : "#D1D5DB", zIndex: 2, marginTop: 6, border: "2px solid #fff", boxShadow: isActive ? "0 0 0 2px #A7F3D0" : "none" }),
    logStatus: { fontWeight: 600, fontSize: 14, color: "#111827" },
    logDesc: { fontSize: 13, color: "#4B5563", marginTop: 2, lineHeight: 1.4 },
    logTime: { fontSize: 11, color: "#9CA3AF", marginTop: 4 },
    emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 0', color: '#9CA3AF', fontSize: 14 },

    errorBanner: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 16, marginBottom: 24, color: '#991B1B' },
    warningBanner: { background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: 16, marginBottom: 24, color: '#92400E' },

    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    modalBox: { background: '#fff', padding: 32, borderRadius: 16, width: 440, maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
    modalTitle: { fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#111827' },
    modalDesc: { fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 1.5 },
    inputLabel: { display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 13, color: '#374151' },
    select: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
};
