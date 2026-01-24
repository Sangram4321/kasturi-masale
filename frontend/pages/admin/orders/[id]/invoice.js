import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function Invoice() {
    const router = useRouter();
    const { id } = router.query; // This handles /admin/orders/[id]/invoice
    const [order, setOrder] = useState(null);

    useEffect(() => {
        if (!id) return;
        const fetchOrder = async () => {
            // Fallback fetch if singular endpoint isn't super robust yet, reusing same logic
            const resSingle = await fetch(`${API}/api/orders/admin/${id}`);
            if (resSingle.ok) {
                const data = await resSingle.json();
                setOrder(data.order);
            } else {
                const resAll = await fetch(`${API}/api/orders/admin/all`);
                const d = await resAll.json();
                setOrder(d.orders?.find(o => o.orderId === id));
            }
        }
        fetchOrder();
    }, [id]);

    useEffect(() => {
        if (order) {
            setTimeout(() => window.print(), 1000); // Auto print when loaded
        }
    }, [order]);

    if (!order) return <div>Loading Invoice...</div>;

    return (
        <div style={page}>
            {/* HEADER */}
            <div style={header}>
                <h1 style={logo}>KASTURI MASALE</h1>
                <div style={{ textAlign: 'right' }}>
                    <h3>INVOICE</h3>
                    <div style={meta}>#{order.orderId}</div>
                    <div style={meta}>{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
            </div>

            {/* FROM / TO */}
            <div style={grid}>
                <div>
                    <div style={label}>FROM</div>
                    <div><b>Kasturi Masale</b></div>
                    <div>123 Spice Market, Khari Baoli</div>
                    <div>Old Delhi, 110006</div>
                    <div>GSTIN: 07AAPCK____1Z5</div>
                    <div>support@kasturimasale.in</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={label}>BILL TO</div>
                    <div><b>{order.customer.name}</b></div>
                    <div>{order.customer.address}</div>
                    <div>{order.customer.pincode}</div>
                    <div>{order.customer.phone}</div>
                </div>
            </div>

            {/* ITEMS */}
            <table style={table}>
                <thead>
                    <tr>
                        <th style={th}>ITEM</th>
                        <th style={th}>QTY</th>
                        <th style={th}>RATE</th>
                        <th style={{ ...th, textAlign: 'right' }}>AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item, i) => (
                        <tr key={i}>
                            <td style={td}>{item.variant}</td>
                            <td style={td}>{item.quantity}</td>
                            <td style={td}>₹{item.price}</td>
                            <td style={{ ...td, textAlign: 'right' }}>₹{item.price * item.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* TOTALS */}
            <div style={totals}>
                <div style={row}><span>Subtotal:</span> <span>₹{order.pricing.subtotal}</span></div>
                <div style={row}><span>Discount:</span> <span>- ₹{order.pricing.discount}</span></div>
                <div style={row}><span>COD/Shipping:</span> <span>+ ₹{order.pricing.codFee}</span></div>
                <div style={grandRow}><span>TOTAL:</span> <span>₹{order.pricing.total}</span></div>
            </div>

            {/* FOOTER */}
            <div style={footer}>
                Thank you for choosing Kasturi Masale! Since 1970.<br />
                This is a computer generated invoice.
            </div>

        </div>
    );
}

/* STYLES */
const page = { padding: 50, maxWidth: 800, margin: "0 auto", fontFamily: "Arial, sans-serif", color: "#333", background: 'white' };
const header = { display: "flex", justifyContent: "space-between", borderBottom: "2px solid #333", paddingBottom: 20, marginBottom: 40 };
const logo = { margin: 0, letterSpacing: 2 };
const meta = { fontSize: 14, color: "#666", marginTop: 4 };
const grid = { display: "flex", justifyContent: "space-between", marginBottom: 40 };
const label = { fontSize: 10, fontWeight: "bold", color: "#999", marginBottom: 6 };
const table = { width: "100%", borderCollapse: "collapse", marginBottom: 30 };
const th = { textAlign: "left", padding: "10px 0", borderBottom: "1px solid #ccc", fontSize: 12 };
const td = { padding: "10px 0", borderBottom: "1px solid #eee" };
const totals = { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 };
const row = { width: 200, display: "flex", justifyContent: "space-between", fontSize: 14 };
const grandRow = { width: 200, display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: "bold", borderTop: "2px solid #333", paddingTop: 10, marginTop: 10 };
const footer = { marginTop: 60, textAlign: "center", fontSize: 12, color: "#999", lineHeight: "1.6" };
