import Link from "next/link"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "../context/CartContext"
import Image from "next/image" // Added Image import
import Header from "../components/Header" // Assuming Header component


/* ================= ICONS (PREMIUM SVG) ================= */

const TruckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
    <line x1="16" y1="8" x2="20" y2="8"></line>
    <line x1="16" y1="11" x2="20" y2="11"></line>
    <path d="M16 16h2a2 2 0 0 0 2-2v-4"></path>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
)

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
)

const BankIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
    <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path>
  </svg>
)

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
)

const BowlIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path>
    <line x1="6" y1="17" x2="18" y2="17"></line>
  </svg>
)

/* ================= DATA ================= */

const COPY = {
  en: {
    title: "“Packet khulte hi jo khushboo aaye — wahi asli masala hota hai.”",
    desc:
      "Pounded in small batches. Only 312 packs from this cycle."
  }
}

const PRICE_MAP = {
  "200": 120,
  "500": 280,
  "1000": 499,
  "2000": 899
}

const MRP_MAP = {
  "200": 140,
  "500": 330,
  "1000": 569,
  "2000": 1049
}

const IMAGE_MAP = {
  "200": "/images/products/kanda-lasun-200.png",
  "500": "/images/products/kanda-lasun-500.png",
  "1000": "/images/products/kanda-lasun-1000.png",
  "2000": "/images/products/kanda-lasun-2000.png"
}

/* ================= COMPONENT ================= */

import SoftTruck from "../components/SoftTruck"
import PremiumShort from "../components/PremiumShort"

import Head from "next/head"

