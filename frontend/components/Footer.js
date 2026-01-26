import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"
import GoogleReviewBadge from "./GoogleReviewBadge"

const INSTAGRAM_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
)

const FACEBOOK_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
)

const WHATSAPP_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
)

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  return (
    <footer style={styles.footer}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        style={{
          // Removed undefined glass style
          padding: isMobile ? "60px 24px 20px" : "80px 48px 20px"
        }}
      >
        {/* GRID */}
        <div
          style={{
            ...styles.grid,
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "2fr 1fr 1fr 1fr",
            gap: isMobile ? "32px 16px" : 60,
            textAlign: isMobile ? "left" : "left",

            /* DESKTOP CENTERING */
            maxWidth: isMobile ? "100%" : 1200,
            margin: isMobile ? "0" : "0 auto"
          }}
        >
          {/* BRAND */}
          <motion.div
            variants={itemVariants}
            style={{
              ...styles.brandBlock,
              gridColumn: isMobile ? "1 / -1" : "auto",
              textAlign: isMobile ? "center" : "left",
              margin: isMobile ? "0 auto" : "0"
            }}
          >
            <motion.img
              src="/images/brand/kasturi-logo-red.png"
              alt="Kasturi Masale"
              onClick={scrollToTop}
              title="Scroll to Top"
              style={{
                width: 180,
                marginBottom: 24,
                cursor: "pointer",
                ...(isMobile && { margin: "0 auto 24px" })
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
            />

            <p style={styles.mission}>
              Bringing the authentic, fiery taste of Kolhapur to your kitchen. Hand-pounded, pure, and filled with love.
            </p>

            <p style={styles.address}>
              Gawaliwada Lane, Yavaluj<br />
              Panhala, Kolhapur 416205
            </p>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <GoogleReviewBadge />
            </div>
          </motion.div>

          {/* SHOP */}
          <motion.div variants={itemVariants} style={styles.col}>
            <h4 style={styles.heading}>Shop & Learn</h4>
            <ActionLink href="/product">All Products</ActionLink>
            <ActionLink href="/about">About Us</ActionLink>
            <ActionLink href="/wholesale">Bulk Orders</ActionLink>
          </motion.div>

          {/* SUPPORT */}
          <motion.div variants={itemVariants} style={styles.col}>
            <h4 style={styles.heading}>Support</h4>
            <ActionLink href="/contact">Contact Us</ActionLink>
            <ActionLink href="/shipping">Shipping Policy</ActionLink>
            <ActionLink href="/refund">Refunds</ActionLink>
            <ActionLink href="/privacy">Privacy</ActionLink>
            <ActionLink href="/terms">Terms & Conds</ActionLink>
            <ActionLink href="/accessibility">Accessibility</ActionLink>
          </motion.div>

          {/* CONNECT */}
          <motion.div
            variants={itemVariants}
            style={{
              ...styles.col,
              gridColumn: isMobile ? "1 / -1" : "auto",
              alignItems: isMobile ? "center" : "flex-start",
              textAlign: isMobile ? "center" : "left"
            }}
          >
            <h4 style={styles.heading}>Connect</h4>

            <div style={{ ...styles.socialRow, justifyContent: isMobile ? "center" : "flex-start" }}>
              <SocialBtn href="https://instagram.com">{INSTAGRAM_ICON}</SocialBtn>
              <SocialBtn href="https://facebook.com">{FACEBOOK_ICON}</SocialBtn>
              <SocialBtn href="https://wa.me/917737379292">{WHATSAPP_ICON}</SocialBtn>
            </div>

            <a href="mailto:support@kasturimasale.in" style={styles.emailLink}>
              support@kasturimasale.in
            </a>
            <a href="tel:+917737379292" style={styles.phoneLink}>
              +91 77373 79292
            </a>
          </motion.div>

        </div>

        <motion.div variants={itemVariants} style={styles.divider} />

        {/* BOTTOM BAR */}
        <motion.div
          variants={itemVariants}
          style={{
            ...styles.bottomBar,
            maxWidth: isMobile ? "100%" : 1200,
            margin: "0 auto"
          }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            whileHover={{ letterSpacing: "0.5px", color: "#C02729" }}
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#2D2A26"
            }}
          >
            © 2024 by Kasturi Masale, a product of The Spice Emperor
          </motion.span>

          <span style={styles.madeWith}>Made with ❤️ in Kolhapur</span>
        </motion.div>
      </motion.div>
    </footer>
  )
}

/* COMPONENTS */

function ActionLink({ href, children }) {
  return (
    <Link href={href} legacyBehavior>
      <motion.a
        style={styles.link}
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        <motion.span
          variants={{
            rest: { x: 0, color: "#5D5A56" },
            hover: { x: 2, color: "#B1121B" }
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {children}
        </motion.span>
        <motion.span
          variants={{
            rest: { opacity: 0, x: -5 },
            hover: { opacity: 1, x: 5 }
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ marginLeft: 4, display: "inline-block", color: "#B1121B", fontWeight: "bold" }}
        >
          →
        </motion.span>
      </motion.a>
    </Link>
  )
}

function SocialBtn({ href, children }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={styles.socialBtn}
      whileHover={{ y: -5, backgroundColor: "#B1121B", color: "#fff" }}
      whileTap={{ scale: 0.9 }}
    >
      {children}
    </motion.a>
  )
}

/* STYLES */

const styles = {
  footer: {
    background: "#FDFBF7", // Warm Porcelain
    color: "#2D2A26",
    borderTop: "1px solid rgba(0,0,0,0.06)",
    position: "relative",
    overflow: "hidden"
  },
  grid: {
    display: "grid"
  },
  brandBlock: {
    maxWidth: 320
  },
  mission: {
    fontSize: 16,
    lineHeight: 1.7,
    color: "#5D5A56",
    fontFamily: "var(--font-body)"
  },
  address: {
    fontSize: 15,
    marginTop: 16,
    color: "#8D7B6F",
    lineHeight: 1.6,
    fontFamily: "var(--font-body)"
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: 14
  },
  heading: {
    fontWeight: 700,
    marginBottom: 16,
    fontFamily: "var(--font-heading)",
    fontSize: 20,
    letterSpacing: "0.02em"
  },
  socialRow: {
    display: "flex",
    gap: 14,
    marginBottom: 20
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(45, 42, 38, 0.1)",
    color: "#2D2A26",
    transition: "all 0.3s ease",
    cursor: "pointer"
  },
  link: {
    textDecoration: "none",
    color: "#5D5A56",
    fontSize: 16,
    fontFamily: "var(--font-body)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center"
  },
  emailLink: {
    marginTop: 8,
    display: "block",
    textDecoration: "none",
    color: "#2D2A26",
    fontWeight: 600,
    fontSize: 16,
    cursor: "pointer"
  },
  phoneLink: {
    marginTop: 4,
    display: "block",
    textDecoration: "none",
    color: "#2D2A26",
    fontWeight: 600,
    fontSize: 16,
    cursor: "pointer"
  },
  divider: {
    height: 1,
    background: "rgba(0,0,0,0.06)",
    margin: "60px 0 32px"
  },
  bottomBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    paddingBottom: 32
  },
  madeWith: {
    fontSize: 14,
    color: "#8D7B6F",
    fontFamily: "var(--font-body)"
  }
}
