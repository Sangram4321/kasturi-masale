import React, { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import FloatingParticles from "./FloatingParticles"
import MagneticButton from "./MagneticButton"

export default function Hero() {
  const videoRef = useRef(null)
  // Smart Video Sources - REPLACE these paths when you have specific files!
  const VIDEO_PATHS = {
    mobile: "/images/hero/hero2/IMG_5046.MP4", // e.g. video-mobile.mp4
    tablet: "/images/hero/hero2/IMG_5046.MP4", // e.g. video-tablet.mp4
    desktop: "/images/hero/hero2/IMG_5046.MP4" // e.g. video-desktop.mp4
  }
  const [videoSrc, setVideoSrc] = useState(VIDEO_PATHS.desktop)

  useEffect(() => {
    // 1. SMART VIDEO LOADING LOGIC
    const handleResize = () => {
      const width = window.innerWidth
      let newSrc = VIDEO_PATHS.desktop

      if (width <= 600) {
        newSrc = VIDEO_PATHS.mobile
      } else if (width >= 768 && width < 992) {
        newSrc = VIDEO_PATHS.tablet
      } else {
        newSrc = VIDEO_PATHS.desktop
      }

      setVideoSrc(prev => {
        if (prev !== newSrc) return newSrc
        return prev
      })
    }

    // Initial check
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    // Ensure video plays when src changes
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch(e => console.log("Auto-play prevented:", e))
    }
  }, [videoSrc])

  return (
    <section className="hero-section">
      {/* 1. BACKGROUND VIDEO */}
      <video
        ref={videoRef}
        className="hero-video"
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        style={styles.bgVideo}
      />

      {/* 2. GRADIENT OVERLAY (Transparent Top -> Dark Bottom) */}
      <div style={styles.overlay} />

      {/* 2.5 PARTICLES TEXTURE */}
      <FloatingParticles count={20} />

      {/* 3. CONTENT CONTAINER */}
      <div style={styles.contentContainer}>
        <div className="textWrapper" style={styles.textWrapper}>

          {/* Eyebrow */}
          <motion.p
            style={styles.eyebrow}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            We make Kasturi Kanda Lasun Masala using time-honoured methods that preserve its authentic Kolhapuri taste.
          </motion.p>

          {/* Main Headline */}
          <motion.h1
            className="headline"
            style={styles.headline}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          >
            Market ke masale nahi. <br />
            Ghar jaisa Kanda Lasun.
          </motion.h1>

          {/* Subline */}
          <motion.p
            style={styles.subline}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 0.85, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Small-batch Kolhapuri masalas made fresh — <br className="mobile-break" />
            no palm oil, no added colours.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            style={{ marginTop: 32, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}
          >
            {/* Primary */}
            <Link href="/product" passHref style={{ textDecoration: 'none' }}>
              <div style={{ display: 'inline-block' }}>
                <MagneticButton>
                  Shop Kanda Lasun Masala
                </MagneticButton>
              </div>
            </Link>

            {/* Secondary */}
            <Link href="/about" passHref style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={styles.secondaryBtn}
              >
                Why Kasturi?
              </motion.button>
            </Link>
          </motion.div>

        </div>

        {/* 4. SCROLL INDICATOR - Hidden on mobile via CSS */}
        <motion.div
          className="scrollIndicator"
          style={styles.scrollIndicator}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7, y: [0, 10, 0] }}
          transition={{ delay: 2, duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div style={styles.mouseIcon}>
            <div style={styles.wheel} />
          </div>
          <span style={styles.scrollText}>SCROLL</span>
        </motion.div>

      </div>

      <style jsx>{`
      /* 🔹 STRICT BREAKPOINTS & HEIGHTS */
      .hero-section {
        position: relative;
      width: 100%;
      overflow: hidden;
      background: #1a0505;
      display: flex;
      align-items: flex-end;
      /* Default fallback */
      height: 100vh; 
        }

      /* PHONE ≤ 600px */
      @media (max-width: 600px) {
            .hero - section {
        height: 70vh !important;
            }
        }

      /* TABLET ≥ 768px */
      @media (min-width: 768px) {
            .hero - section {
        height: 85vh;
            }
        }

      /* LAPTOP ≥ 992px */
      @media (min-width: 992px) {
            .hero - section {
        height: 95vh;
            }
        }

      /* DESKTOP ≥ 1200px */
      @media (min-width: 1200px) {
            .hero - section {
        height: 100vh;
            }
        }

      .textWrapper {
        align - items: flex-start;
      text-align: left;
      margin-bottom: 5rem;
      margin-left: 5%;
        }
      .headline {
        font - size: clamp(3.5rem, 4vw, 5rem);
        }
      .scrollIndicator {
        display: flex;
        }

      @media (max-width: 768px) {
            .textWrapper {
        align - items: center !important;
      text-align: center !important;
      margin: 0 auto 48px auto !important; /* Bottom Safe Zone (32-48px) */
      width: 100% !important;
      max-width: 100% !important;
      padding: 0 16px !important; /* Horizontal Safe Zone (16px) */
      box-sizing: border-box !important;
            }
      .headline {
        font - size: clamp(2.25rem, 8vw, 3rem) !important; /* Fits 328px width cleanly */
      line-height: 1.15 !important;
            }
      .scrollIndicator {
        display: none !important;
            }
        }
      `}</style>
    </section >
  )
}

/* ================= STYLES ================= */
const styles = {
  // heroSection handled by CSS .hero-section for Strict Breakpoints

  bgVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: `
      linear-gradient(to bottom, rgba(43,26,20,0) 0%, rgba(43,26,20,0.2) 60%, rgba(43,26,20,0.8) 100%),
      linear-gradient(to right, rgba(43,26,20,1) 0%, rgba(43,26,20,0.8) 25%, rgba(43,26,20,0) 60%)
    `,
    zIndex: 1,
  },

  contentContainer: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    height: "100%",
    maxWidth: 1400,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    paddingBottom: "10vh",
    paddingLeft: "5vw",
    paddingRight: "5vw",
  },

  // Now handled by CSS class .textWrapper
  textWrapper: {
    display: "flex",
    flexDirection: "column",
    // Base styles (Desktop default or shared)
    maxWidth: "550px",
  },

  eyebrow: {
    fontFamily: "var(--font-body)",
    fontSize: "0.85rem",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
    maxWidth: "400px",
    lineHeight: "1.5"
  },

  // Handled by CSS class .headline
  headline: {
    fontFamily: "var(--font-heading)",
    fontWeight: 800, // Thicker
    lineHeight: 1.1,
    letterSpacing: "-0.03em", // Tighten for premium magazine feel
    color: "#fff", // Pure white
    marginBottom: 16,
    textShadow: "0 4px 20px rgba(0,0,0,0.6)", // Stronger shadow
  },

  subline: {
    fontFamily: "var(--font-body)",
    fontSize: "1rem",
    fontWeight: 400,
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 4,
  },

  ctaButton: {
    display: "inline-block",
    backgroundColor: "var(--color-brand-red)",
    color: "#fff",
    fontSize: "1.05rem", // slightly larger
    fontWeight: 600,
    padding: "16px 36px",
    borderRadius: "8px",
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
    cursor: "pointer",
  },

  secondaryBtn: {
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: 500,
    padding: "16px 32px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  scrollIndicator: {
    position: "absolute",
    bottom: "40px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex", // Will be overridden by media query
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    zIndex: 10,
  },
  mouseIcon: {
    width: 24,
    height: 36,
    border: "2px solid rgba(255,255,255,0.6)",
    borderRadius: 12,
    position: "relative",
  },
  wheel: {
    width: 2,
    height: 6,
    backgroundColor: "#fff",
    position: "absolute",
    top: 6,
    left: "50%",
    transform: "translateX(-50%)",
    borderRadius: 2,
  },
  scrollText: {
    fontSize: "0.65rem",
    letterSpacing: "0.2em",
    color: "rgba(255,255,255,0.6)",
    fontFamily: '"Inter", sans-serif',
  },
}
