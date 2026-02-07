import React, { useState, useEffect } from "react";
import Head from "next/head";
import Script from "next/script";
import { ShieldCheck, AlertCircle, RefreshCw, Zap, CheckCircle2 } from "lucide-react";

export default function TestPaymentPage() {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [mounted, setMounted] = useState(false);

    // Constants
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    const LIVE_KEY_ID = "rzp_live_S5M9xFQnjbs34t";

    useEffect(() => {
        setMounted(true);
    }, []);

    const addLog = (message, type = "info") => {
        setLogs((prev) => [{ time: new Date().toLocaleTimeString(), message, type }, ...prev]);
    };

    const startTestPayment = async () => {
        if (loading) return;
        setLoading(true);
        setLogs([]);
        addLog("🚀 Starting ₹1 Test Payment Flow...", "info");

        try {
            // 1. Create Test Order on Backend
            addLog("📡 Calling createTestPaymentOrder...", "info");
            const token = localStorage.getItem("admin_token");

            const res = await fetch(`${BACKEND_URL}/api/orders/admin/test-payment/create`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` }),
                    // The cookie 'admin_token' should be automatically sent by browser
                },
            });

            const data = await res.json();

            if (!res.ok) {
                addLog(`❌ Error: ${data.message || "Failed to create test order"}`, "error");
                setLoading(false);
                return;
            }

            const { order } = data;
            addLog(`✅ Razorpay Order Created: ${order.id}`, "success");

            // 2. Open Razorpay Modal
            const options = {
                key: LIVE_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Kasturi Masale Admin Test",
                description: "₹1 Safe Production Verification",
                order_id: order.id,
                handler: async (response) => {
                    addLog("💳 Payment Captured! Verifying with backend...", "info");
                    await verifyPayment(response);
                },
                prefill: {
                    name: "Admin Tester",
                    email: "admin@kasturimasale.in",
                    contact: "9999999999",
                },
                theme: {
                    color: "#991b1b",
                },
                modal: {
                    ondismiss: () => {
                        addLog("⚠️ Payment cancelled by user", "warning");
                        setLoading(false);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            addLog(`❌ Error: ${err.message}`, "error");
            setLoading(false);
        }
    };

    const verifyPayment = async (rpResponse) => {
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${BACKEND_URL}/api/orders/admin/test-payment/verify`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` }),
                },
                body: JSON.stringify({
                    razorpay_order_id: rpResponse.razorpay_order_id,
                    razorpay_payment_id: rpResponse.razorpay_payment_id,
                    razorpay_signature: rpResponse.razorpay_signature,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                addLog(`❌ Verification Failed: ${data.message}`, "error");
            } else {
                addLog(`✅ SUCCESS: ${data.message}`, "success");
                if (data.refundId) {
                    addLog(`💸 Refund Initiated: ${data.refundId}`, "success");
                }
            }
        } catch (err) {
            addLog(`❌ Error during verification: ${err.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-neutral-50 p-6 font-sans">
            <Head>
                <title>Razorpay Test Panel | Kasturi Masale</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="beforeInteractive"
            />

            <div className="mx-auto max-w-2xl">
                <header className="mb-8 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-800 text-white">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Razorpay Test Panel</h1>
                        <p className="text-neutral-500 text-sm">Safe production ₹1 payment verification</p>
                    </div>
                </header>

                <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 rounded-lg bg-amber-50 p-4 text-amber-800 border border-amber-200">
                        <div className="flex gap-3 mb-2">
                            <AlertCircle size={20} className="shrink-0" />
                            <h2 className="font-semibold">Security Safeguards Active</h2>
                        </div>
                        <ul className="text-sm space-y-1 list-disc ml-8 opacity-90">
                            <li>Requires Admin Privilege</li>
                            <li>Atomic Rate Limit: 3 payments per day</li>
                            <li>No orders or stock deductions occurred</li>
                            <li>Immediate automatic refund upon success</li>
                        </ul>
                    </div>

                    <button
                        onClick={startTestPayment}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-800 py-4 text-lg font-bold text-white transition-all hover:bg-red-900 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? (
                            <RefreshCw className="animate-spin" />
                        ) : (
                            <Zap size={22} fill="currentColor" />
                        )}
                        {loading ? "Processing..." : "Start ₹1 Test Payment"}
                    </button>
                </section>

                <section className="mt-8">
                    <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-400">Live Status Logs</h2>
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-900 p-6 font-mono text-sm leading-relaxed shadow-lg">
                        {logs.length === 0 ? (
                            <p className="text-neutral-600">Waiting for activity...</p>
                        ) : (
                            <div className="space-y-3">
                                {logs.map((log, i) => (
                                    <div key={i} className="flex gap-3 text-white">
                                        <span className="shrink-0 text-neutral-500">[{log.time}]</span>
                                        <span className={
                                            log.type === "success" ? "text-emerald-400" :
                                                log.type === "error" ? "text-red-400" :
                                                    log.type === "warning" ? "text-amber-400" :
                                                        "text-blue-300"
                                        }>
                                            {log.message}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <footer className="mt-12 text-center text-xs text-neutral-400 italic">
                    Kasturi Masale Internal Testing Utility • v2.0-Audit
                </footer>
            </div>
        </div>
    );
}
