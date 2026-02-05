import React, { useState } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { Copy, Check, MessageCircle, Mail, MessageSquare } from 'lucide-react'

// DATA: Canned Replies
const CANNED_REPLIES = [
    {
        id: 1,
        title: "Coins Missing / Not Visible",
        whatsapp: "Tension mat lijiye! 😊 Kasturi Coins order status ke hisaab se milte hain.\n🔹 Prepaid: Payment ke baad turant.\n🔹 COD: Delivery honay ke baad (tab tak 'Pending' dikhenge).\nApp login karke Header ya Wallet page check karein. 🪙",
        chat: "No need to worry! 😊 Coins are credited based on your order type.\n- Prepaid: Credited immediately after payment.\n- COD: Shown as Pending until delivery. They become active automatically after delivery.\nPlease check your Wallet page after logging in!",
        email: "Subject: Information regarding your Kasturi Coins\n\nDear Customer,\n\nThank you for reaching out. Regarding your query about missing coins:\n\nKasturi Coins are credited based on the order status:\n1. Prepaid Orders: Coins are credited immediately after payment confirmation.\n2. COD Orders: Coins appear as Pending when you place the order and become Active only after successful delivery.\n\nYou can view your detailed transaction history on the My Wallet page after logging in.\n\nBest Regards,\nTeam Kasturi Masale"
    },
    {
        id: 2,
        title: "When are COD Coins Credited?",
        whatsapp: "COD orders par coins Delivery ke baad hi active hotay hain. 🚚\nTab tak wo 'Pending' list mein dikhenge aur use nahi kar payenge.\nJaise hi order deliver hoga, coins unlock ho jayenge! ✅",
        chat: "For COD orders, coins are credited solely upon successful delivery. 🚚\nUntil then, they remain Pending and visible in your wallet but cannot be used. They unlock automatically after delivery!",
        email: "Subject: Coin Credit Policy for COD Orders\n\nDear Customer,\n\nFor Cash on Delivery (COD) orders, Kasturi Coins follow a specific credit policy:\n\n* Pending Status: Coins are listed as 'Pending' immediately after placing the order.\n* Activation: These coins become 'Active' and redeemable only after the order is successfully delivered to you.\n\nThis ensures fairness and prevents misuse. Once your items arrive, your coins will be ready to use!\n\nBest Regards,\nTeam Kasturi Masale"
    },
    {
        id: 3,
        title: "Minimum 100 Coins Rule",
        whatsapp: "Kasturi Coins use karne ke liye account mein kam se kam 100 Coins hona zaroori hai. 🪙\nFikar not, aapke coins safe hain! Next order par aur jama karein aur phir discount lein. 😊",
        chat: "To redeem coins, you need a minimum balance of 100 Coins.\nDon't worry, your current coins are safe in your wallet and never expire (unless specified). Keep collecting! 🚀",
        email: "Subject: Redemption Rules for Kasturi Coins\n\nDear Customer,\n\nTo redeem your Kasturi Coins, our policy requires a minimum balance of 100 Coins.\n\nCurrently, your balance is below this threshold, which is why the redemption option is not visible. Your coins remain safe in your account for future use.\n\nBest Regards,\nTeam Kasturi Masale"
    },
    {
        id: 4,
        title: "Redemption Option Not Showing",
        whatsapp: "Coin use karne ka option tabhi aata hai jab:\n1️⃣ Aapke paas 100+ active coins hon.\n2️⃣ Cart value itni ho ki coins (30%) apply ho sakein.\nCart mein items add karein aur wapas check karein! 🛒",
        chat: "The redemption option appears only if:\n1. You have at least 100 active coins.\n2. Your cart total allows for coin usage (up to 30% of value).\nPlease try adding more items to your cart!",
        email: "Subject: Assistance with Coin Redemption\n\nDear Customer,\n\nIf you cannot see the option to use coins, please check the following criteria:\n\n1. Minimum Balance: You must have at least 100 Active Coins. (Pending coins do not count).\n2. Usage Limit: Coins can pay for up to 30% of your cart value.\n\nPlease ensure you are logged in and have added items to the cart.\n\nBest Regards,\nTeam Kasturi Masale"
    },
    {
        id: 5,
        title: "Value of 1 Coin",
        whatsapp: "✅ 1 Kasturi Coin = ₹0.80\nAap apne agle order par 30% tak ka discount coins se le sakte hain! Mast deal hai na? 😎",
        chat: "The value is simple: 1 Kasturi Coin = ₹0.80.\nYou can use them to pay for up to 30% of your total cart value on your next purchase.",
        email: "Subject: Value of Kasturi Coins\n\nDear Customer,\n\nThe current valuation of our loyalty program is:\n\n1 Kasturi Coin = ₹0.80 (INR)\n\nThese coins can be applied as a direct discount on the checkout page, covering up to 30% of your total order value. They cannot be exchanged for cash.\n\nBest Regards,\nTeam Kasturi Masale"
    },
    {
        id: 6,
        title: "Cancellation / Refund Policy",
        whatsapp: "Agar order cancel/return kiya, toh coins credit nahi honge. ❌\nAgar prepaid order tha aur refund hua, toh jo coins mile thay wo wapas reverse ho jayenge.",
        chat: "If an order is cancelled or returned, no coins are earned.\nFor prepaid refunds, any coins previously credited for that order are automatically reversed from your wallet.",
        email: "Subject: Coin Adjustment on Cancellation\n\nDear Customer,\n\nRegarding your cancellation/return enquiry:\n\n* Cancelled/RTO: No coins are awarded for orders that are not completed.\n* Refunds: If coins were already credited (for a prepaid order), they will be reversed automatically upon processing your refund.\n\nThis ensures our loyalty program reflects actual purchases only.\n\nBest Regards,\nTeam Kasturi Masale"
    },
    {
        id: 11,
        title: "What are Pending Coins?",
        whatsapp: "Pending coins wo hain jo COD orders par milte hain. 🟡\nYe coins visible hote hain par locked rehte hain. Delivery hone par ye apne aap Active ho jayenge!",
        chat: "'Pending' coins are earned on Cash on Delivery (COD) orders.\nThey are visible in your wallet but locked. Once your delivery is completed, they automatically unlock and become ready to use!"
    }
]

