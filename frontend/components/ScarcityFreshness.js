
import { motion } from "framer-motion"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function ScarcityFreshness() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <motion.div
                    style={{
                        ...styles.card,
                        padding: isMobile ? "24px 16px" : "40px"
                    }}
                    initial={{ scale: 0.95, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <div style={styles.badge}>Ground in Small Batches Only</div>

                    <h3 style={styles.heading}>
                        Current grinding batch has limited packs to ensure freshness.
                    </h3>

                    <div style={styles.indicatorWrapper}>
                        <div style={styles.pulseDot} />
                        <span style={styles.liveText}>
                            Only <span style={styles.number}>92</span> packs left from this batch
                        </span>
                    </div>

                    <Link href="/product" passHref legacyBehavior>
                        <motion.a
                            style={{
                                ...styles.cta,
                                width: isMobile ? '100%' : 'auto',
                                display: 'inline-block',
                                textAlign: 'center'
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Get This Batch →
                        </motion.a>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

const styles = {
    section: {
        padding: "60px 20px",
        background: "#FDFBF7"
    },
    container: {
        maxWidth: 700,
        margin: "0 auto"
    },
    card: {
        background: "#fff",
        border: "2px solid #A61B1E",
        borderRadius: 24,
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(166, 27, 30, 0.08)",
        position: "relative",
        overflow: "hidden"
    },
    badge: {
        display: "inline-block",
        background: "#FFEBEE",
        color: "#C62828",
        padding: "8px 16px",
        borderRadius: 50,
        fontSize: 13,
        fontWeight: 700, // Restored from 600
        textTransform: "uppercase",
        marginBottom: 24,
        letterSpacing: 1,
        fontFamily: "var(--font-body)",
    },
    heading: {
        fontSize: "clamp(1.25rem, 4vw, 1.5rem)",
        fontFamily: "var(--font-heading)",
        color: "#2D2A26",
        marginBottom: 30,
        lineHeight: 1.4,
        // Removed 600
    },
    // ...
    liveText: {
        fontSize: 16,
        color: "#388E3C",
        fontWeight: 600, // Restored
        fontFamily: "var(--font-body)",
    },
    cta: {
        background: "#2D2A26",
        color: "#fff",
        padding: "16px 48px",
        borderRadius: 8,
        fontSize: 16,
        fontWeight: 600, // Restored
        textDecoration: "none"
    }
}
