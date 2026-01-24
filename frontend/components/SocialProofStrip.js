
import { motion } from "framer-motion"

export default function SocialProofStrip() {
    return (
        <section className="social-section" style={styles.strip}>
            <div className="stripContainer" style={styles.container}>
                {/* 1. RATINGS */}
                <motion.div
                    className="ratingGroup"
                    style={styles.ratingGroup}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        style={styles.stars}
                        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                        transition={{
                            scale: { type: "spring", stiffness: 300 },
                            rotate: { duration: 0.4, ease: "easeInOut" }
                        }}
                    >
                        ⭐⭐⭐⭐⭐
                    </motion.div>
                    <p style={styles.ratingText}>
                        <b>4.9/5</b> from 1,200+ Home Kitchens
                    </p>
                </motion.div>

                <motion.div
                    className="stripDivider"
                    style={styles.divider}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                />

                {/* 2. TRUST ICONS */}
                <div
                    className="trustGroup"
                    style={styles.trustGroup}
                >
                    {/* Icons instead of Photos */}
                    <div style={styles.iconsRow}>
                        {[HomeIcon, BowlIcon, FireIcon, UtensilsIcon].map((Icon, i) => (
                            <motion.div
                                key={i}
                                style={styles.iconCircle}
                                initial={{ opacity: 0, scale: 0, x: -10 }}
                                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 + (i * 0.08), type: "spring" }}
                                whileHover={{ y: -5, zIndex: 10 }} // Pop up on hover
                            >
                                <Icon />
                            </motion.div>
                        ))}
                    </div>
                    <motion.p
                        style={styles.trustText}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Used daily in <b>Kolhapur</b> homes
                    </motion.p>
                </div>

                <motion.div
                    className="stripDivider"
                    style={styles.divider}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                />

                {/* 3. REPEAT RATE */}
                <motion.div
                    className="statGroup"
                    style={styles.statGroup}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <motion.span
                        style={styles.statNum}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                        96%
                    </motion.span>
                    <span style={styles.statLabel}>Repeat purchase rate</span>
                </motion.div>
            </div>

            <style jsx>{`
                .stripContainer {
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                }
                .stripDivider {
                    display: block;
                }
                .ratingGroup, .trustGroup, .statGroup {
                    margin-bottom: 0;
                }

                @media (max-width: 768px) {
                    /* Mobile Spacing Override */
                    :global(.social-section) {
                        margin-top: 32px !important;
                        padding: 32px 0 !important;
                    }

                    .stripContainer {
                        flex-direction: column !important;
                        justify-content: center !important;
                        gap: 0 !important;
                    }
                    .stripDivider {
                        display: none !important;
                    }
                    .ratingGroup {
                        margin-bottom: 32px !important;
                    }
                    .trustGroup {
                        margin-bottom: 12px !important;
                        /* Keep Trust and Stat close */
                    }
                    .statGroup {
                        margin-top: 0 !important;
                    }
                }
            `}</style>
        </section>
    )
}

const styles = {
    strip: {
        background: "#FEF7E6", // Very light warm beige
        borderBottom: "1px solid #EED8B0",
        padding: "40px 0", /* Increased form 24px */
        marginTop: 80, /* Desktop Standard */
        width: "100%"
    },
    // Container handled by CSS .stripContainer
    container: {
        maxWidth: 1000,
        margin: "0 auto",
        display: "flex",
        // Padding handled by CSS .stripContainer for Safe Zones
        flexWrap: "wrap",
    },
    ratingGroup: {
        display: "flex",
        alignItems: "center",
        gap: 12
    },
    stars: {
        fontSize: 18,
        letterSpacing: 2
    },
    ratingText: {
        fontSize: 15,
        fontFamily: "var(--font-body)",
        color: "#4E342E",
        fontWeight: 400
    },
    divider: {
        width: 1,
        height: 40,
        background: "rgba(0,0,0,0.1)"
    },
    trustGroup: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8
    },
    trustText: {
        fontSize: 15,
        color: "#5D4037",
        fontFamily: "var(--font-body)",
    },
    iconsRow: {
        display: "flex",
        alignItems: "center",
        gap: -8 // Overlap slightly
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "#FFF",
        border: "1px solid #EED8B0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#B1121B", // Brand Red
        marginLeft: -8, // Overlap
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        zIndex: 1,
        fontSize: 14
    },
    statGroup: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    statNum: {
        fontSize: 24,
        fontWeight: 800,
        color: "#A61B1E",
        lineHeight: 1
    },
    statLabel: {
        fontSize: 12,
        color: "#8D6E63",
        textTransform: "uppercase",
        fontWeight: 600,
        letterSpacing: 0.5
    }
}

/* ================= ICONS ================= */
const HomeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
)

const BowlIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10a8 8 0 0 0 16 0V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4z"></path>
        <path d="M12 2v2"></path>
    </svg>
)

const FireIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.246-3.793-2.246-3.793a1 1 0 0 0 .5-1.745c2.31 1.733 3.655 4.5 3.746 6.538 0 0 .054.168.054.437 0 .828.672 1.5 1.5 1.5s1.5-.672 1.5-1.5c0-.682-1.054-2.585-1.254-4.5 2.5 2.5 4.5 5.5 1.5 8.5a5.5 5.5 0 1 1-6.8-9.43"></path>
    </svg>
)

const UtensilsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
        <path d="M7 2v20"></path>
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"></path>
    </svg>
)
