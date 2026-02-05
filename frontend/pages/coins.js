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
    const [isLoggedIn, setIsLoggedIn] = useState(false) // Track auth state

    const [referralCode, setReferralCode] = useState(null)
    const router = useRouter()

    useEffect(() => {
        const fetchWallet = async () => {
            const userStr = localStorage.getItem("user")

            // 1. GUEST MODE: Stop here if not logged in
            if (!userStr) {
                setIsLoggedIn(false)
                setLoading(false)
                return
            }

            // 2. LOGGED IN MODE
            setIsLoggedIn(true)
            const user = JSON.parse(userStr)
            try {
                const res = await fetch(`/api/user/wallet/${user.uid}`)
                const data = await res.json()
                if (data.success) {
                    setBalance(data.balance)
                    setHistory(data.transactions)
                }

                // Fetch User Details for Referral Code
                if (user.uid) {
                    const uRes = await fetch(`/api/user/sync`, {
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
                    <motion.h1 variants={fadeInUp} style={styles.title}>Kasturi Coins</motion.h1>
                    <motion.p variants={fadeInUp} style={styles.subtitle}>Our Loyalty Program & Policy</motion.p>

                    {/* AUTH GATED SECTION */}
                    {isLoggedIn ? (
                        <>
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
                                                    {txn.status && txn.status !== 'COMPLETED' && (
                                                        <span style={{
                                                            display: 'block', fontSize: 10, marginTop: 2,
                                                            color: txn.status === 'PENDING' ? '#D97706' : '#DC2626',
                                                            background: txn.status === 'PENDING' ? '#FFFBEB' : '#FEE2E2',
                                                            padding: '2px 6px', borderRadius: 4, textAlign: 'right'
                                                        }}>
                                                            {txn.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </>
                    ) : (
                        /* GUEST CTA */
                        <motion.div variants={fadeInUp} style={styles.guestCta}>
                            <p style={{ marginBottom: 16, fontSize: 16, fontWeight: 500 }}>Login to check your Coin Balance</p>
                            <button
                                onClick={() => router.push('/login')}
                                style={styles.loginBtn}
                            >
                                Login / Sign Up
                            </button>
                        </motion.div>
                    )}

                    {/* POLICY SECTION (ALWAYS VISIBLE) */}
                    <div style={{ marginTop: 40, borderTop: '2px dashed #ddd', paddingTop: 40 }}>
                        {/* HOW IT WORKS CONTENT */}
                        <motion.div variants={fadeInUp} style={styles.infoBox}>
                            {/* ... Content populated by prev tool call ... */}
                            {/* Wait, I am replacing the wrapper, so I need to preserve the inner content or restructure. 
                                The previous tool populated `styles.infoBox` content. 
                                I must be careful not to delete the policy text I just added. 
                                I am responding to `coins.js` lines 22-178.
                                The Policy text starts at line ~100.
                                I need to make sure I include the Policy Text in this replacement or use MULTI_REPLACE to only change the top logic.
                                
                                REPLACE_FILE_CONTENT replaces the BLOCK.
                                User's policy text is INSIDE the return().
                                I should construct the full return() with the policy text embedded to be safe, 
                                OR use multi-replace to target top Logic and bottom Render separately.
                                
                                Multi-replace is safer to preserve the long text.
                            */}

                            <div style={{ marginBottom: 24 }}>
                                <h3 style={{ fontSize: 20, marginBottom: 16 }}>🪙 Kasturi Coins – How It Works</h3>
                                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>
                                    Kasturi Coins are our loyalty rewards that help you save on future purchases at Kasturi Masale.
                                </p>
                            </div>

                            <div style={styles.policySection}>
                                <h4>💰 How You Earn Kasturi Coins</h4>
                                <ul>
                                    <li>You earn <strong>5% Kasturi Coins</strong> on the total value of your order.</li>
                                    <li>Coins are credited based on successful orders only.</li>
                                </ul>
                                <div style={styles.exampleBox}>
                                    <strong>Example:</strong> If you place an order worth ₹1000, you earn <strong>50 Kasturi Coins</strong>.
                                </div>
                            </div>

                            <div style={styles.policySection}>
                                <h4>🚚 When Coins Are Credited</h4>

                                <div style={{ marginBottom: 12 }}>
                                    <strong style={{ color: '#2E7D32' }}>🟢 Prepaid Orders (UPI / Card / Net Banking)</strong>
                                    <p>Coins are credited after payment is successfully confirmed.</p>
                                </div>

                                <div style={{ marginBottom: 12 }}>
                                    <strong style={{ color: '#F59E0B' }}>🟡 Cash on Delivery (COD) Orders</strong>
                                    <ul>
                                        <li>Coins are shown as <strong>Pending</strong> when you place the order.</li>
                                        <li>Coins become <strong>Active</strong> only after the order is delivered successfully.</li>
                                    </ul>
                                    <p style={{ fontSize: 13, fontStyle: 'italic', marginTop: 4 }}>👉 Pending coins cannot be used until delivery is completed.</p>
                                </div>

                                <div>
                                    <strong style={{ color: '#DC2626' }}>❌ Cancelled / Returned Orders</strong>
                                    <ul>
                                        <li>If an order is cancelled, returned, or marked RTO, no coins are credited.</li>
                                        <li>If coins were credited earlier for a prepaid order and the order is refunded, those coins will be reversed automatically.</li>
                                    </ul>
                                </div>
                            </div>

                            <div style={styles.policySection}>
                                <h4>🛒 How to Use Kasturi Coins</h4>
                                <ul>
                                    <li><strong>1 Kasturi Coin = ₹0.80</strong></li>
                                    <li>Minimum required to use coins: <strong>100 Coins</strong></li>
                                    <li>You can use coins for up to <strong>30%</strong> of your cart value.</li>
                                </ul>
                                <div style={styles.exampleBox}>
                                    <strong>Example:</strong> If your cart total is ₹500:<br />
                                    Maximum coins you can use = ₹150 (30%)<br />
                                    Coins required = 188 coins (₹150 ÷ ₹0.80)
                                </div>
                            </div>

                            <div style={styles.policySection}>
                                <h4>📊 Where You Can See Your Coins</h4>
                                <p>Once logged in, you can see your Kasturi Coins:</p>
                                <ul>
                                    <li>In the website header</li>
                                    <li>In the mobile menu</li>
                                    <li>On the Orders / Wallet page</li>
                                </ul>
                                <p style={{ marginTop: 8 }}>Coins are shown as:</p>
                                <ul>
                                    <li><strong>Active Coins</strong> – Available to use</li>
                                    <li><strong>Pending Coins</strong> – Will be activated after delivery (COD orders)</li>
                                </ul>
                            </div>

                            <div style={styles.policySection}>
                                <h4>🔒 Important Rules</h4>
                                <ul>
                                    <li>Kasturi Coins are non-transferable</li>
                                    <li>Coins cannot be exchanged for cash</li>
                                    <li>Coins can only be used on Kasturi Masale website</li>
                                    <li>Kasturi Masale reserves the right to update the Coins policy in the future</li>
                                </ul>
                            </div>

                            <div style={styles.policySection}>
                                <h4>🙋 Need Help?</h4>
                                <p>If you have any questions about Kasturi Coins, contact us on WhatsApp / Support and we’ll be happy to help.</p>
                            </div>

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
                    </div>
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
    },
    policySection: {
        marginBottom: 32,
        borderBottom: '1px solid #eee',
        paddingBottom: 24
    },
    exampleBox: {
        background: '#FFFBEB',
        border: '1px solid #FCD34D',
        borderRadius: 8,
        padding: '12px 16px',
        marginTop: 12,
        fontSize: 14,
        color: '#92400E'
    },
    guestCta: {
        margin: '60px 0',
        textAlign: 'center',
        padding: 40,
        background: 'rgba(255,255,255,0.5)',
        borderRadius: 24,
        border: '1px dashed #C02729'
    },
    loginBtn: {
        background: '#C02729',
        color: '#fff',
        border: 'none',
        padding: '12px 32px',
        fontSize: 16,
        fontWeight: 700,
        borderRadius: 50,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(192, 39, 41, 0.3)'
    }
}
