import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, Clock, ShieldCheck, TrendingUp } from "lucide-react";

export default function TrustWallet() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [wallet, setWallet] = useState({
        balance: 0,
        pendingBalance: 0,
        tier: "Bronze",
        nextTier: "Silver",
        progress: 0,
        coinsToNext: 100,
        history: []
    });

    useEffect(() => {
        const fetchWallet = async () => {
            const token = localStorage.getItem("token");
            const userStr = localStorage.getItem("user");

            if (!token || !userStr) {
                router.push("/login?redirect=/account/coins");
                return;
            }

            setUser(JSON.parse(userStr));

            try {
                const res = await fetch("/api/user/wallet/me", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                const data = await res.json();

                if (data.success) {
                    setWallet(data);
                }
            } catch (err) {
                console.error("Failed to fetch wallet", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWallet();
    }, [router]);

    return (
        <div style={styles.page}>
            <Head>
                <title>Kasturi Trust Wallet | Authenticity Rewards</title>
            </Head>

            <div style={styles.container}>
                {/* HEADER LINK */}
                <div style={styles.headerLink}>
                    <Link href="/profile" legacyBehavior>
                        <a style={styles.backLink}><ArrowLeft size={18} /> Back to Dashboard</a>
                    </Link>
                </div>

                {/* HERO SECTION */}
                <div style={styles.hero}>
                    <div style={styles.heroTop}>
                        <div>
                            <h1 style={styles.greeting}>Namaste, {user?.name?.split(" ")[0]}</h1>
                            <p style={styles.lastUpdated}>Last updated: Today</p>
                        </div>
                        <div style={styles.tierBadge}>
                            <span style={styles.tierIcon}>★</span> {wallet.tier} Member
                        </div>
                    </div>

                    <div style={styles.balanceSection}>
                        <div style={styles.balanceRow}>
                            <span style={styles.coinIcon}>🪙</span>
                            <span style={styles.balanceAmount}>{wallet.balance}</span>
                            <span style={styles.balanceLabel}>Active Kasturi Coins</span>
                        </div>
                        {wallet.pendingBalance > 0 && (
                            <div style={styles.pendingRow}>
                                + {wallet.pendingBalance} Pending (COD)
                            </div>
                        )}
                    </div>

                    {/* TIER PROGRESS */}
                    <div style={styles.progressSection}>
                        <div style={styles.progressHeader}>
                            <span>Current Status: <strong>{wallet.tier}</strong></span>
                            {wallet.tier !== "Gold" && (
                                <span style={styles.nextTier}>Reach {wallet.nextTier} at {wallet.balance + wallet.coinsToNext} coins</span>
                            )}
                        </div>
                        <div style={styles.track}>
                            <div style={{ ...styles.fill, width: `${wallet.progress}%` }}></div>
                        </div>
                        <p style={styles.tierBenefit}>Higher tiers unlock additional benefits like early access to new batches. (Coming Soon)</p>
                    </div>
                </div>

                {/* TRANSACTION LEDGER */}
                <div style={styles.ledgerSection}>
                    <h3 style={styles.sectionTitle}>Transaction Ledger</h3>

                    {wallet.history.length === 0 ? (
                        <p style={styles.emptyState}>No transactions yet. Genuine purchases earn trust coins.</p>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>Activity</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Coins</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wallet.history.map((txn, i) => (
                                    <tr key={i} style={styles.tr}>
                                        <td style={styles.tdDate}>{new Date(txn.createdAt).toLocaleDateString()}</td>
                                        <td style={styles.tdDesc}>
                                            {txn.description}
                                            {txn.status === "PENDING" && <span style={styles.pendingTag}>PENDING</span>}
                                        </td>
                                        <td style={{ ...styles.tdAmount, color: txn.type === 'CREDIT' ? '#16A34A' : '#DC2626' }}>
                                            {txn.type === 'CREDIT' ? '+' : '-'}{txn.amount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* TRUST SEAL */}
                <div style={styles.sealSection}>
                    <div style={styles.sealBox}>
                        <div style={styles.sealIcon}><ShieldCheck size={32} color="#B8860B" /></div>
                        <div>
                            <h4 style={styles.sealTitle}>Authenticity Guarantee</h4>
                            <p style={styles.sealText}>Each Kasturi Coin confirms your product came directly from Kasturi Masale, Kolhapur. We do not sell on third-party apps to ensure quality.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#F9F6F1",
        padding: "120px 20px 40px",
        fontFamily: "'Inter', sans-serif"
    },
    container: {
        maxWidth: 600,
        margin: "0 auto"
    },
    headerLink: { marginBottom: 20 },
    backLink: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        color: "#666",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 500
    },
    hero: {
        background: "#fff",
        borderRadius: 20,
        padding: 32,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        marginBottom: 24
    },
    heroTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 32
    },
    greeting: {
        fontSize: 24,
        fontWeight: 700,
        color: "#111",
        margin: "0 0 4px 0"
    },
    lastUpdated: {
        fontSize: 13,
        color: "#666",
        margin: 0
    },
    tierBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "#FFFBEB",
        color: "#B45309",
        padding: "6px 12px",
        borderRadius: 50,
        fontSize: 13,
        fontWeight: 600
    },
    balanceSection: {
        textAlign: "center",
        marginBottom: 32
    },
    balanceRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12
    },
    coinIcon: { fontSize: 32 },
    balanceAmount: {
        fontSize: 48,
        fontWeight: 800,
        color: "#D97706",
        lineHeight: 1
    },
    balanceLabel: {
        fontSize: 13,
        color: "#999",
        fontWeight: 600,
        textTransform: "uppercase",
        marginTop: 6
    },
    pendingRow: {
        marginTop: 8,
        fontSize: 13,
        color: "#D97706",
        background: "#FFFBEB",
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 8
    },
    progressSection: {
        background: "#F9FAFB",
        padding: 16,
        borderRadius: 12
    },
    progressHeader: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 13,
        color: "#4B5563",
        marginBottom: 8
    },
    nextTier: { fontSize: 12, color: "#9CA3AF" },
    track: {
        height: 8,
        background: "#E5E7EB",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 12
    },
    fill: {
        height: "100%",
        background: "linear-gradient(90deg, #D97706, #F59E0B)",
        borderRadius: 4
    },
    tierBenefit: {
        fontSize: 12,
        color: "#6B7280",
        margin: 0,
        fontStyle: "italic"
    },
    ledgerSection: {
        marginBottom: 32
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 16,
        color: "#111"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse"
    },
    thRow: { borderBottom: "2px solid #E5E7EB" },
    th: {
        textAlign: "left",
        padding: "12px 4px",
        fontSize: 12,
        color: "#9CA3AF",
        textTransform: "uppercase",
        fontWeight: 600
    },
    tr: { borderBottom: "1px solid #F3F4F6" },
    tdDate: {
        padding: "16px 4px",
        fontSize: 13,
        color: "#6B7280"
    },
    tdDesc: {
        padding: "16px 4px",
        fontSize: 14,
        fontWeight: 500,
        color: "#111"
    },
    pendingTag: {
        fontSize: 10,
        background: "#FFFBEB",
        color: "#D97706",
        padding: "2px 6px",
        borderRadius: 4,
        marginLeft: 8,
        fontWeight: 700
    },
    tdAmount: {
        padding: "16px 4px",
        textAlign: "right",
        fontWeight: 700,
        fontSize: 15
    },
    sealSection: {
        opacity: 0.8
    },
    sealBox: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        border: "1px dashed #D97706",
        padding: 20,
        borderRadius: 16,
        background: "#FFFBEB"
    },
    sealIcon: {
        width: 48,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        borderRadius: "50%"
    },
    sealTitle: {
        fontSize: 14,
        color: "#B45309",
        margin: "0 0 4px 0",
        fontWeight: 700
    },
    sealText: {
        fontSize: 12,
        color: "#78350F",
        margin: 0,
        lineHeight: 1.4
    }
};
