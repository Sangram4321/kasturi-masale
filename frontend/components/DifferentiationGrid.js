import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function DifferentiationGrid() {
    const [isMobile, setIsMobile] = useState(false)
    const [hoveredRow, setHoveredRow] = useState(null)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const diffs = [
        { label: "Processing", kasturi: "Traditionally roasted, precision-ground", market: "Machine processed" },
        { label: "Oil", kasturi: "No palm oil", market: "Oil sprayed" },
        { label: "Colour", kasturi: "No added colour", market: "Artificial colour" },
        { label: "Batch Size", kasturi: "Small batches", market: "Bulk production" },
        { label: "Shelf Life", kasturi: "Natural shelf life", market: "Chemical treated" },
    ]

    return (
        <section id="differentiation" style={{ ...styles.section, padding: isMobile ? "40px 0" : "100px 20px" }}>
            <div style={styles.container}>
                <motion.h2
                    style={styles.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    Har Masala Ek Jaisa Nahi Hota
                </motion.h2>

                {isMobile ? (
                    /* MOBILE: Horizontal Swipe */
                    <div style={styles.mobileScrollContainer}>
                        {diffs.map((item, i) => (
                            <div key={i} style={styles.mobileCard}>
                                <div style={styles.mobileLabel}>{item.label}</div>
                                <div style={styles.mobileSplitV}>
                                    <div style={styles.mobileHalfKasturi}>
                                        <span style={styles.check}>✅</span>
                                        <span style={styles.mobileText}>{item.kasturi}</span>
                                    </div>
                                    <div style={styles.mobileHalfMarket}>
                                        <span style={styles.cross}>❌</span>
                                        <span style={styles.mobileText}>{item.market}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* DESKTOP: Tight 3-Column Grid representing "Two Sides" */
                    <div style={styles.grid} onMouseLeave={() => setHoveredRow(null)}>
                        <div style={styles.rowHeader}>
                            <div style={styles.colLabel}></div>
                            <div style={styles.colHeaderKasturi}>Kasturi Masale</div>
                            <div style={styles.colHeaderMarket}>Market Masala</div>
                        </div>

                        {diffs.map((item, i) => (
                            <motion.div
                                key={i}
                                style={{
                                    ...styles.row,
                                    opacity: hoveredRow !== null && hoveredRow !== i ? 0.4 : 1, // Dim others
                                    transition: "opacity 0.3s ease"
                                }}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                onMouseEnter={() => setHoveredRow(i)}
                            >
                                <div style={styles.labelCell}>{item.label}</div>
                                <div style={styles.kasturiCell}>
                                    <motion.span
                                        style={styles.check}
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 400, delay: i * 0.1 + 0.2 }}
                                    >
                                        ✅
                                    </motion.span>
                                    {item.kasturi}
                                </div>
                                <div style={styles.marketCell}>
                                    <motion.span
                                        style={styles.cross}
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 400, delay: i * 0.1 + 0.3 }}
                                    >
                                        ❌
                                    </motion.span>
                                    {item.market}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <motion.p
                    style={styles.finalLine}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                >
                    Isliye taste bhi farak padta hai.
                </motion.p>
            </div>
        </section>
    )
}

const styles = {
    section: {
        background: "#FFF",
        overflow: "hidden" // Prevent overflow from scrollbar bleed
    },
    container: {
        maxWidth: 900,
        margin: "0 auto",
        textAlign: "center"
    },
    title: {
        fontSize: "clamp(2rem, 4vw, 3rem)",
        fontFamily: "var(--font-heading)",
        marginBottom: 40,
        color: "#2D2A26",
        padding: "0 20px"
    },

    // DESKTOP GRID
    grid: {
        width: "100%",
        borderTop: "2px solid #EEE",
    },
    rowHeader: {
        display: "grid",
        gridTemplateColumns: "140px 1fr 1fr", // Fixed label width, equal split for comparison
        gap: "0", // Remove gap for solid look
        padding: "20px 0",
        borderBottom: "2px solid #E0E0E0",
        fontWeight: "700",
        color: "#2D2A26",
        fontFamily: "var(--font-heading)",
        fontSize: "1.2rem",
        alignItems: "center"
    },
    colHeaderKasturi: { color: "#1B5E20", textAlign: "left", paddingLeft: 20 },
    colHeaderMarket: { color: "#B71C1C", textAlign: "left", paddingLeft: 20 },

    row: {
        display: "grid",
        gridTemplateColumns: "140px 1fr 1fr",
        gap: "0",
        padding: "18px 0",
        borderBottom: "1px solid #F0F0F0",
        alignItems: "center",
        textAlign: "left",
        fontSize: "1.05rem",
        color: "#4e342e"
    },
    labelCell: {
        fontWeight: "600",
        color: "#8D6E63",
        fontFamily: "var(--font-body)",
        fontSize: "0.95rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        paddingRight: 10
    },
    kasturiCell: {
        color: "#2E7D32",
        fontWeight: "500",
        background: "#F1F8E9", // Subtle row background per cell
        padding: "16px 20px",
        marginRight: "10px", // Visual separation
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },
    marketCell: {
        color: "#C62828",
        fontWeight: "400",
        background: "#FFEBEE",
        padding: "16px 20px",
        marginLeft: "10px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },

    // MOBILE SWIPE
    mobileScrollContainer: {
        display: "flex",
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        gap: "16px",
        padding: "0 20px 40px", // Bottom padding for shadow visibility
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE
        WebkitOverflowScrolling: "touch"
    },
    mobileCard: {
        minWidth: "85vw", // Shows next card peeking
        scrollSnapAlign: "center",
        background: "#FFF",
        borderRadius: "20px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        border: "1px solid #F0F0F0",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
    },
    mobileLabel: {
        background: "#2D2A26",
        color: "#FFF",
        padding: "10px 0",
        fontSize: "14px",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        fontFamily: "var(--font-body)"
    },
    mobileSplitV: {
        display: "flex",
        flexDirection: "column",
        flex: 1
    },
    mobileHalfKasturi: {
        flex: 1,
        background: "#F1F8E9",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        color: "#1B5E20",
        justifyContent: "center"
    },
    mobileHalfMarket: {
        flex: 1,
        background: "#FFEBEE",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        color: "#B71C1C",
        justifyContent: "center"
    },
    mobileText: {
        fontWeight: "500",
        fontSize: "1rem",
        textAlign: "left"
    },

    check: { fontSize: "1.2rem" },
    cross: { fontSize: "1.2rem" },

    finalLine: {
        marginTop: 30,
        fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
        fontWeight: 800,
        color: "#3E2723",
        fontFamily: "var(--font-body)",
        padding: "0 20px"
    }
}
