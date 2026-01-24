import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "../context/CartContext"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { useTruck, TRUCK_STATES } from "../context/TruckContext"

/* 🖼️ IMAGE MAPPING */
const IMAGE_MAP = {
  "200": "/images/product-200g.png",
  "500": "/images/product-500g.png",
  "1000": "/images/product-1kg.png", // Updated to match expected naming
  "2000": "/images/product-2kg.png"
}

/* 🛡️ ICONS */
/* 🛡️ ICONS & ANIMATIONS */
const ShieldIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
const TruckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect><line x1="16" y1="8" x2="20" y2="8"></line><line x1="16" y1="11" x2="20" y2="11"></line><path d="M16 16h2a2 2 0 0 0 2-2v-4"></path><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>

const AnimatedTrashIcon = () => (
  <motion.svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    whileHover="hover"
  >
    <motion.path d="M3 6h18" />
    <motion.path
      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
      variants={{ hover: { y: 2 } }} // Bin shakes slightly or stays put
    />
    <motion.path
      d="M10 11v6"
      variants={{ hover: { opacity: 0 } }}
    />
    <motion.path
      d="M14 11v6"
      variants={{ hover: { opacity: 0 } }}
    />
    {/* Lid Animation: Rotates open */}
    <motion.g style={{ originX: "2px", originY: "6px" }} variants={{ hover: { rotate: -15, y: -2 } }}>
      <line x1="8" y1="6" x2="16" y2="6" stroke="transparent" /> {/* Invisible anchor helper if needed, simplified below */}
    </motion.g>
  </motion.svg>
)

/* Better Trash Icon with defined separate parts for animation */
const TrashWithLid = () => (
  <motion.div style={{ width: 20, height: 20, position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }} whileHover="open">
    <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <motion.path d="M3 6h18" />
      <motion.path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      {/* Lid */}
      <motion.path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" variants={{ open: { rotate: -20, y: -3, originX: 0.9, originY: 1 } }} transition={{ type: "spring", stiffness: 300, damping: 10 }} />
    </motion.svg>
  </motion.div>
)

const PacketIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 4px 6px rgba(192, 39, 41, 0.2))" }}>
    <path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#FFF5F5" stroke="#C02729" strokeWidth="1.5" />
    <path d="M12 13c2.5 0 3.5-1.5 3.5-3.5S14.5 6 12 6 8.5 8 8.5 10 9.5 13 12 13z" fill="#C02729" />
    <path d="M12 9v2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="9" y="16" width="6" height="2" rx="1" fill="#C02729" opacity="0.2" />
  </svg>
)

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
)

