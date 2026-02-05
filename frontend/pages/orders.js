import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import Head from "next/head";
import {
    Package, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle,
    ShoppingBag, ArrowLeft, MoreHorizontal, X, Download
} from "lucide-react";

/* ================= COMPONENT ================= */
export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();

    // Modal State
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            router.push("/login");
            return;
        }

        const userData = JSON.parse(userStr);
        setUser(userData);

        try {
            const res = await fetch(`/api/user/orders/${userData.uid}`);
            const data = await res.json();
            if (data.success) {
                // Sort by newest
                setOrders(data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            }

            // Fetch Wallet
            const wRes = await fetch(`/api/user/wallet/${userData.uid}`);
            const wData = await wRes.json();
            if (wData.success) {
                setUser(prev => ({ ...prev, walletBalance: wData.balance }));
            }

        } catch (err) {
            console.error("Failed to load orders", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (order) => {
        setSelectedOrder(order);
        setCancelReason("");
        setCancelModalOpen(true);
    };

    const submitCancellation = async () => {
        if (!cancelReason.trim()) return;

        setCancelling(true);
        try {
            const res = await fetch(`/api/orders/user/${selectedOrder.orderId}/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reason: cancelReason,
                    userId: user.uid
                })
            });

            const data = await res.json();

            if (data.success) {
                // Update local state without reload
                setOrders(prev => prev.map(o =>
                    o.orderId === selectedOrder.orderId
                        ? { ...o, status: "CANCELLED" }
                        : o
                ));
                setCancelModalOpen(false);
            } else {
                alert(data.message || "Cancellation failed");
            }
        } catch (err) {
            console.error("Cancellation Error:", err);
            alert("Something went wrong. Please try again.");
        } finally {
            setCancelling(false);
        }
    };

    /* ANIMATION VARIANTS */
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    };

    return (
        <div style={styles.page}>
            <Head>
                <title>My Orders | Kasturi Masale</title>
            </Head>

            <div style={styles.container}>
                {/* HEADER */}
                <div style={styles.header}>
                    <button style={styles.backBtn} onClick={() => router.push('/')}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={styles.title}>Your Orders</h1>

                    {/* COIN BALANCE */}
                    <div style={styles.coinPill}>
                        <div style={{ fontSize: 16 }}>🪙</div>
                        <div>
                            <span style={{ fontSize: 10, display: 'block', lineHeight: 1, color: '#B45309' }}>BALANCE</span>
                            <span style={{ fontWeight: 800, color: '#78350F' }}>{user?.walletBalance || 0}</span>
                        </div>
                    </div>
                </div>

                {/* CONTENT */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={styles.loadingState}
                        >
                            <div className="spinner"></div>
                        </motion.div>
                    ) : orders.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={styles.emptyState}
                        >
                            <div style={styles.emptyIconBox}>
                                <ShoppingBag size={48} color="#9CA3AF" />
                            </div>
                            <h3 style={styles.emptyTitle}>No orders yet</h3>
                            <p style={styles.emptyText}>Looks like you haven't discovered our spices yet.</p>
                            <button style={styles.shopBtn} onClick={() => router.push('/')}>
                                Start Shopping
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            style={styles.list}
                        >
                            {orders.map((order) => (
                                <OrderCard
                                    key={order.orderId}
                                    order={order}
                                    variants={itemVariants}
                                    onCancel={() => handleCancelClick(order)}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* CANCEL MODAL */}
            <AnimatePresence>
                {cancelModalOpen && selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={styles.overlay}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={styles.modal}
                        >
                            <div style={styles.modalHeader}>
                                <h3 style={styles.modalTitle}>Cancel Order?</h3>
                                <button onClick={() => setCancelModalOpen(false)} style={styles.closeBtn}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={styles.modalBody}>
                                <p style={styles.modalText}>
                                    Order <strong>#{selectedOrder.orderId}</strong> will be cancelled and any amount paid will be refunded.
                                </p>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Reason for cancellation <span style={{ color: 'red' }}>*</span></label>
                                    <select
                                        style={styles.select}
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                    >
                                        <option value="">Select a reason</option>
                                        <option value="Changed my mind">Changed my mind</option>
                                        <option value="Ordered by mistake">Ordered by mistake</option>
                                        <option value="Found better price">Found better price</option>
                                        <option value="Delivery time is too long">Delivery time is too long</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div style={styles.modalFooter}>
                                <button
                                    onClick={() => setCancelModalOpen(false)}
                                    style={styles.secondaryBtn}
                                    disabled={cancelling}
                                >
                                    Keep Order
                                </button>
                                <button
                                    onClick={submitCancellation}
                                    style={{
                                        ...styles.dangerBtn,
                                        opacity: (!cancelReason || cancelling) ? 0.5 : 1,
                                        cursor: (!cancelReason || cancelling) ? "not-allowed" : "pointer"
                                    }}
                                    disabled={!cancelReason || cancelling}
                                >
                                    {cancelling ? "Cancelling..." : "Confirm Cancel"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
        body { background: #f9fafb; }
        .spinner {
          width: 30px; height: 30px;
          border: 3px solid #e5e7eb; border-top-color: #C02729;
          border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* HEADER SPACER */
        .spacer { height: 20px; }

        /* INVOICE BUTTON (Uiverse.io by satyamchaudharydev) */
        .invoice-dl-btn {
          --width: 110px;
          --height: 35px;
          --tooltip-height: 35px;
          --tooltip-width: 90px;
          --gap-between-tooltip-to-button: 18px;
          --button-color: #1163ff;
          --tooltip-color: #fff;
          width: var(--width);
          height: var(--height);
          background: var(--button-color);
          position: relative;
          text-align: center;
          border-radius: 0.45em;
          font-family: "Arial";
          transition: background 0.3s;
          border: none;
          cursor: pointer;
        }

        .invoice-dl-btn::before {
          position: absolute;
          content: attr(data-tooltip);
          width: var(--tooltip-width);
          height: var(--tooltip-height);
          background-color: var(--tooltip-color);
          font-size: 0.9rem;
          color: #111;
          border-radius: .25em;
          line-height: var(--tooltip-height);
          bottom: calc(var(--height) + var(--gap-between-tooltip-to-button) + 10px);
          left: calc(50% - var(--tooltip-width) / 2);
        }

        .invoice-dl-btn::after {
          position: absolute;
          content: '';
          width: 0;
          height: 0;
          border: 10px solid transparent;
          border-top-color: var(--tooltip-color);
          left: calc(50% - 10px);
          bottom: calc(100% + var(--gap-between-tooltip-to-button) - 10px);
        }

        .invoice-dl-btn::after,.invoice-dl-btn::before {
          opacity: 0;
          visibility: hidden;
          transition: all 0.5s;
          pointer-events: none; /* Prevent tooltip blocking hover exit */
          z-index: 10;
        }

        .invoice-dl-btn .text {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .button-wrapper, .text, .icon {
          overflow: hidden;
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          color: #fff;
        }

        .invoice-dl-btn .text {
          top: 0;
          font-size: 13px;
          font-weight: 600;
        }

        .text, .icon {
          transition: top 0.5s;
        }

        .icon {
          color: #fff;
          top: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon svg {
          width: 20px;
          height: 20px;
        }

        .invoice-dl-btn:hover {
          background: #6c18ff;
        }

        .invoice-dl-btn:hover .text {
          top: -100%;
        }

        .invoice-dl-btn:hover .icon {
          top: 0;
        }

        .invoice-dl-btn:hover:before, .invoice-dl-btn:hover:after {
          opacity: 1;
          visibility: visible;
        }

        .invoice-dl-btn:hover:after {
          bottom: calc(var(--height) + var(--gap-between-tooltip-to-button) - 20px);
        }

        .invoice-dl-btn:hover:before {
          bottom: calc(var(--height) + var(--gap-between-tooltip-to-button));
        }
      `}</style>
        </div>
    );
}

const OrderCard = ({ order, variants, onCancel }) => {
    const isCancellable = order.status === "PENDING_SHIPMENT";
    // Show invoice if NOT COD (i.e. Prepaid) OR if it is COD but Shipped/Delivered
    const showInvoice = order.paymentMethod !== 'COD' ||
        ["SHIPPED", "ON_THE_WAY", "OUT_FOR_DELIVERY", "DELIVERED", "RTO_DELIVERED"].includes(order.status);

    return (
        <motion.div variants={variants} style={styles.card}>
            <div style={styles.cardHeader}>
                <div>
                    <div style={styles.orderId}>Order #{order.orderId}</div>
                    <div style={styles.date}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </div>
                </div>
                <StatusBadge status={order.status} />
            </div>

            <div style={styles.divider}></div>

            <div style={styles.items}>
                {order.items.map((item, i) => (
                    <div key={i} style={styles.itemRow}>
                        <span style={styles.qty}>{item.quantity}x</span>
                        <span style={styles.name}>{item.name || "Masala Variant"} ({item.variant})</span>
                        <span style={styles.price}>₹{item.price * item.quantity}</span>
                    </div>
                ))}
            </div>

            <div style={styles.divider}></div>

            <div style={styles.cardFooter}>
                <div style={styles.totalInfo}>
                    <span style={styles.totalLabel}>Total Amount</span>
                    <span style={styles.totalAmount}>₹{order.pricing.total}</span>
                </div>

                <div style={styles.actions}>
                    {isCancellable && (
                        <button onClick={onCancel} style={styles.cancelBtn}>
                            Cancel Order
                        </button>
                    )}
                    {/* Always show View Details / Track button linking to internal page */}
                    {/* Always show View Details / Track button linking to internal page */}
                    {showInvoice && (
                        <button
                            className="invoice-dl-btn"
                            data-tooltip="Download"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(`/order/${order.orderId}/invoice`, '_blank');
                            }}
                        >
                            <div className="button-wrapper">
                                <div className="text">Invoice</div>
                                <span className="icon">
                                    <Download size={20} />
                                </span>
                            </div>
                        </button>
                    )}
                    <button
                        onClick={() => window.location.href = `/order/${order.orderId}`}
                        style={styles.trackBtn}
                    >
                        Track / Details
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const StatusBadge = ({ status }) => {
    const config = {
        PENDING_SHIPMENT: { color: "#D97706", bg: "#FEF3C7", icon: Clock, label: "Processing" },
        PACKED: { color: "#2563EB", bg: "#DBEAFE", icon: Package, label: "Packed" },
        SHIPPED: { color: "#7C3AED", bg: "#EDE9FE", icon: ChevronRight, label: "Shipped" },
        DELIVERED: { color: "#059669", bg: "#D1FAE5", icon: CheckCircle, label: "Delivered" },
        CANCELLED: { color: "#DC2626", bg: "#FEE2E2", icon: XCircle, label: "Cancelled" },
        RTO_INITIATED: { color: "#DC2626", bg: "#FEE2E2", icon: AlertCircle, label: "RTO Initiated" }
    };

    const { color, bg, icon: Icon, label } = config[status] ||
        { color: "#4B5563", bg: "#F3F4F6", icon: Clock, label: status?.replace(/_/g, ' ') };

    return (
        <div style={{ ...styles.badge, color, background: bg }}>
            <Icon size={14} strokeWidth={2.5} />
            <span>{label}</span>
        </div>
    );
};

const styles = {
    page: {
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "'Inter', sans-serif",
        maxWidth: "100vw",
        boxSizing: "border-box"
    },
    container: {
        maxWidth: 600,
        margin: "0 auto",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 32
    },
    backBtn: {
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "50%",
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "#374151",
        transition: "all 0.2s"
    },
    coinPill: {
        background: "#FFFbeb",
        border: "1px solid #FCD34D",
        borderRadius: 24,
        padding: "4px 12px 4px 8px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
    },
    title: {
        fontSize: 20,
        fontWeight: 700,
        color: "#111827",
        margin: 0
    },
    list: {
        display: "flex",
        flexDirection: "column",
        gap: 20
    },
    loadingState: {
        display: "flex",
        justifyContent: "center",
        padding: 60
    },
    emptyState: {
        textAlign: "center",
        padding: "60px 20px",
        background: "#fff",
        borderRadius: 24,
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
    },
    emptyIconBox: {
        width: 80,
        height: 80,
        background: "#F3F4F6",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px auto"
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: "#111827",
        marginBottom: 8
    },
    emptyText: {
        color: "#6B7280",
        marginBottom: 24,
        fontSize: 15
    },
    shopBtn: {
        background: "#C02729",
        color: "#fff",
        border: "none",
        padding: "12px 24px",
        borderRadius: 99,
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer"
    },
    card: {
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        // border: "1px solid #E5E7EB",
        overflow: "hidden"
    },
    cardHeader: {
        padding: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start"
    },
    orderId: {
        fontSize: 16,
        fontWeight: 700,
        color: "#111827",
        marginBottom: 4
    },
    date: {
        fontSize: 13,
        color: "#6B7280"
    },
    badge: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },
    divider: {
        height: 1,
        background: "#F3F4F6",
        margin: "0 20px"
    },
    items: {
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12
    },
    itemRow: {
        display: "flex",
        alignItems: "center",
        fontSize: 14,
        color: "#374151"
    },
    qty: {
        fontWeight: 600,
        color: "#9CA3AF",
        width: 32
    },
    name: {
        flex: 1,
        fontWeight: 500
    },
    price: {
        fontWeight: 600,
        color: "#111827"
    },
    cardFooter: {
        padding: 20,
        background: "#F9FAFB",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    totalLabel: {
        display: "block",
        fontSize: 12,
        color: "#6B7280",
        marginBottom: 2
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 700,
        color: "#111827"
    },
    actions: {
        display: "flex",
        gap: 10
    },
    cancelBtn: {
        background: "transparent",
        border: "1px solid #E5E7EB",
        color: "#EF4444",
        padding: "8px 16px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s"
    },
    trackBtn: {
        background: "#111827",
        color: "#fff",
        textDecoration: "none",
        padding: "8px 16px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        display: "inline-block",
        border: "none",
        cursor: "pointer"
    },
    invoiceBtn: {
        background: "#fff",
        border: "1px solid #D1D5DB",
        color: "#374151",
        padding: "8px 16px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s"
    },
    /* MODAL */
    overlay: {
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20
    },
    modal: {
        background: "#fff",
        width: "100%",
        maxWidth: 400,
        borderRadius: 20,
        padding: 24,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
    },
    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: "#111827",
        margin: 0
    },
    closeBtn: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#9CA3AF"
    },
    modalBody: {
        marginBottom: 24
    },
    modalText: {
        fontSize: 14,
        color: "#4B5563",
        marginBottom: 20,
        lineHeight: 1.5
    },
    label: {
        display: "block",
        fontSize: 13,
        fontWeight: 600,
        color: "#374151",
        marginBottom: 8
    },
    select: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid #D1D5DB",
        fontSize: 14,
        color: "#111827",
        outline: "none"
    },
    modalFooter: {
        display: "flex",
        gap: 12
    },
    secondaryBtn: {
        flex: 1,
        background: "#F3F4F6",
        color: "#374151",
        border: "none",
        padding: "12px",
        borderRadius: 8,
        fontWeight: 600,
        cursor: "pointer"
    },
    dangerBtn: {
        flex: 1,
        background: "#DC2626",
        color: "#fff",
        border: "none",
        padding: "12px",
        borderRadius: 8,
        fontWeight: 600,
        cursor: "pointer",
        transition: "opacity 0.2s"
    }
};