export default function Product() {
  const t = COPY.en
  const { addToCart, cart } = useCart()
  // const { triggerLoading } = useTruck() // Removed Global Truck

  const [variant, setVariant] = useState("500")
  const [isMobile, setIsMobile] = useState(false)
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // 🌟 Scarcity Counter
  const [stock, setStock] = useState(84)
  useEffect(() => {
    // Randomize slightly on load
    setStock(Math.floor(Math.random() * (89 - 80 + 1)) + 80)

    // Decrease every hour (simulated) - or just static for now as requested "automatically change after 1hr"
    // For demo, let's just keep it high.
  }, [])

  const price = PRICE_MAP[variant]
  const mrp = MRP_MAP[variant]
  const save = mrp - price

  // 🌟 Coin Calculation
  const coinsEarned = Math.floor(price * 0.05)
  const coinValue = Math.floor(coinsEarned * 0.8)

  const handleAddToCart = async () => {
    if (loading || added) return
    setLoading(true)

    try {
      // Local Soft Truck Animation Time
      setTimeout(() => {
        addToCart(variant, price)
        setAdded(true)
        setLoading(false)
        setTimeout(() => setAdded(false), 2000)
      }, 1200) // 1.2s for truck to drive

    } catch (error) {
      console.error("Add to cart failed:", error)
      setLoading(false)
    }
  }

  /* ANIMATION VARIANTS */
  const btnVariants = {
    idle: { scale: 1, backgroundColor: "#B1121B" },
    tap: { scale: 0.98, transition: { duration: 0.05, ease: "linear" } },
    hover: { scale: 1, backgroundColor: "#8E0E15", transition: { duration: 0.1 } }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  }

  /* 📱 MOBILE STICKY LOGIC */
  const [showSticky, setShowSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after 600px (approx hero height), Hide near bottom (Footer)
      const scrollY = window.scrollY
      const bodyHeight = document.body.scrollHeight
      const windowHeight = window.innerHeight

      // Logic: Show if scrolled past Hero AND not near footer
      if (scrollY > 600 && (scrollY + windowHeight < bodyHeight - 400)) {
        setShowSticky(true)
      } else {
        setShowSticky(false)
      }
    }

    if (isMobile) {
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [isMobile])

  return (
    <main style={styles.page}>
      <Head>
        <title>Buy Kolhapuri Kanda Lasun Masala | Kasturi Masale</title>
        {/* ... meta tags ... */}
      </Head>
      <div style={isMobile ? styles.containerMobile : styles.container}>

        {/* IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            ...styles.imageContainer,
            ...(isMobile ? styles.imageContainerMobile : {})
          }}
        >
          {/* ... Image Logic (Unchanged) ... */}
          <motion.div
            key={variant}
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            whileHover={{ scale: 1.05, rotate: 2, transition: { duration: 0.3 } }}
            style={isMobile ? { ...styles.imageBox, width: "100%", height: "auto" } : styles.imageBox}
          >
            <div style={styles.softBackdrop} />
            <motion.img
              src={IMAGE_MAP[variant]}
              alt="Product"
              style={styles.productImage}
            />
          </motion.div>
        </motion.div>

        {/* CONTENT */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          <motion.h1 variants={fadeInUp} style={styles.title}>{t.title}</motion.h1>

          <motion.p variants={fadeInUp} style={styles.rtb}>
            Traditionally pounded • Small-batch • Zero palm oil
          </motion.p>

          {/* 🌟 SCARCITY (Premium, Calm) */}
          <motion.p variants={fadeInUp} style={styles.scarcityText}>
            Only <b>{stock} fresh packs</b> available today. Next batch in 48 hours.
          </motion.p>

          <motion.p variants={fadeInUp} style={styles.handmade}>
            Small-batch prepared to ensure freshness.
          </motion.p>

          {/* PRICE CARD */}
          <motion.div variants={fadeInUp} style={styles.priceCard}>
            {/* ... Price Logic (Unchanged) ... */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={styles.price}>₹{price}</span>
              <span style={styles.mrp}>₹{mrp}</span>
            </div>
            {/* ... Savings etc ... */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: "wrap" }}>
              <span style={styles.saveBadge}>
                <span style={{ marginRight: 4 }}>🟢</span> Save ₹{save}
              </span>
            </div>
            <div style={styles.gstCompact}>Inclusive of all taxes</div>
            {/* Free Ship Nudge */}
            <div style={{ marginTop: 8, fontSize: 12, color: "#166534", fontWeight: 600 }}>
              ✓ Free shipping on orders above ₹500
            </div>
          </motion.div>

          {/* VARIANTS GRID */}
          <motion.div variants={fadeInUp} style={isMobile ? styles.variantsGridMobile : styles.variantsGrid}>
            {Object.keys(PRICE_MAP).map(v => {
              const isActive = variant === v
              const p = PRICE_MAP[v]
              const per100g = Math.round(p / (parseInt(v) / 100))
              const VARIANT_INFO = {
                "200": { label: "Trial Pack", weight: "200g" },
                "500": { label: "Most Popular", weight: "500g" },
                "1000": { label: "Best Value", weight: "1kg" },
                "2000": { label: "Family Pack", weight: "2kg", tag: "VALUE FOR MONEY" }
              }
              const info = VARIANT_INFO[v]
              return (
                <motion.div
                  key={v}
                  onClick={() => setVariant(v)}
                  animate={{
                    borderColor: isActive ? "#B1121B" : "rgba(0,0,0,0.08)",
                    backgroundColor: isActive ? "#fff" : "rgba(255,255,255,0.4)"
                  }}
                  style={{ ...styles.variantCard, borderWidth: 2, borderStyle: "solid", position: "relative" }}
                >
                  {info.tag && <div style={styles.valueTag}>{info.tag}</div>}
                  <div style={styles.variantHeader}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#2D2A26" }}>{info.label}</span>
                    <span style={{ fontSize: 13, color: "#8D7B6F" }}>({info.weight})</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: isActive ? "#B1121B" : "#2D2A26", marginTop: 4 }}>₹{p}</div>
                  <div style={{ fontSize: 11, color: "#8D7B6F", marginTop: 4 }}>₹{per100g} / 100g</div>
                  {isActive && <motion.div layoutId="selectedRing" style={styles.selectedRing} />}
                </motion.div>
              )
            })}
          </motion.div>

          {/* PREMIUM SHORT STORY */}
          <motion.div variants={fadeInUp}>
            <PremiumShort />
          </motion.div>

          {/* 🌿 SENSORY TRIGGER LINE */}
          <motion.p variants={fadeInUp} style={styles.sensoryLine}>
            “One spoon and you’ll smell real Kolhapur.”
          </motion.p>

          {/* MAIN ADD TO CART */}
          <motion.button
            variants={btnVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
            onClick={handleAddToCart}
            disabled={loading}
            style={{
              ...styles.addToCart,
              cursor: loading ? "wait" : "pointer",
              overflow: "hidden",
              position: "relative"
            }}
          >
            {/* Main CTA Content (Unchanged) */}
            <AnimatePresence mode="wait">
              {loading ? (
                <span key="loading" style={{ color: '#fff' }}>Adding to Bag...</span>
              ) : added ? (
                <span key="success" style={{ color: '#fff' }}>✓ Added to Bag</span>
              ) : (
                <span key="idle">Get Today’s Fresh Batch →</span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* TRUST / GUARANTEE COPY REFINED */}
          <motion.p variants={fadeInUp} style={styles.guarantee}>
            Not satisfied with taste? We’ll refund you. No questions asked.
          </motion.p>

          {/* SOCIAL PROOF */}
          <motion.p variants={fadeInUp} style={styles.socialProof}>
            <span style={styles.stars}>★★★★★</span> Trusted by 300+ families every month in kolhapur
          </motion.p>

          {/* TRUST GRID */}
          <motion.div variants={fadeInUp} style={styles.trustGrid}>
            <TrustItem icon={<TruckIcon />} title="Ships from Kolhapur" sub="in 24–48 hrs" />
            <TrustItem icon={<ShieldIcon />} title="Secure checkout" sub="No hidden charges" />
            <TrustItem icon={<BankIcon />} title="COD & GST included" sub="Pay on delivery" />
            <TrustItem icon={<WhatsAppIcon />} title="Order updates" sub="via WhatsApp" />
          </motion.div>

          {/* USAGE BOX */}
          <motion.div variants={fadeInUp} style={styles.usageBox}>
            {/* ... Usage Content ... */}
            <span style={styles.usageTitle}><BowlIcon /> Perfect for:</span>
            <p style={styles.usageText}>Kolhapuri Chicken/mutton · Misal · Bharli Vangi · Daily sabzi</p>
          </motion.div>

          {/* VIEW CART (Appears only after adding) */}
          <AnimatePresence>
            {(added || cart.length > 0) && (
              <Link href="/cart" style={{ textDecoration: 'none' }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{
                    ...styles.goCart,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: 2,
                      ease: "linear",
                      repeatDelay: 1
                    }}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "50%",
                      height: "100%",
                      background: "linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent)",
                      transform: "skewX(-20deg)",
                      zIndex: 0
                    }}
                  />
                  <span style={{ position: "relative", zIndex: 1, letterSpacing: "0.5px" }}>
                    Checkout Now →
                  </span>
                </motion.div>
              </Link>
            )}
          </AnimatePresence>

          {/* ABOUT SECTION */}
          <motion.div variants={fadeInUp} style={styles.aboutSection}>
            {/* ... About details ... */}
            <div style={styles.aboutHeader}>ABOUT THIS PRODUCT</div>
            <p style={styles.aboutDesc}>Authentic Kolhapuri flavour...</p>
            <div style={styles.freshnessPromise}>
              <span>⚡</span><span>Freshly prepared and delivered within <b>4–5 days</b>.</span>
            </div>
            {/* ... */}
          </motion.div>

        </motion.div >
      </div >

      {/* 📱 MOBILE STICKY CTA BAR */}
      <AnimatePresence>
        {isMobile && showSticky && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }} // Fast & Premium
            style={styles.stickyBar}
          >
            <div>
              <div style={styles.stickyLabel}>Kanda Lasun Masala ({variant === "1000" ? "1kg" : variant + "g"})</div>
              <div style={styles.stickyPrice}>₹{price}</div>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={loading}
              style={{
                ...styles.stickyBtn,
                background: added ? "#166534" : "#B1121B",
              }}
            >
              {loading ? "..." : added ? "Added" : "Add to Cart"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </main >
  )
}

