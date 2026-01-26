import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useCart } from "../context/CartContext"
import translations from '../languages/translations'

/* 🔔 HAPTIC HELPER */
const haptic = (pattern = 10) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

/* 🔐 AUTH HELPERS */
const getUser = () => {
  if (typeof window === "undefined") return null
  const u = localStorage.getItem("user")
  return u ? JSON.parse(u) : null
}

const checkLogin = () => {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("auth")
}

/* 🛒 CART SVG ICON */
const CartIcon = ({ size = 24, strokeWidth = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

/* 👤 USER SVG ICON */
const UserIcon = ({ size = 20, strokeWidth = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

/* 📛 GET DISPLAY NAME */
const getDisplayName = (user) => {
  if (!user) return "Guest"
  if (user.name) return user.name.split(" ")[0] // First name
  if (user.email) return user.email.split("@")[0] // Handle before @
  return "User"
}

/* 🔹 ANIMATION VARIANTS */
const headerVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 20,
      mass: 0.8,
      staggerChildren: 0.1
    }
  }
}

const childVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  }
}

const menuVariants = {
  hidden: { opacity: 0, scale: 0.9, y: -20, transformOrigin: "top right" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { staggerChildren: 0.05, delayChildren: 0.05, type: "spring", stiffness: 200 }
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
}

const itemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: { opacity: 1, x: 0 }
}
export default function Header({ lang, setLang }) {
  const [open, setOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const t = translations[lang] || translations.en
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50 && !scrolled) setScrolled(true)
    else if (latest <= 50 && scrolled) setScrolled(false)
  })

  const router = useRouter()
  const { cart } = useCart()

  /* 🔄 SYNC LOGIN STATE */
  const [walletBalance, setWalletBalance] = useState(null)

  useEffect(() => {
    const sync = () => {
      const isIn = checkLogin()
      setLoggedIn(isIn)
      const u = isIn ? getUser() : null
      setUser(u)

      if (u) {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/user/wallet/${u.uid}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) setWalletBalance(data.balance)
          })
          .catch(e => console.error(e))
      }
    }
    sync()

    // Sync on route change (e.g. after login redirect)
    const handleRouteChange = () => {
      setOpen(false)
      sync()
    }

    // Custom event to force update (optional but robust)
    const handleAuthChange = () => sync()

    router.events.on("routeChangeComplete", handleRouteChange)
    window.addEventListener("auth-change", handleAuthChange)
    window.addEventListener("storage", handleAuthChange) // In case of multi-tab

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange)
      window.removeEventListener("auth-change", handleAuthChange)
      window.removeEventListener("storage", handleAuthChange)
    }
  }, [router.events])

  /* 🚪 LOGOUT */
  const handleLogout = () => {
    localStorage.removeItem("auth")
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    setLoggedIn(false)
    setUser(null)
    setOpen(false)
    router.push("/login")
  }

  const showCart =
    router.pathname === "/" ||
    router.pathname.startsWith("/product") ||
    router.pathname.startsWith("/cart")

  /* 🌍 ROUTE CHECK FOR HEADER STYLE */
  const isHome = router.pathname === "/"
  // Force "scrolled" look if not home OR if actually scrolled on home
  const isScrolled = scrolled || !isHome

  const totalQty = cart.reduce((s, i) => s + i.qty, 0)
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0)



  return (
    <div className="header-wrapper">
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="main-header"
        style={{
          ...styles.header,
          background: isScrolled ? "rgba(20, 20, 20, 0.4)" : "transparent",
          backdropFilter: isScrolled ? "blur(12px)" : "none",
          borderBottom: isScrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
          boxShadow: isScrolled ? "0 4px 30px rgba(0,0,0,0.1)" : "none",
        }}
      >
        {/* LANGUAGE SWITCHER (Desktop) */}


        {/* LOGO */}
        <motion.div variants={childVariants} className="logoWrapper">
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/images/kasturi-logo.png"
                alt="Kasturi Masale Logo"
                width={220}
                height={160}
                priority
                className="logoImage"
                style={{ objectFit: "contain" }}
              />
            </motion.div>
          </Link>
        </motion.div>

        {/* RIGHT ACTIONS */}
        <div className="rightActions">

          {/* DESKTOP */}
          <div className="desktopActions">
            {loggedIn ? (
              <motion.div variants={childVariants} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e0dcd0', fontSize: 13, fontWeight: 600 }}>
                  <UserIcon size={16} />
                  <span>Hi, {getDisplayName(user)}</span>
                </div>
                {walletBalance !== null && (
                  <Link href="/coins" style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,215,0,0.1)', padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(255,215,0,0.2)', cursor: 'pointer' }}>
                      <span>🪙</span>
                      <span style={{ color: '#FFD700', fontSize: 12 }}>{walletBalance}</span>
                    </div>
                  </Link>
                )}
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,80,80,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  style={{ ...styles.login, background: "transparent", border: "1px solid rgba(255,255,255,0.2)", padding: "6px 16px", fontSize: 13 }}
                >
                  Logout
                </motion.button>
              </motion.div>
            ) : (
              <motion.div variants={childVariants}>
                <Link href="/login" legacyBehavior>
                  <motion.a
                    whileHover={{ scale: 1.05, backgroundColor: "#8E0E15" }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    style={styles.login}
                  >
                    Login
                  </motion.a>
                </Link>
              </motion.div>
            )}

            {showCart && (
              <motion.div variants={childVariants} style={{ position: 'relative' }}>
                <Link href="/cart" style={{ textDecoration: "none" }}>
                  <motion.div
                    style={styles.cartBtn}
                    whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <CartIcon size={22} />
                    {totalQty > 0 && (
                      <motion.span
                        key={totalQty}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="cartBadge"
                        style={styles.desktopBadge}
                      >
                        {totalQty}
                      </motion.span>
                    )}
                    <span style={styles.cartTotal}>₹{totalPrice}</span>
                  </motion.div>
                </Link>
              </motion.div>
            )}
          </div>

          {/* MOBILE/TABLET */}
          <div className="mobileActions">
            {loggedIn ? (
              <motion.div variants={childVariants}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  style={{ ...styles.mobileLogin, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", display: 'flex', alignItems: 'center', gap: 6, padding: "6px 12px" }}
                >
                  <UserIcon size={14} />
                  Logout
                </motion.button>
              </motion.div>
            ) : (
              <motion.div variants={childVariants}>
                <Link href="/login" legacyBehavior>
                  <motion.a
                    whileHover={{ scale: 1.05, backgroundColor: "#8E0E15" }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    style={styles.mobileLogin}
                  >
                    Login
                  </motion.a>
                </Link>
              </motion.div>
            )}

            {showCart && (
              <motion.div variants={childVariants} style={{ position: 'relative' }}>
                <Link href="/cart">
                  <motion.div
                    style={styles.mobileCartBtn}
                    whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.12)" }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <CartIcon size={22} />
                    {totalQty > 0 && (
                      <motion.span
                        key={totalQty}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={styles.mobileBadge}
                      >
                        {totalQty}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            )}
          </div>

          {/* ☰ HAMBURGER */}
          <motion.button
            variants={childVariants}
            onClick={() => {
              haptic(15)
              setOpen(!open)
            }}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(247,239,219,0.12)" }}
            whileTap={{ scale: 0.9 }}
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={styles.hamburger}
          >
            {open ? "✕" : "☰"}
          </motion.button>
        </div>

        {/* RESPONSIVE CSS */}
        <style jsx>{`
          /* HEIGHT STABILITY */
          :global(.main-header) {
             height: 90px;
             transition: height 0.3s ease, background 0.3s ease;
          }
          :global(.main-header[style*="rgba(20, 20, 20, 0.4)"]) {
             height: 76px; 
          }
          
          /* Force Scrolled class logic via JS was better, but let's override for mobile */
          @media (max-width: 768px) {
             :global(.main-header) {
                height: 70px !important; /* Constant height on mobile to prevent jumps */
                padding: 0 16px !important;
             }
          }

          .rightActions {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .desktopActions {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .mobileActions {
            display: none;
            align-items: center;
            gap: 16px; /* Increased gap */
          }
          .logoWrapper {
             position: relative;
             cursor: pointer;
             display: flex;
             align-items: center;
          }

          @media (max-width: 768px) {
            .desktopActions {
              display: none;
            }
            .mobileActions {
              display: flex;
            }
            :global(.logoImage) {
              width: 130px !important; 
              height: auto !important;
            }
            .langSwitcher {
               position: absolute;
               left: 24px;
               display: flex;
               gap: 8px;
            }
            .desktop-only { display: flex; }
            
            @media (max-width: 1024px) {
               .desktop-only { display: none; }
            }
          }
        `}</style>
      </motion.header>

      {/* BACKDROP */}
      <AnimatePresence>
        {open && (
          <motion.div
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={styles.backdrop}
          />
        )}
      </AnimatePresence>

      {/* GLASS MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={styles.glassMenu}
          >
            <div style={styles.menuHeader}>
              <span style={styles.menuTitle}>Menu</span>
              <motion.button
                onClick={() => setOpen(false)}
                whileTap={{ scale: 0.9 }}
                style={styles.closeBtn}
              >
                ✕
              </motion.button>
            </div>


            <div style={styles.menuList}>


              <MenuItem href="/product" setOpen={setOpen}>{t.shop}</MenuItem>
              <MenuItem href="/orders" setOpen={setOpen}>{t.orders}</MenuItem>
              <MenuItem href="/about" setOpen={setOpen}>{t.about}</MenuItem>
              <MenuItem href="/why-kasturi" setOpen={setOpen}>{t.whyKasturi}</MenuItem>
              <MenuItem href="/contact" setOpen={setOpen}>{t.contactUs}</MenuItem>

              {!loggedIn && (
                <MenuItem href="/login" setOpen={setOpen}>Login</MenuItem>
              )}
            </div>
    // ...


            {loggedIn && (
              <motion.button
                layout
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,80,80,0.15)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                style={styles.logoutBtn}
              >
                Logout
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  )
}

/* MENU ITEM */
function MenuItem({ href, children, setOpen }) {
  return (
    <Link href={href} legacyBehavior>
      <a style={{ textDecoration: "none", color: "inherit" }}>
        <motion.div
          variants={itemVariants}
          whileHover={{ x: 8, backgroundColor: "rgba(255,255,255,0.08)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpen(false)}
          style={styles.menuItem}
        >
          {children}
          <span style={{ opacity: 0.5 }}>›</span>
        </motion.div>
      </a>
    </Link>
  )
}

/* STYLES */
const styles = {
  header: {
    padding: "0 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%", // Ensure full width for fixed
    zIndex: 100,
    // background removed here as it's handled inline for scroll logic
    // backdropFilter removed from here
    transition: "all 0.4s ease"
  },

  logoWrap: {
    position: 'relative',
    cursor: "pointer",
    display: "flex",
    alignItems: "center"
  },

  login: {
    background: "#C02729",
    color: "#fff",
    borderRadius: 99,
    padding: "10px 24px",
    fontWeight: 700,
    fontSize: 14,
    textDecoration: "none",
    letterSpacing: "0.5px",
    cursor: "pointer",
    userSelect: "none"
  },

  mobileLogin: {
    background: "#C02729",
    color: "#fff",
    borderRadius: 99,
    padding: "10px 20px",
    fontWeight: 700,
    fontSize: 13,
    textDecoration: "none",
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 2px 8px rgba(192, 39, 41, 0.2)"
  },

  userEmail: {
    color: "#e0dcd0",
    fontSize: 14,
    fontWeight: 600,
    opacity: 0.9
  },

  /* DESKTOP CART */
  cartBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#F7EFDB",
    padding: "8px 16px",
    borderRadius: 99,
    background: "rgba(255,255,255,0.05)",
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.08)"
  },

  cartTotal: {
    fontWeight: 600,
    fontSize: 14,
    letterSpacing: "0.5px"
  },

  desktopBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    background: "#C02729",
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    height: 18,
    minWidth: 18,
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
    padding: "0 4px"
  },

  /* MOBILE CART */
  mobileCartBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    color: "#F7EFDB",
    cursor: "pointer",
    position: "relative"
  },

  mobileBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    background: "#C02729",
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    height: 16,
    minWidth: 16,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
  },

  hamburger: {
    background: "rgba(255,255,255,0.08)", // Slight tint
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff", // White text for better visibility
    width: 44,
    height: 44,
    borderRadius: "50%",
    fontSize: 22,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 2,
    backdropFilter: "blur(4px)"
  },

  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 40,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)"
  },

  glassMenu: {
    position: "fixed",
    top: 16,
    right: 16,
    width: "calc(100% - 32px)",
    maxWidth: 320,
    background: "rgba(30,30,30, 0.95)",
    backdropFilter: "blur(24px)",
    borderRadius: 24,
    padding: "20px",
    zIndex: 200,
    boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: 20
  },

  menuHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 16,
    borderBottom: "1px solid rgba(255,255,255,0.1)"
  },

  menuTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 700
  },

  closeBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "#fff",
    width: 32,
    height: 32,
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: 14
  },

  menuList: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },

  menuItem: {
    padding: "16px 20px",
    background: "rgba(255,255,255,0.03)",
    color: "#F7EFDB",
    fontSize: 16,
    fontWeight: 500,
    cursor: "pointer",
    borderRadius: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  logoutBtn: {
    marginTop: 10,
    padding: "14px",
    width: "100%",
    border: "1px solid rgba(255,100,100,0.3)",
    background: "transparent",
    color: "#ff8080",
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 16,
    cursor: "pointer"
  }
}