export default function SupportHelper() {
    return (
        <div style={styles.page}>
            <Head>
                <title>Support Helper | Kasturi Admin</title>
            </Head>

            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.title}>🤝 Support Helper</h1>
                    <p style={styles.subtitle}>Quick copy-paste responses for Customer Support</p>
                </header>

                <div style={styles.grid}>
                    {CANNED_REPLIES.map((item) => (
                        <ResponseCard key={item.id} data={item} />
                    ))}
                </div>
            </div>
        </div>
    )
}

function ResponseCard({ data }) {
    const [activeTab, setActiveTab] = useState('whatsapp') // whatsapp | chat | email
    const [copied, setCopied] = useState(false)

    const getContent = () => {
        if (activeTab === 'whatsapp') return data.whatsapp
        if (activeTab === 'chat') return data.chat
        if (activeTab === 'email') return data.email
        return ""
    }

    const handleCopy = () => {
        const text = getContent()
        if (text) {
            navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    // If a tab has no content (e.g. email for simple query), disable it
    const hasEmail = !!data.email

    return (
        <motion.div
            style={styles.card}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{data.title}</h3>
                <div style={styles.tabs}>
                    <button
                        style={{ ...styles.tab, ...(activeTab === 'whatsapp' ? styles.activeTab : {}) }}
                        onClick={() => setActiveTab('whatsapp')}
                    >
                        <MessageCircle size={14} /> WA
                    </button>
                    <button
                        style={{ ...styles.tab, ...(activeTab === 'chat' ? styles.activeTab : {}) }}
                        onClick={() => setActiveTab('chat')}
                    >
                        <MessageSquare size={14} /> Chat
                    </button>
                    {hasEmail && (
                        <button
                            style={{ ...styles.tab, ...(activeTab === 'email' ? styles.activeTab : {}) }}
                            onClick={() => setActiveTab('email')}
                        >
                            <Mail size={14} /> Email
                        </button>
                    )}
                </div>
            </div>

            <div style={styles.contentArea}>
                <pre style={styles.pre}>{getContent()}</pre>
                <button
                    onClick={handleCopy}
                    style={{ ...styles.copyBtn, ...(copied ? styles.copiedBtn : {}) }}
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>
        </motion.div>
    )
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#F8FAFC",
        padding: "40px 20px",
        fontFamily: "'Inter', sans-serif"
    },
    container: {
        maxWidth: 1000,
        margin: "0 auto"
    },
    header: {
        marginBottom: 40,
        textAlign: "center"
    },
    title: {
        fontSize: 32,
        fontWeight: 800,
        color: "#1E293B",
        marginBottom: 8
    },
    subtitle: {
        color: "#64748B",
        fontSize: 16
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 24
    },
    card: {
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
        border: "1px solid #E2E8F0"
    },
    cardHeader: {
        padding: "16px 20px",
        borderBottom: "1px solid #F1F5F9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#F8FAFC"
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 600,
        color: "#334155"
    },
    tabs: {
        display: "flex",
        gap: 4,
        background: "#E2E8F0",
        padding: 4,
        borderRadius: 8
    },
    tab: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "6px 10px",
        border: "none",
        background: "transparent",
        color: "#64748B",
        fontSize: 12,
        fontWeight: 500,
        borderRadius: 6,
        cursor: "pointer",
        transition: "all 0.2s"
    },
    activeTab: {
        background: "#fff",
        color: "#0F172A",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
    },
    contentArea: {
        padding: 20,
        position: "relative"
    },
    pre: {
        whiteSpace: "pre-wrap",
        fontFamily: "inherit",
        fontSize: 14,
        color: "#334155",
        lineHeight: 1.6,
        marginBottom: 40 // space for button
    },
    copyBtn: {
        position: "absolute",
        bottom: 16,
        right: 16,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: 20,
        border: "none",
        background: "#F1F5F9",
        color: "#475569",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s"
    },
    copiedBtn: {
        background: "#DCFCE7",
        color: "#166534"
    }
}
