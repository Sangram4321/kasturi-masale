import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/router"
import Head from "next/head"

/* ================= ICONS ================= */
const CoinIcon = ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M10 12a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2" />
        <path d="M12 8v8" />
    </svg>
)

const HistoryIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20v-6M6 20V10M18 20V4" />
    </svg>
)

export default function Coins() {
    const [balance, setBalance] = useState(0)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    const [referralCode, setReferralCode] = useState(null)
    const router = useRouter()

    useEffect(() => {
        const fetchWallet = async () => {
            const userStr = localStorage.getItem("user")
            if (!userStr) {
                router.push("/login")
                return
            }

            const user = JSON.parse(userStr)
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/user/wallet/${user.uid}`)
                const data = await res.json()
                if (data.success) {
                    setBalance(data.balance)

                    setHistory(data.transactions)
                }

                // Fetch User Details for Referral Code
                if (user.uid) {
                    const uRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/user/sync`, {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(user) // Sync to ensure code exists
                    });
                    const uData = await uRes.json();
                    if (uData.success && uData.user.referralCode) {
                        setReferralCode(uData.user.referralCode);
                    }
                }
            } catch (err) {
                console.error("Failed to load wallet", err)
            } finally {
                setLoading(false)
            }
        }

        fetchWallet()
    }, [router])

    /* ANIMATION */
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }

    return (
        <div style={styles.page}>
            <Head>
                <title>Kasturi Coins | Kasturi Masale</title>
            </Head>

            <div style={styles.container}>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                >
                    {/* HEADER */}
                    <motion.h1 variants={fadeInUp} style={styles.title}>My Wallet</motion.h1>
                    <motion.p variants={fadeInUp} style={styles.subtitle}>Manage your rewards and savings</motion.p>

                    {/* BALANCE CARD */}
                    <motion.div variants={fadeInUp} style={styles.card}>
                        <div style={styles.coinIconWrap}>
                            <span style={{ fontSize: 48 }}>🪙</span>
                        </div>
                        <div>
                            <div style={styles.balanceLabel}>Current Balance</div>
                            <div style={styles.balanceValue}>{loading ? "..." : balance} <span style={styles.currency}>Coins</span></div>
                        </div>
                        <div style={styles.valueHint}>= ₹{balance} value</div>
                    </motion.div>

                    {/* HOW IT WORKS */}
                    <motion.div variants={fadeInUp} style={styles.infoBox}>
                        <h3>How to earn?</h3>
                        <ul>

                            <li>Get <strong>10% coins</strong> on every prepaid order.</li>
                            <li>Refer a friend: They get ₹50 off, you get <strong>50 coins</strong> after delivery!</li>
                            <li>Use coins to get discounts on your next purchase (1 Coin = ₹0.80).</li>
                        </ul>

                        {referralCode && (
                            <div style={{ marginTop: 16, padding: 16, background: '#F3F4F6', borderRadius: 12 }}>
                                <p style={{ margin: '0 0 8px 0', fontSize: 13, color: '#555' }}>Your Referral Code:</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <code style={{ fontSize: 18, fontWeight: 'bold', letterSpacing: 1, color: '#C02729' }}>{referralCode}</code>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(referralCode); alert("Copied!"); }}
                                        style={{ padding: '4px 8px', fontSize: 11, cursor: 'pointer', border: '1px solid #ddd', borderRadius: 4, background: '#fff' }}
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        )}

                    </motion.div>

                    {/* HISTORY */}
                    <motion.div variants={fadeInUp} style={styles.historySection}>
                        <div style={styles.historyTitle}>
                            <HistoryIcon /> Transaction History
                        </div>

                        {loading ? (
                            <p style={{ opacity: 0.5 }}>Loading transactions...</p>
                        ) : history.length === 0 ? (
                            <div style={styles.empty}>No transactions yet. Start shopping!</div>
                        ) : (
                            <div style={styles.list}>
                                {history.map((txn, i) => (
                                    <motion.div
                                        key={txn._id || i}
                                        style={styles.txnItem}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <div>
                                            <div style={styles.txnDesc}>{txn.description}</div>
                                            <div style={styles.txnDate}>{new Date(txn.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{
                                            ...styles.txnAmount,
                                            color: txn.type === 'credit' ? '#2E7D32' : '#C02729'
                                        }}>
                                            {txn.type === 'credit' ? '+' : '-'}{txn.amount}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#F7EFDB",
        padding: "40px 20px",
        fontFamily: "'Noto Sans Devanagari', sans-serif"
    },
    container: {
        maxWidth: 600,
        margin: "0 auto"
    },
    title: {
        fontSize: 32,
        fontWeight: 800,
        color: "#2D2A26",
        marginBottom: 8
    },
    subtitle: {
        fontSize: 16,
        color: "#5D4037",
        marginBottom: 32,
        opacity: 0.8
    },
    card: {
        background: "linear-gradient(135deg, #2D2A26, #453F39)",
        borderRadius: 24,
        padding: 32,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        gap: 24,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
    },
    coinIconWrap: {
        background: "rgba(255,255,255,0.1)",
        borderRadius: "50%",
        width: 80,
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.1)"
    },
    balanceLabel: {
        fontSize: 14,
        opacity: 0.7,
        textTransform: "uppercase",
        letterSpacing: 1,
        fontWeight: 600
    },
    balanceValue: {
        fontSize: 40,
        fontWeight: 800,
        color: "#FFD700", // Gold
        lineHeight: 1.1,
        marginTop: 4
    },
    currency: {
        fontSize: 18,
        color: "rgba(255,255,255,0.6)",
        fontWeight: 500
    },
    valueHint: {
        position: "absolute",
        right: 32,
        top: 32,
        background: "rgba(255,215,0,0.2)",
        color: "#FFD700",
        padding: "6px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700
    },

    infoBox: {
        margin: "32px 0",
        background: "#fff",
        padding: 24,
        borderRadius: 20,
        boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
    },

    historySection: {
        marginTop: 32
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 700,
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "#2D2A26"
    },
    list: {
        display: "flex",
        flexDirection: "column",
        gap: 12
    },
    txnItem: {
        background: "#fff",
        padding: "16px 20px",
        borderRadius: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
    },
    txnDesc: {
        fontSize: 15,
        fontWeight: 600,
        color: "#2D2A26"
    },
    txnDate: {
        fontSize: 12,
        color: "#888",
        marginTop: 4
    },
    txnAmount: {
        fontSize: 18,
        fontWeight: 700
    },
    empty: {
        textAlign: "center",
        padding: 40,
        opacity: 0.5,
        fontSize: 14
    }
}
