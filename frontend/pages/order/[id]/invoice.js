import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Printer } from 'lucide-react';

const API = "";

export default function Invoice() {
    const router = useRouter();
    const { id } = router.query;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Business Details
    const BIZ = {
        name: "The Spice Emperor",
        brand: "Kasturi Masale",
        address: "Yavaluj, Gawaliwada, Tal. Panhala, Dist. Kolhapur - 416205",
        gstin: "27DXFPP4385E1Z5",
        email: "support@kasturimasale.in",
        phone: "+91 77373 79292",
        website: "www.kasturimasale.in"
    };

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            // Redirect to login if not available
            // But for invoice we might show error
            setError("Please login to view invoice");
            setLoading(false);
            return;
        }
        const user = JSON.parse(userStr);

        try {
            // Pass UID for basic security/ownership check
            const res = await fetch(`${API}/api/orders/user/${id}?uid=${user.uid}`);
            const data = await res.json();

            if (data.success) {
                setOrder(data.order);
            } else {
                setError(data.message || "Order not found");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load invoice");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Generating Invoice...</div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!order) return <div className="p-10 text-center">Order not found</div>;

    // Tax Calculation Logic (Inclusive 5%)
    // Base = Total / 1.05
    const calculateTax = (amount) => {
        const base = amount / 1.05;
        const tax = amount - base;
        return { base, tax };
    };

    const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    return (
        <div className="invoice-container">
            <Head>
                <title>Invoice #{order.orderId}</title>
            </Head>

            {/* PRINT CONTROLS */}
            <div className="no-print print-bar">
                <button onClick={() => window.print()} style={styles.printBtn}>
                    <Printer size={16} /> Print Invoice
                </button>
            </div>

            <div className="sheet">
                <img src="/images/brand/kasturi-logo-red.png" className="watermark" alt="" />

                {/* HEADER */}
                <header className="header">
                    <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                        <img src="/images/logo-circle/kasturi-logo-red-circle.png" alt="Logo" style={{ width: 80, height: 80 }} />
                        <div className="brand-col">
                            <h1 className="brand-name">{BIZ.brand}</h1>
                            <div className="biz-name">By {BIZ.name}</div>
                            <div className="biz-details">
                                {BIZ.address}<br />
                                GSTIN: <strong>{BIZ.gstin}</strong><br />
                                Contact: {BIZ.phone} | {BIZ.email}
                            </div>
                        </div>
                    </div>
                    <div className="invoice-meta">
                        <h2 className="doc-title">TAX INVOICE</h2>
                        <table className="meta-table">
                            <tbody>
                                <tr><td>Invoice No:</td><td><strong>{order.orderId}</strong></td></tr>
                                <tr><td>Date:</td><td>{invoiceDate}</td></tr>
                                <tr><td>Place of Supply:</td><td>{order.customer.state || 'India'}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </header>

                {/* ADDRESSES */}
                <section className="addresses">
                    <div className="addr-box">
                        <h3>Billed To:</h3>
                        <div className="addr-content">
                            <strong>{order.customer.name}</strong><br />
                            {order.customer.address}<br />
                            {order.customer.city}, {order.customer.state} - {order.customer.pincode}<br />
                            Phone: {order.customer.phone}
                        </div>
                    </div>
                    <div className="addr-box">
                        <h3>Shipped To:</h3>
                        <div className="addr-content">
                            <strong>{order.customer.name}</strong><br />
                            {order.customer.address}<br />
                            {order.customer.city}, {order.customer.state} - {order.customer.pincode}<br />
                        </div>
                    </div>
                </section>

                {/* ITEMS TABLE */}
                <table className="items-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th className="text-left">Item Description</th>
                            <th>HSN/SAC</th>
                            <th>Qty</th>
                            <th>Rate (Inc. Tax)</th>
                            <th>Taxable Value</th>
                            <th>CGST (2.5%)</th>
                            <th>SGST (2.5%)</th>
                            <th className="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, i) => {
                            const lineTotal = item.price * item.quantity;
                            const { base, tax } = calculateTax(lineTotal);
                            const halfTax = tax / 2;
                            return (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td className="text-left">
                                        <strong>{getProductTitle(item.variant)}</strong>
                                    </td>
                                    <td>0910</td>
                                    <td>{item.quantity}</td>
                                    <td>₹{item.price.toFixed(2)}</td>
                                    <td>₹{base.toFixed(2)}</td>
                                    <td>₹{halfTax.toFixed(2)}</td>
                                    <td>₹{halfTax.toFixed(2)}</td>
                                    <td className="text-right">₹{lineTotal.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* TOTALS */}
                <div className="totals-section">
                    <div className="amount-words">
                        <strong>Amount in Words:</strong><br />
                        {numberToWords(Math.round(order.pricing.total))} Rupees Only
                    </div>
                    <table className="totals-table">
                        <tbody>
                            <tr>
                                <td>Subtotal</td>
                                <td className="text-right">₹{order.pricing.subtotal.toFixed(2)}</td>
                            </tr>
                            {order.pricing.discount > 0 && (
                                <tr className="text-green">
                                    <td>Discount</td>
                                    <td className="text-right">- ₹{order.pricing.discount.toFixed(2)}</td>
                                </tr>
                            )}
                            <tr>
                                <td>Shipping / COD Charges</td>
                                <td className="text-right">₹{order.pricing.codFee?.toFixed(2) || '0.00'}</td>
                            </tr>
                            <tr className="grand-total">
                                <td>Grand Total</td>
                                <td className="text-right">₹{order.pricing.total.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* FOOTER */}
                <footer className="footer">
                    <div className="terms">
                        <strong>Terms & Conditions:</strong>
                        <ol>
                            <li>This is a computer-generated invoice; no signature is required.</li>
                            <li>Goods once sold will not be taken back or exchanged.</li>
                            <li>All disputes are subject to Kolhapur jurisdiction only.</li>
                            <li>Please check the package at the time of delivery. Any damage or shortage must be reported within 24 hours of delivery.</li>
                            <li>For food products, returns are accepted only in case of manufacturing defects or damaged packages.</li>
                        </ol>
                    </div>
                    <div className="signature">
                        <div className="sign-box">
                            For {BIZ.name}
                            <div className="sign-space">
                                <small>(Computer Generated)</small>
                            </div>
                            Authorized Signatory
                        </div>
                    </div>
                </footer>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                body { background: #555; margin: 0; font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
                
                .invoice-container { display: flex; flex-direction: column; alignItems: center; padding: 20px; min-height: 100vh; }
                
                .print-bar { margin-bottom: 20px; }
                .sheet { 
                    background: white; 
                    width: 210mm; 
                    min-height: 297mm; 
                    padding: 40px; 
                    box-shadow: 0 0 10px rgba(0,0,0,0.1); 
                    box-sizing: border-box;
                    position: relative;
                }

                /* HEADER */
                .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; position: relative; z-index: 2; }
                
                /* WATERMARK */
                .watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 60%;
                    opacity: 0.08;
                    z-index: 1;
                    pointer-events: none;
                }

                .brand-name { font-size: 28px; font-weight: 600; color: #1f2937; margin: 0; text-transform: uppercase; letter-spacing: -1px; }
                .biz-name { font-size: 14px; color: #4b5563; font-weight: 400; margin-bottom: 8px; }
                .biz-details { font-size: 12px; line-height: 1.5; color: #6b7280; max-width: 300px; font-weight: 400; }
                
                .doc-title { font-size: 24px; font-weight: 600; color: #374151; margin: 0 0 10px 0; text-align: right; }
                .meta-table td { padding: 2px 0; font-size: 13px; text-align: right; font-weight: 400; }
                .meta-table td:first-child { padding-right: 15px; color: #6b7280; font-weight: 500; }

                /* ADDRESS */
                .addresses { display: flex; gap: 20px; margin-bottom: 30px; }
                .addr-box { flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; }
                .addr-box h3 { margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; font-weight: 500; }
                .addr-content { font-size: 13px; line-height: 1.5; color: #1f2937; font-weight: 400; }

                /* TABLE */
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                .items-table th { background: #f9fafb; padding: 10px; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; color: #4b5563; text-align: center; font-weight: 500; }
                .items-table td { padding: 12px 10px; font-size: 13px; border-bottom: 1px solid #f3f4f6; text-align: center; color: #374151; font-weight: 400; }
                .items-table .text-left { text-align: left; }
                .items-table .text-right { text-align: right; }

                /* TOTALS */
                .totals-section { display: flex; justifyContent: space-between; margin-bottom: 40px; }
                .amount-words { flex: 1; font-size: 13px; color: #4b5563; padding-right: 40px; font-weight: 400; }
                .totals-table { width: 300px; border-collapse: collapse; }
                .totals-table td { padding: 6px 0; font-size: 13px; color: #374151; font-weight: 400; }
                .totals-table .text-right { text-align: right; }
                .grand-total td { font-weight: 700; font-size: 16px; border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 10px; color: #111827; }

                /* FOOTER */
                .footer { display: flex; justify-content: space-between; margin-top: auto; padding-top: 20px; border-top: 1px solid #eee; }
                .terms { font-size: 11px; color: #6b7280; max-width: 60%; font-weight: 400; }
                .terms ol { padding-left: 15px; margin: 5px 0 0 0; }
                .terms li { margin-bottom: 2px; }
                
                .signature { text-align: center; }
                .sign-box { font-size: 12px; font-weight: 500; color: #374151; }
                .sign-space { height: 60px; display: flex; alignItems: center; justifyContent: center; color: #9ca3af; }

                @media print {
                    body { background: white; }
                    .no-print { display: none; }
                    .invoice-container { padding: 0; width: 100%; height: 100%; display: block; }
                    .sheet { width: 100%; box-shadow: none; padding: 0; }
                    @page { margin: 15mm; }
                }
            `}</style>
        </div>
    );
}

const styles = {
    printBtn: {
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#111827', color: 'white', border: 'none',
        padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
        fontSize: 14, fontWeight: 500, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }
};

// Helper for Number to Words
function numberToWords(number) {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (number === 0) return 'Zero';

    function convert(n) {
        if (n < 10) return units[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + units[n % 10] : '');
        if (n < 1000) return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
        if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
        if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
        return 'Many';
    }

    return convert(number);
}

function getProductTitle(variant) {
    if (!variant) return "Kasturi Kolhapuri Masala";
    const v = variant.toLowerCase().replace(/\s/g, ''); // normalize

    if (v.includes("200")) return "Kasturi Kolhapuri kanda lasun Masala (Trial 200gm)";
    if (v.includes("500")) return "Kasturi Kolhapuri kanda lasun Masala (Most Popular 500gm)";
    if (v.includes("1kg")) return "Kasturi Kolhapuri kanda lasun Masala (Best Value 1kg)";
    if (v.includes("2kg")) return "Kasturi Kolhapuri kanda lasun Masala (Family Pack 2kg)";

    return `Kasturi Kolhapuri kanda lasun Masala (${variant})`;
}
