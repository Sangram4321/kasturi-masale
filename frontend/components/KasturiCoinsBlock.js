import React from "react"
import { motion } from "framer-motion"

export default function KasturiCoinsBlock() {
    return (
        <section className="coins-section" style={styles.section}>
            <div style={styles.container}>
                {/* Subtle decorative coin placeholder or icon if desired - minimal circle for now or SVG */}
                <motion.div
                    style={styles.iconWrapper}
                    initial={{ rotateY: 0 }}
                    whileInView={{ rotateY: 360 }}
                    whileHover={{ rotateY: 180, scale: 1.1 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    viewport={{ once: true }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="#8D7B6F" strokeWidth="1.5" />
                        <path d="M12 7V17M9.5 9.5H14.5" stroke="#8D7B6F" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </motion.div>

                <motion.h3
                    style={styles.heading}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    Kasturi Coins — Our Way of Giving Back
                </motion.h3>

                <motion.p
                    style={styles.text}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    viewport={{ once: true }}
                >
                    Earn Kasturi Coins on every order and use them on your next purchase — no coupons, no waiting, no discounts.
                </motion.p>
            </div>
            <style jsx>{`
                @media (max-width: 768px) {
                    .coins-section {
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
        background: "#FDFBF7", // Continuity
        display: "flex",
        justifyContent: "center",
        // Spacing constraints
        paddingTop: 80, // Increased to 80px
        paddingBottom: 80, // Increased to 80px
    },
    container: {
        maxWidth: 600, // Narrow container
        padding: "0 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
    },
    iconWrapper: {
        marginBottom: 4,
        opacity: 0.6,
    },
    heading: {
        fontFamily: "var(--font-heading)",
        fontSize: "1.25rem",
        fontWeight: 600,
        color: "#2C1810",
        margin: 0,
        letterSpacing: "0.02em",
    },
    text: {
        fontFamily: "var(--font-body)",
        fontSize: "0.95rem",
        lineHeight: 1.6,
        color: "#5C4033",
        margin: 0,
        maxWidth: "480px",
        fontWeight: 400,
    },
}
