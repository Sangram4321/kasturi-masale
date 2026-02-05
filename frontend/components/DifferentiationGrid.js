
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useState, useEffect } from "react"
import { playHoverSound } from "../utils/audio"
import RevealText from "./RevealText"

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    }

    const rowVariants = {
        hidden: { opacity: 0, y: 40, filter: "blur(4px)" },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
        }
    }

    // Dynamic Styles based on isMobile
    const gridColumns = isMobile ? "100px 1fr 1fr" : "140px 1fr 1fr"
    const gap = isMobile ? 10 : 0

    return (
        <section id="differentiation" style={styles.section}>
            <div style={styles.container}>
                <RevealText style={{ ...styles.title, fontSize: isMobile ? "1.8rem" : "2.5rem" }}>
                    Har Masala Ek Jaisa Nahi Hota
                </RevealText>

                <motion.div
                    style={{ ...styles.grid, borderTop: isMobile ? "none" : "2px solid #EEE" }}
                    onMouseLeave={() => setHoveredRow(null)}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {/* HEADER */}
                    <motion.div style={{
                        ...styles.rowHeader,
                        gridTemplateColumns: gridColumns,
                        fontSize: isMobile ? "0.75rem" : "1rem",
                        gap: gap
                    }} variants={rowVariants}>
                        <div></div>
                        <div style={styles.colHeaderKasturi}>Kasturi Masale</div>
                        <div style={styles.colHeaderMarket}>Market Masala</div>
                    </motion.div>

                    {diffs.map((item, i) => (
                        <TiltCard
                            key={i}
                            index={i}
                            item={item}
                            hoveredRow={hoveredRow}
                            setHoveredRow={setHoveredRow}
                            variants={rowVariants}
                            isMobile={isMobile}
                            gridColumns={gridColumns}
                        />
                    ))}
                </motion.div>

                <motion.p
                    style={{ ...styles.finalLine, fontSize: isMobile ? "1.1rem" : "1.4rem" }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    Isliye taste bhi farak padta hai.
                </motion.p>
            </div>
        </section>
    )
}

/* ROW */
function TiltCard({ item, index, setHoveredRow, hoveredRow, variants, isMobile, gridColumns }) {
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseX = useSpring(x, { stiffness: 150, damping: 15 })
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 })

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["5deg", "-5deg"])
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-5deg", "5deg"])

    const handleMouseMove = (e) => {
        if (isMobile) return // Disable 3D tilt on mobile
        const rect = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - rect.left) / rect.width - 0.5)
        y.set((e.clientY - rect.top) / rect.height - 0.5)
    }

    return (
        <motion.div
            variants={variants}
            style={{
                ...styles.row,
                opacity: hoveredRow !== null && hoveredRow !== index ? 0.4 : 1
            }}
            onMouseEnter={() => {
                setHoveredRow(index)
                playHoverSound()
            }}
            onMouseLeave={() => setHoveredRow(null)}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                style={{
                    ...styles.rowInner,
                    gridTemplateColumns: gridColumns,
                    rotateX: isMobile ? 0 : rotateX,
                    rotateY: isMobile ? 0 : rotateY,
                    minHeight: isMobile ? 80 : 110,
                    gap: isMobile ? 4 : 0
                }}
            >
                <div style={{ ...styles.labelCell, fontSize: isMobile ? "0.7rem" : "0.9rem" }}>
                    {item.label}
                </div>

                <div style={{
                    ...styles.kasturiCell,
                    padding: isMobile ? "8px 4px" : "16px 20px",
                    flexDirection: isMobile ? "column" : "row",
                    textAlign: "center",
                    gap: isMobile ? 4 : 10,
                    fontSize: isMobile ? "0.75rem" : "1rem"
                }}>
                    <span>✅</span>
                    {item.kasturi}
                </div>

                <div style={{
                    ...styles.marketCell,
                    padding: isMobile ? "8px 4px" : "16px 20px",
                    flexDirection: isMobile ? "column" : "row",
                    textAlign: "center",
                    gap: isMobile ? 4 : 10,
                    fontSize: isMobile ? "0.75rem" : "1rem"
                }}>
                    <span>❌</span>
                    {item.market}
                </div>
            </motion.div>
        </motion.div>
    )
}

/* STYLES */
const styles = {
    section: { background: "#FFF", padding: "60px 20px" }, // Reduced top padding
    container: { maxWidth: 900, margin: "0 auto", textAlign: "center" },

    title: {
        marginBottom: 40,
        fontWeight: 700,
        color: "#111827"
    },

    grid: {
        width: "100%",
        // Border handled inline
    },

    rowHeader: {
        display: "grid",
        alignItems: "center",
        padding: "16px 0",
        borderBottom: "2px solid #E0E0E0",
        fontWeight: 700,
        letterSpacing: "0.5px"
    },

    colHeaderKasturi: { textAlign: "center", color: "#166534" }, // Darker Green
    colHeaderMarket: { textAlign: "center", color: "#B91C1C" },   // Darker Red

    row: {
        borderBottom: "1px solid #F0F0F0",
        perspective: 1000
    },

    rowInner: {
        display: "grid",
        alignItems: "center",
        padding: "16px 0",
        transformStyle: "preserve-3d"
    },

    labelCell: {
        fontWeight: 700,
        textTransform: "uppercase",
        color: "#4B5563",
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // Center aligned label
        textAlign: "center",
        paddingRight: 4
    },

    kasturiCell: {
        background: "#F0FDF4",
        borderRadius: 8,
        width: "96%",
        justifySelf: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#166534",
        border: "1px solid #DCFCE7"
    },

    marketCell: {
        background: "#FEF2F2",
        borderRadius: 8,
        width: "96%",
        justifySelf: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#991B1B",
        border: "1px solid #FEE2E2"
    },

    finalLine: {
        marginTop: 30,
        fontWeight: 800,
        color: "#374151"
    }
}
