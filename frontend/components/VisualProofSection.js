import React, { useRef, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function VisualProofSection() {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => { })
    }
  }, [])

  return (
    <motion.section
      className="vp-section"
      initial={{ scale: 0.96 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="vp-container">

        {/* VIDEO */}
        <motion.div
          className="vp-videoWrapper"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <video
            ref={videoRef}
            className="vp-video"
            src="/images/hero/hero2/kasturi-mutton-curry.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
        </motion.div>

        {/* CONTENT */}
        <motion.div
          className="vp-content"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2>
            Every Pinch Tells a <span>Flavor Story</span>.
          </h2>

          <p>
            Watch how a simple spoonful transforms ordinary mutton into a rich,
            aromatic Kolhapuri mastery. No artificial colors. Just pure, roasted
            spices releasing their natural oils.
          </p>

          <Link href="/product" legacyBehavior>
            <motion.a
              className="vp-cta"
              whileHover={{ scale: 1.05, backgroundColor: "#8E0E15" }}
              whileTap={{ scale: 0.97 }}
            >
              Experience The Difference
            </motion.a>
          </Link>
        </motion.div>
      </div>

      {/* ================= CSS ================= */}
      <style jsx>{`
        .vp-section {
          background: #fff8f0;
          padding: 80px 48px;
          overflow: hidden;
          margin-top: 220px; /* Space from Hero */
        }

        .vp-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: flex-start; /* Align Top for offset look */
          justify-content: center; 
          gap: 120px;
        }

        /* VIDEO */
        .vp-videoWrapper {
          flex: 1;
          display: flex;
          justify-content: center;
          margin-top: 60px; /* Offset Video Down */
        }

        .vp-video {
          width: 100%;
          max-width: 420px;
          aspect-ratio: 4 / 5;
          object-fit: cover;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        /* CONTENT */
        .vp-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: left;
          padding-top: 20px; /* Slight optical adjustment */
        }

        .vp-content h2 {
          font-family: var(--font-heading);
          font-size: clamp(2rem, 4vw, 3rem);
          line-height: 1.2;
          margin-bottom: 32px;
          color: #2D2A26;
          font-weight: 800; /* Bolder */
        }

        .vp-content h2 span {
          color: #B1121B; /* Brand Red */
          font-weight: 800;
        }

        .vp-content p {
          font-size: 18px; /* Slightly larger */
          line-height: 1.6;
          color: #2D2A26; /* Darker for visibility */
          font-weight: 500;
          margin-bottom: 48px;
          max-width: 480px;
        }

        .vp-cta {
          display: inline-block;
          background: #B1121B; /* Brand Red Button for Pop */
          color: #fff;
          padding: 16px 36px;
          border-radius: 50px;
          font-weight: 600;
          text-decoration: none;
          box-shadow: 0 10px 20px rgba(177, 18, 27, 0.3);
        }

        /* ========== MOBILE ========= */
        @media (max-width: 767px) {
          .vp-section {
            padding: 40px 20px;
            margin-top: 100px; /* Smaller mobile spacing */
          }

          .vp-container {
            flex-direction: column-reverse;
            gap: 32px;
            text-align: center;
            align-items: center !important; /* Reset Alignment */
          }

          .vp-content {
            align-items: center;
            text-align: center;
            padding-top: 0 !important;
          }

          .vp-content p {
            max-width: 100%;
          }

          .vp-videoWrapper {
            width: 100%;
            margin-top: 0 !important; /* Reset Offset */
          }

          .vp-video {
            width: 100%;
            max-width: 360px;
          }
        }
      `}</style>
    </motion.section>
  )
}