const ShimmerButton = ({ children, style, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02, boxShadow: "0 8px 15px rgba(192, 39, 41, 0.25)" }}
    whileTap={{ scale: 0.98 }}
    style={{ ...style, position: "relative", overflow: "hidden", transition: "box-shadow 0.2s" }}
    onClick={onClick}
  >
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: "100%" }}
      transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 1 }}
      style={{
        position: "absolute",
        top: 0, left: 0, width: "50%", height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        transform: "skewX(-20deg)"
      }}
    />
    <span style={{ position: "relative", zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>{children}</span>
  </motion.button>
)

import SoftTruck from "../components/SoftTruck"

// AnimatedCheckoutButton (Local Soft Truck)
const AnimatedCheckoutButton = ({ style }) => {
  const router = useRouter()
  const [btnState, setBtnState] = useState('idle')

  const handleClick = async () => {
    setBtnState('loading')

    // 🚚 Local Animation: Drive for 1.5s then push
    await new Promise(r => setTimeout(r, 1200))
    router.push('/checkout')
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={btnState !== 'idle'}
      whileHover={btnState === 'idle' ? { scale: 1.02, boxShadow: "0 8px 15px rgba(192, 39, 41, 0.25)" } : {}}
      whileTap={btnState === 'idle' ? { scale: 0.98 } : {}}
      style={{ ...style, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
    >
      {/* Shimmer Effect (Only on idle) */}
      {btnState === 'idle' && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 1 }}
          style={{
            position: "absolute", top: 0, left: 0, width: "50%", height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
            transform: "skewX(-20deg)"
          }}
        />
      )}

      {/* Button Content */}
      <AnimatePresence mode="wait">
        {btnState === 'loading' ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <SoftTruck isMoving={true} color="#fff" />
            <span>On our way...</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <span>Proceed to Buy</span>
            {/* Parked Truck */}
            <div style={{ transform: "scale(0.9)" }}>
              <SoftTruck isMoving={false} color="#fff" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default function Cart() {
  const { cart, updateQty, removeItem } = useCart()
  const router = useRouter()

  /* 📏 RESPONSIVE */
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 860)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  /* 💰 CALCULATIONS */
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const totalQty = cart.reduce((s, i) => s + i.qty, 0)

  // Savings logic
  const MRP_MAP = { "200": 160, "500": 330, "1000": 569, "2000": 1049 }
  const totalSavings = cart.reduce((s, i) => {
    const mrp = MRP_MAP[i.variant] || i.price
    return s + (mrp - i.price) * i.qty
  }, 0)

  const freeDelivery = totalQty >= 2

  /* 🪙 WALLET LOGIC */
  const [wallet, setWallet] = useState(null)
  const [redeemCoins, setRedeemCoins] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const u = JSON.parse(storedUser)
      setUser(u)
      // Fetch Wallet
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/user/wallet/${u.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setWallet(data)
        })
        .catch(err => console.error("Wallet fetch error:", err))
    }
  }, [])

  // Calculate Redeemable
  const COIN_VALUE = 0.8 // 1 Coin = 0.8 Rs
  const maxRedeemableCoins = wallet ? Math.min(wallet.balance, Math.floor((subtotal * 0.30) / COIN_VALUE)) : 0
  const canRedeem = wallet && wallet.balance >= 100 && maxRedeemableCoins >= 100

  const coinDiscount = (redeemCoins && canRedeem) ? Math.floor(maxRedeemableCoins * COIN_VALUE) : 0
  const finalPayable = subtotal - coinDiscount

  /* 💾 PERSIST SELECTION */
  useEffect(() => {
    if (redeemCoins && canRedeem) {
      localStorage.setItem('redeemCoins', maxRedeemableCoins)
    } else {
      localStorage.removeItem('redeemCoins')
    }
  }, [redeemCoins, maxRedeemableCoins, canRedeem])

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.page}
    >
      <div style={styles.container}>
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={styles.title}
        >
          Your Cart <span style={styles.count}>({totalQty} items)</span>
        </motion.h1>

        {cart.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={isMobile ? styles.mobileGrid : styles.grid}>

            {/* 📦 LEFT COLUMN: ITEMS */}
            <div style={styles.itemsColumn}>
              <AnimatePresence>
                {cart.map((item, i) => (
                  <motion.div
                    layout
                    key={item.variant}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      ...styles.itemCard,
                      ...(isMobile ? {
                        display: "grid",
                        gridTemplateColumns: "70px 1fr",
                        gap: "10px",
                        alignItems: "start",
                        padding: "16px"
                      } : {})
                    }}
                  >
                    {/* TRASH ICON (TOP RIGHT) */}
                    <button
                      onClick={() => removeItem(item.variant)}
                      style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 4, zIndex: 10 }}
                      title="Remove item"
                    >
                      <TrashWithLid />
                    </button>

                    {/* THUMBNAIL */}
                    <div style={{ ...styles.thumb, ...(isMobile ? { gridRow: "1 / span 2", height: 'auto', aspectRatio: '1/1' } : {}) }}>
                      <img
                        src={IMAGE_MAP[item.variant]}
                        alt={item.variant}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                      />
                      <div style={{ display: 'none', transform: 'scale(1.2)' }}>
                        <PacketIcon />
                      </div>
                    </div>

                    {/* DETAILS (Title, Badge, Price) */}
                    <div style={{ ...(isMobile ? { width: '100%', paddingRight: 24 } : { flex: 1, paddingRight: 24 }) }}>
                      <div style={styles.itemHeader}>
                        <h3 style={styles.itemName}>Kolhapuri Kanda Lasun Masala</h3>
                        <span style={styles.premiumBadge}>{item.variant === "1000" ? "1 kg" : item.variant === "2000" ? "2 kg" : item.variant + "g"}</span>
                      </div>

                      {item.variant === "2000" && (
                        <span style={styles.bestValue}>
                          <StarIcon /> Best Value Family Pack
                        </span>
                      )}

                      <div style={styles.priceRow}>
                        <span style={styles.price}>₹{item.price * item.qty}</span>
                        <span style={styles.unitPrice}>(₹{item.price} × {item.qty})</span>
                      </div>
                    </div>

                    {/* ACTIONS (Qty Control) - Stacked below details on mobile */}
                    <div style={{ ...(isMobile ? { gridColumn: "2", marginTop: 4 } : styles.actions) }}>
                      <div style={styles.qtyControl}>
                        <button onClick={() => updateQty(item.variant, item.qty - 1)} style={styles.qtyBtn}>−</button>
                        <span style={styles.qtyVal}>{item.qty}</span>
                        <button onClick={() => updateQty(item.variant, item.qty + 1)} style={styles.qtyBtn}>+</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* 🧾 RIGHT COLUMN: SUMMARY */}
            <div style={styles.summaryColumn}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={styles.summaryCard}
              >
                <h3 style={styles.summaryTitle}>Order Summary</h3>

                <div style={styles.summaryRow}>
                  <span>Subtotal</span>
                  <b>₹{subtotal}</b>
                </div>

                {totalSavings > 0 && (
                  <div style={styles.summaryRowSaving}>
                    <span>Total Savings</span>
                    <b>- ₹{totalSavings}</b>
                  </div>
                )}

                <div style={styles.summaryRow}>
                  <span>Delivery</span>
                  <span style={{ color: freeDelivery ? '#2E7D32' : 'inherit' }}>
                    {freeDelivery ? "FREE" : "Calc at checkout"}
                  </span>
                </div>

                {/* 🪙 WALLET TOGGLE */}
                {user && wallet && (
                  <div style={styles.walletSection}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 18 }}>🪙</span>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#333' }}>Kasturi Coins</p>
                        <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Balance: {wallet.balance}</p>
                      </div>
                    </div>

                    {wallet.balance < 100 ? (
                      <p style={{ fontSize: 11, color: '#999', margin: 0 }}>Min 100 coins required to redeem.</p>
                    ) : (
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={redeemCoins}
                          onChange={(e) => setRedeemCoins(e.target.checked)}
                          disabled={!canRedeem}
                        />
                        <span>Use {maxRedeemableCoins} coins (Save ₹{Math.floor(maxRedeemableCoins * 0.8)})</span>
                      </label>
                    )}

                    {!canRedeem && wallet.balance >= 100 && (
                      <p style={{ fontSize: 11, color: '#C02729', margin: '4px 0 0' }}>Max redeemable is 30% of cart.</p>
                    )}
                  </div>
                )}

                {coinDiscount > 0 && (
                  <div style={styles.summaryRowSaving}>
                    <span>Coin Discount</span>
                    <b>- ₹{coinDiscount}</b>
                  </div>
                )}

                <div style={styles.divider} />

                <div style={styles.totalRow}>
                  <span>To Pay</span>
                  <span>₹{finalPayable}</span>
                </div>
                <p style={styles.gstText}>Inclusive of all taxes</p>

                {/* CHECKOUT BUTTON (Replaced AnimatedCheckoutButton) */}
                {!isMobile && (
                  <AnimatedCheckoutButton style={styles.checkoutBtn} />
                )}

                {/* TRUST BADGES */}
                <div style={styles.trustGrid}>
                  <div style={styles.trustItem}>
                    <ShieldIcon /> <span style={{ fontSize: 12 }}>Secure</span>
                  </div>
                  <div style={styles.trustItem}>
                    <TruckIcon /> <span style={{ fontSize: 12 }}>Fast Ship</span>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        )}
      </div>

      {/* 📱 MOBILE STICKY FOOTER */}
      {isMobile && cart.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          style={styles.stickyBar}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 18, fontWeight: '800' }}>₹{finalPayable}</span>
            <span style={{ fontSize: 11, opacity: 0.7 }}>Total Inc. GST</span>
          </div>
          {/* Animated Checkout Button Mobile */}
          <div style={{ width: 'fit-content' }}>
            <AnimatedCheckoutButton style={styles.stickyCheckout} />
          </div>
        </motion.div>
      )}
    </motion.main>
  )
}

