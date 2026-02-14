import React, { useRef, useEffect } from "react"
import { motion, useInView } from "framer-motion"

export default function MakingVideo() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <section className="making-video-section" ref={ref}>
            <div className="container">
                <motion.div
                    className="header-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h2 className="section-title">The Making Process</h2>
                    <p className="section-subtitle">Authenticity in every step. Tradition in every pack.</p>
                </motion.div>

                <motion.div
                    className="video-wrapper"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    <video
                        src="/images/making/masala-making.MP4"
                        poster="/images/hero/hero-kasturi-silbatta.png"
                        controls
                        playsInline
                        preload="metadata"
                        className="process-video"
                    />
                </motion.div>
            </div>

            <style jsx>{`
        .making-video-section {
          padding: 80px 20px;
          background: #fff;
          overflow: hidden;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .header-content {
          margin-bottom: 40px;
        }

        .section-title {
          font-family: var(--font-heading, 'Playfair Display', serif);
          font-size: 2.5rem;
          color: #1a1a1a;
          margin-bottom: 10px;
        }

        .section-subtitle {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 1.1rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
        }

        .video-wrapper {
          position: relative;
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          background: #000;
        }

        .process-video {
          width: 100%;
          height: auto;
          display: block;
          max-height: 80vh;
        }

        @media (max-width: 768px) {
          .making-video-section {
            padding: 60px 20px;
          }

          .section-title {
            font-size: 2rem;
          }
        }
      `}</style>
        </section>
    )
}