// ... Icons / Helper components ...


function TrustItem({ icon, title, sub }) {
  return (
    <div style={styles.trustItem}>
      <div style={styles.iconWrap}>{icon}</div>
      <div>
        <div style={styles.trustTitle}>{title}</div>
        <div style={styles.trustSub}>{sub}</div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    background: "var(--color-cream)",
    minHeight: "100vh",
    padding: 24,
    fontFamily: "var(--font-primary)",
    color: "var(--color-text-dark)",
    paddingBottom: 100 // Extra space for sticky
  },
  // ... Keep existing containers ...
  container: { maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, paddingTop: 40, alignItems: 'start' },
  containerMobile: { maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28, paddingBottom: 40 },

  // ... Keep existing image styles ...
  imageContainer: { position: "sticky", top: 40, display: "flex", justifyContent: "center", width: "100%" },
  imageContainerMobile: { position: "relative", top: 0, marginBottom: 20 },
  imageBox: { width: 500, height: 500, maxWidth: "100%", aspectRatio: "1/1", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" },
  softBackdrop: { position: "absolute", width: "120%", height: "120%", background: "radial-gradient(circle, rgba(255, 248, 225, 0.8) 0%, rgba(255, 248, 225, 0) 70%)", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 0, opacity: 0.08 },
  productImage: { width: "85%", height: "auto", objectFit: "contain", zIndex: 2, filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.3))" },

  title: { fontSize: 36, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" },
  rtb: { marginTop: 12, fontSize: 14, fontWeight: 600, color: "var(--color-brand-red)", letterSpacing: "0.5px" },

  scarcityText: {
    marginTop: 8,
    fontSize: 14,
    color: "#D97706", // Amber-600
    background: "#FFFBEB", // Amber-50
    padding: "8px 12px",
    borderRadius: 8,
    display: "inline-block",
    border: "1px solid #FEF3C7" // Amber-100
  },

  handmade: { marginTop: 8, fontSize: 13, letterSpacing: "1px", opacity: 0.7, textTransform: "uppercase", fontWeight: 600 },

  // ... Price Card & Variants (mostly same) ...
  priceCard: { marginTop: 24, padding: "24px", borderRadius: "16px", background: "#fff", border: "1px solid rgba(0,0,0,0.04)" },
  price: { fontSize: "clamp(2.5rem, 4vw, 3.5rem)", color: "var(--color-brand-red)", fontWeight: 800, lineHeight: 1 },
  mrp: { textDecoration: "line-through", opacity: 0.5, fontSize: 18, fontWeight: 500, marginBottom: 4 },
  saveBadge: { color: "#166534", fontWeight: 700, fontSize: 13, background: "#DCFCE7", padding: "6px 12px", borderRadius: 100 },
  gstCompact: { marginTop: 12, fontSize: 12, opacity: 0.5, fontStyle: "italic" },

  variantsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 32 },
  variantsGridMobile: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 32 },
  variantCard: { padding: "16px 8px", borderRadius: 16, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", transition: "all 0.2s" },
  variantHeader: { display: 'flex', alignItems: 'baseline', justifyContent: 'center', flexWrap: 'wrap' },
  valueTag: { position: "absolute", bottom: -8, background: "#E8F5E9", color: "#2E7D32", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, border: "1px solid #C8E6C9" },
  selectedRing: { position: "absolute", inset: -2, borderRadius: 18, border: "2px solid var(--color-brand-red)", pointerEvents: "none" },

  sensoryLine: {
    marginTop: 24,
    fontSize: 16,
    fontFamily: "var(--font-heading)",
    fontStyle: "italic",
    textAlign: "center",
    color: "#5D4037"
  },

  addToCart: {
    marginTop: 16,
    padding: 20,
    width: "100%",
    borderRadius: 20,
    background: "var(--color-brand-red)",
    color: "#fff",
    border: "none",
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
    height: 64,
    boxShadow: "0 10px 25px rgba(177, 18, 27, 0.25)"
  },

  guarantee: { marginTop: 16, fontSize: 13, fontWeight: 500, textAlign: "center", opacity: 0.7, color: "#555" },

  socialProof: { marginTop: 24, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 },
  stars: { color: "var(--color-gold)", letterSpacing: -2 },

  // Trust Grid
  trustGrid: { marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "rgba(255,255,255,0.6)", padding: 24, borderRadius: 16 },
  trustItem: { display: "flex", gap: 12 },
  trustTitle: { fontSize: 13, fontWeight: 700 },
  trustSub: { fontSize: 12, opacity: 0.7 },
  iconWrap: { color: "var(--color-brand-red)" },

  // ... Usage, About ...
  usageBox: { marginTop: 24, padding: 20, background: "#FFF8F2", borderRadius: 20, border: "1px dashed #E0C0A0" },
  usageTitle: { display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "var(--color-brand-red)", fontSize: 13 },
  usageText: { marginTop: 8, fontSize: 14, color: "#5D4037", fontWeight: 600 },

  goCart: {
    marginTop: 16,
    padding: 16,
    width: "100%",
    borderRadius: 20,
    background: "var(--gradient-dark)",
    color: "#fff",
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(45, 42, 38, 0.25)"
  },

  aboutSection: { marginTop: 32, background: "rgba(255,255,255,0.5)", padding: 24, borderRadius: 16 },
  aboutHeader: { fontSize: 12, fontWeight: 800, color: "#999", marginBottom: 12, letterSpacing: "1px" },
  aboutDesc: { fontSize: 15, lineHeight: 1.6, marginBottom: 16 },
  freshnessPromise: { display: "flex", gap: 8, fontSize: 14, color: "#166534", background: "#DCFCE7", padding: "10px", borderRadius: 6, marginBottom: 12 },

  // 📱 STICKY BAR STYLES
  stickyBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "72px", // Max height 72px
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(12px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    paddingBottom: "env(safe-area-inset-bottom, 20px)", // iOS Safe Area
    boxShadow: "0 -5px 20px rgba(0,0,0,0.1)",
    borderTop: "1px solid rgba(0,0,0,0.05)",
    zIndex: 999
  },
  stickyLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#555"
  },
  stickyPrice: {
    fontSize: 18,
    fontWeight: 800,
    color: "var(--color-brand-red)",
    lineHeight: 1
  },
  stickyBtn: {
    background: "#B1121B",
    color: "#fff",
    border: "none",
    padding: "10px 24px",
    borderRadius: 99,
    fontSize: 14,
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(177, 18, 27, 0.3)"
  }
}