/* 🕸️ EMPTY STATE COMPONENT */
function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", opacity: 0.8 }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ fontSize: 60, marginBottom: 20 }}
      >
        🛒
      </motion.div>
      <h2 style={{ marginBottom: 10 }}>Your cart is empty</h2>
      <p style={{ marginBottom: 30 }}>Looks like you haven't added any spices yet.</p>
      <Link href="/product">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={styles.checkoutBtn}
        >
          Start Shopping
        </motion.button>
      </Link>
    </div>
  )
}

/* 🎨 STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #F9F7F2, #F0EBE0)", // Subtle parchment gradient
    paddingTop: 40,
    paddingBottom: 120, // Space for mobile sticky
    fontFamily: "'Inter', sans-serif"
  },
  container: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "0 20px"
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 32,
    color: "#2D2A26",
    display: "flex",
    alignItems: "center",
    gap: 10
  },
  count: {
    fontSize: 16,
    fontWeight: 500,
    color: "#666",
    marginTop: 4
  },

  /* GRID SYSTEM */
  grid: {
    display: "grid",
    gridTemplateColumns: "1.6fr 1fr",
    gap: 40,
    alignItems: "start"
  },
  mobileGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 24
  },

  /* ITEM CARD */
  itemsColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  itemCard: {
    background: "#fff",
    borderRadius: 20,
    padding: 20,
    display: "flex",
    gap: 20,
    alignItems: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)", // Soft premium shadow
    border: "1px solid rgba(0,0,0,0.03)",
    position: "relative",
    overflow: "hidden"
  },
  thumb: {
    width: 70,
    height: 70,
    background: "#f5f5f5",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: 'hidden'
  },
  itemHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 4
  },
  itemName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#2D2A26",
    margin: 0
  },
  premiumBadge: {
    border: "1px solid #D4AF37", // Gold outline
    color: "#8A6D3B",
    background: "rgba(212, 175, 55, 0.1)",
    fontSize: 11,
    padding: "3px 10px",
    borderRadius: 99,
    fontWeight: 600,
    letterSpacing: "0.5px"
  },
  bestValue: {
    fontSize: 11,
    color: "#D97706",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
    background: "#FFFBEB",
    padding: "4px 8px",
    borderRadius: 6,
    width: "fit-content"
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 8
  },
  price: {
    fontSize: 16,
    fontWeight: 700,
    color: "#C02729"
  },
  unitPrice: {
    fontSize: 13,
    color: "#888",
    fontWeight: 500
  },

  /* ACTIONS */
  actions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 12
  },
  qtyControl: {
    display: "flex",
    alignItems: "center",
    background: "#F5F5F5",
    borderRadius: 99,
    padding: "2px",
    gap: 2
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "1px solid rgba(0,0,0,0.1)",
    background: "#fff",
    color: "#333",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease"
  },
  qtyVal: {
    minWidth: 24,
    textAlign: "center",
    fontSize: 14,
    fontWeight: 600
  },
  removeBtn: {
    background: "transparent",
    border: "none",
    color: "#999",
    cursor: "pointer",
    padding: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s"
  },

  /* SUMMARY CARD */
  summaryColumn: {
    position: 'sticky',
    top: 100
  },
  summaryCard: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    borderRadius: 24,
    padding: 30,
    boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
    border: "1px solid rgba(255,255,255,0.4)"
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 800,
    marginBottom: 24
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
    fontSize: 15,
    color: "#555"
  },
  summaryRowSaving: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
    fontSize: 14,
    color: "#166534",
    background: "rgba(22, 101, 52, 0.08)",
    border: "1px solid rgba(22, 101, 52, 0.15)",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 600
  },
  divider: {
    height: 1,
    background: "rgba(0,0,0,0.06)",
    margin: "20px 0"
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 22,
    fontWeight: 800,
    color: "#1a1a1a",
    marginBottom: 6
  },
  gstText: {
    textAlign: "right",
    fontSize: 12,
    color: "#999",
    marginBottom: 24
  },
  checkoutBtn: {
    width: "100%",
    padding: "16px",
    background: "#C02729",
    color: "white",
    fontSize: 16,
    fontWeight: 700,
    border: "none",
    borderRadius: 16,
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(192, 39, 41, 0.2)"
  },

  trustGrid: {
    marginTop: 24,
    display: "flex",
    justifyContent: "center",
    gap: 20,
    opacity: 0.6
  },
  trustItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 500
  },

  /* MOBILE STICKY */
  stickyBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(12px)",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
    borderTop: "1px solid rgba(0,0,0,0.05)",
    zIndex: 100,
    boxSizing: 'border-box', // Fix overflow
    width: '100%' // Ensure full width
  },
  stickyCheckout: {
    background: "#C02729",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: 99,
    fontSize: 15,
    fontWeight: 700
  }
}
