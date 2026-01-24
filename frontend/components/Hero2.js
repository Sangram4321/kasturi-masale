import { useRef } from "react"
import { motion } from "framer-motion"

// Exact 5 images requested
const IMAGES = [
    "/images/hero/hero2/page-image-1.PNG",
    "/images/hero/hero2/page-image-2.JPG",
    "/images/hero/hero2/page-image-3.JPG",
    "/images/hero/hero2/page-image-4.JPG",
    "/images/hero/hero2/page-image-5.JPG",
]

export default function Hero2() {
    return (
        <section className="hero-two-section" style={styles.section}>
            <div style={styles.header}>
                <motion.span
                    style={styles.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                >
                    Purity in Every Grain
                </motion.span>
                <motion.h2
                    style={styles.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    The Art of Masala
                </motion.h2>
                <motion.div
                    style={styles.line}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                ></motion.div>
            </div>

            {/* Marquee Container */}
            <div style={styles.marqueeParams}>
                <div style={styles.track}>
                    {/* Double the content for seamless loop */}
                    {[...IMAGES, ...IMAGES, ...IMAGES].map((src, i) => (
                        <motion.div
                            key={i}
                            style={styles.imageCard}
                            whileHover={{ scale: 1.05, y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                            transition={{ duration: 0.3 }}
                        >
                            <img src={src} alt={`Kasturi Masala Process ${i}`} style={styles.image} />
                        </motion.div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes scrollLeft {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); } /* Move by 1/3 since we tripled content */
                }
                @media (max-width: 768px) {
                    .hero-two-section {
                        padding-top: 40px !important;
                        padding-bottom: 40px !important;
                        gap: 24px !important;
                    }
                }
            `}</style>
        </section>
    )
}

const styles = {
    section: {
        width: "100%",
        paddingTop: 80, /* Increased from 64 */
        paddingBottom: 80, /* Increased from 64 */
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 60, /* Increased from 40 */
        overflow: "hidden" // Hide overflow
    },
    header: {
        textAlign: "center",
        padding: "0 5vw",
    },
    label: {
        display: "block",
        fontSize: 13,
        letterSpacing: "0.2em",
        fontWeight: 600,
        color: "#A61B1E",
        textTransform: "uppercase",
        marginBottom: 16,
        fontFamily: "var(--font-body)",
    },
    title: {
        fontSize: "clamp(32px, 5vw, 48px)",
        color: "#2D2A26",
        fontFamily: "var(--font-heading)",
        marginBottom: 24,
    },
    line: {
        width: 60,
        height: 3,
        background: "#A61B1E",
        margin: "0 auto",
    },
    marqueeParams: {
        width: "100%",
        display: "flex",
        overflow: "hidden",
        position: "relative",
    },
    track: {
        display: "flex",
        gap: 24,
        // Calculate width dynamically or ensure enough duplication
        // We tripled content so we can just move.
        animation: "scrollLeft 60s linear infinite", // Slow continuous scroll
        width: "max-content",
        paddingLeft: "24px" // Initial offset
    },
    imageCard: {
        width: "300px", // Fixed width for smoothness
        height: "380px",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
        flexShrink: 0,
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    }
}

