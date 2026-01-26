import Hero from "../components/Hero"
import Hero2 from "../components/Hero2"
import CurryVideoSection from "../components/CurryVideoSection"
import DailyOrders from "../components/DailyOrders"
import TrackingInput from "../components/TrackingInput"

import PremiumMarquee from "../components/PremiumMarquee"
import KasturiCoinsBlock from "../components/KasturiCoinsBlock"
import BrandStory from "../components/BrandStory"
import MasalaVideo from "../components/MasalaVideo"
import SocialProofStrip from "../components/SocialProofStrip"
import DifferentiationGrid from "../components/DifferentiationGrid"
import Guarantee from "../components/Guarantee"
import { motion } from "framer-motion"

const COPY = {
  en: {
    usp: [
      "Traditionally hand-pounded",
      "25+ masalas balanced perfectly",
      "Pure home-made Kolhapuri taste",
      "Selective chillies for aroma & colour"
    ]
  },

  hi: {
    usp: [
      "पारंपरिक तरीके से कूटा हुआ",
      "25+ मसालों का संतुलन",
      "एकदम घर जैसा स्वाद",
      "चुनिंदा मिर्चों का उपयोग"
    ]
  },

  mr: {
    usp: [
      "पारंपरिक पद्धतीने कुटलेले",
      "२५+ मसाल्यांचे संतुलन",
      "खरी घरगुती चव",
      "निवडक मिरच्यांचा वापर"
    ]
  }
}

export default function Home({ lang = "en" }) {
  const t = COPY[lang]

  return (
    <main style={styles.page}>
      {/* 🔥 HERO */}
      <Hero />

      {/* 🔍 TRACKING (New) */}
      <TrackingInput />

      {/* 🍛 CURRY VIDEO SECTION (New) */}
      <CurryVideoSection />

      {/* 📈 DAILY ORDERS (New) */}
      <DailyOrders />

      {/* ⭐ SOCIAL PROOF (New) */}
      <SocialProofStrip />

      {/* 🖼️ HERO 2 - GALLERY */}
      <Hero2 />

      {/* 🎞️ MARQUEE (New) */}
      <PremiumMarquee />

      {/* 🪙 KASTURI COINS (New) */}
      <KasturiCoinsBlock />

      {/* 🧡 BRAND STORY */}
      <BrandStory lang={lang} />

      {/* 🆚 DIFFERENTIATION (New) */}
      <DifferentiationGrid />

      {/* 🎥 MAKING VIDEO */}
      <MasalaVideo />

      {/* 🛡️ GUARANTEE (New) */}
      <Guarantee />

      {/* ⭐ USP — GLASS PREMIUM */}
      <section style={styles.uspWrap}>
        <div style={styles.uspGrid}>
          {t.usp.map((u, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1]
              }}
              style={styles.uspCard}
            >
              {u}
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}

/* ================= STYLES ================= */

const styles = {
  page: {
    background: "#F9F6F1", // Warm Porcelain (Matched with Globals)
    minHeight: "100vh",
    position: "relative"
  },

  uspWrap: {
    padding: "72px 16px 90px",
    position: "relative",
    zIndex: 1,
    background: "#FDFBF7" // Ensure background continuity
  },

  uspGrid: {
    maxWidth: 980,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 22
  },

  uspCard: {
    padding: "26px 22px",
    borderRadius: 22,

    /* GLASS EFFECT */
    background: "rgba(255,255,255,0.45)", // More transparent
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.3)",

    textAlign: "center",
    fontSize: 15,
    fontWeight: 500,
    color: "#1f1f1f",

    boxShadow:
      "0 20px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)"
  }
}

