import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import RevealText from "./RevealText"

export default function Guarantee() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 900)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    }

    // Popup scale animation for the card
    const itemVariants = {
        hidden: { opacity: 0, scale: 0.8, y: 30 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 20
            }
        },
        hover: {
            scale: 1.05,
            boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
            borderColor: "rgba(255,255,255,1)",
            transition: { duration: 0.3 }
        }
    }

    // Icon animation: Rotate/Scale/Wiggle on hover
    const iconVariants = {
        hover: {
            scale: 1.2,
            rotate: [0, -10, 10, -10, 0],
            transition: {
                rotate: {
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                },
                scale: { duration: 0.3 }
            }
        }
    }

    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <motion.div
                    style={{
                        ...styles.contentBox,
                        padding: isMobile ? "40px 20px" : "60px 40px"
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <RevealText style={{
                        ...styles.headline,
                        marginBottom: isMobile ? 40 : 50
                    }}>
                        Taste & Freshness Guarantee
                    </RevealText>

                    <motion.div
                        style={{
                            ...styles.grid,
                            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                            gap: isMobile ? 24 : 32 // Increased gap for glass cards
                        }}
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <FeatureItem
                            icon="🛡️"
                            title="100% Refund"
                            desc="Instant money back if not satisfied"
                            variants={itemVariants}
                            iconVariants={iconVariants}
                        />
                        <FeatureItem
                            icon="🚚"
                            title="Fast Delivery"
                            desc="Freshly packed & shipped from Kolhapur"
                            variants={itemVariants}
                            iconVariants={iconVariants}
                        />
                        <FeatureItem
                            icon="🔒"
                            title="Secure Payment"
                            desc="UPI, Cards & Netbanking supported"
                            variants={itemVariants}
                            iconVariants={iconVariants}
                        />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

function FeatureItem({ icon, title, desc, variants, iconVariants }) {
    return (
        <motion.div
            style={styles.glassItem}
            variants={variants}
            whileHover="hover"
        >
            <motion.div
                style={styles.iconCircle}
                variants={iconVariants}
            >
                {icon}
            </motion.div>
            <div>
                <h4 style={styles.itemTitle}>{title}</h4>
                <p style={styles.itemDesc}>{desc}</p>
            </div>
        </motion.div>
    )
}

const styles = {
    section: {
        padding: "60px 20px",
        background: "#FDFBF7",
        borderTop: "1px solid #EFEBE9",
    },
    container: {
        maxWidth: 1100, // Increased slightly for spacing
        margin: "0 auto"
    },
    contentBox: {
        // Keep white box for contrast against section bg
        background: "#fff",
        borderRadius: 24,
        textAlign: "center",
        boxShadow: "0 20px 40px rgba(0,0,0,0.03)",
        border: "1px solid #eee",
    },
    headline: {
        fontSize: "clamp(1.75rem, 5vw, 3rem)",
        fontFamily: "var(--font-heading)",
        color: "#2D2A26",
    },
    grid: {
        display: "grid",
        alignItems: "stretch",
        justifyItems: "center"
    },
    // GLASS CARD STYLE
    glassItem: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 16,
        width: "100%",
        height: "100%",
        padding: "32px 24px",
        borderRadius: "20px",

        // Glassmorphism
        background: "rgba(255, 255, 255, 0.4)", // More transparent to pick up white bg
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        boxShadow: "0 8px 32px rgba(31, 38, 135, 0.05)", // Soft colored shadow

        cursor: "default"
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: "#FFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "28px", // Slightly larger icon
        border: "1px solid #F0F0F0",
        marginBottom: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        zIndex: 1
    },
    itemTitle: {
        fontSize: 20,
        fontFamily: "var(--font-heading)",
        fontWeight: 700,
        margin: "0 0 8px 0",
        color: "#2D2A26"
    },
    itemDesc: {
        fontSize: 15,
        color: "#8D6E63",
        margin: 0,
        maxWidth: 240,
        fontFamily: "var(--font-body)",
        lineHeight: 1.5
    }
}
