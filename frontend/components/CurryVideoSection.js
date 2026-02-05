import { motion } from "framer-motion"
import Link from "next/link"
import { useState, useEffect } from "react"
import MagneticButton from "./MagneticButton"

export default function CurryVideoSection() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024) // 1024 includes iPad Pro/Tablets in portrait
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // Typewriter Variants
    const sentence = "This Is How Real Kolhapuri Mutton Is Supposed to Look."

    const typewriterContainer = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.04 // Speed of typing
            }
        }
    }

    const letterVariant = {
        hidden: { opacity: 0, y: 5 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.05 } // Instant appearance
        }
    }

    return (
        <section style={styles.section}>
            <div style={{
                ...styles.container,
                flexDirection: isMobile ? "column" : "row"
            }}>
                {/* VIDEO SIDE (Industrial Size) */}
                <motion.div
                    style={{
                        ...styles.videoWrapper,
                        width: isMobile ? "100%" : "55%", // Dominant video size
                        height: isMobile ? "50vh" : "600px"
                    }}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    data-scroll
                    data-scroll-speed="0.1"
                >
                    <video
                        src="/images/curry-video/kasturi-mutton-curry.mp4"
                        style={styles.video}
                        autoPlay
                        loop
                        muted
                        defaultMuted={true}
                        playsInline
                    />
                </motion.div>

                {/* TEXT SIDE */}
                <div style={{
                    ...styles.contentWrapper,
                    width: isMobile ? "100%" : "45%",
                    textAlign: isMobile ? "center" : "left",
                    paddingLeft: isMobile ? 0 : 60,
                    paddingTop: isMobile ? 40 : 0
                }}
                    data-scroll
                    data-scroll-speed="-0.1"
                >
                    <motion.h2
                        style={styles.headline}
                        variants={typewriterContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {sentence.split("").map((char, index) => (
                            <motion.span key={index} variants={letterVariant}>
                                {char}
                            </motion.span>
                        ))}
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.5, duration: 0.8 }} // Wait for typing to finish
                        viewport={{ once: true }}
                    >
                        <Link href="/product" style={{ textDecoration: 'none' }}>
                            <div style={{ display: 'inline-block' }}>
                                <MagneticButton>
                                    Shop This Flavor
                                </MagneticButton>
                            </div>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

const styles = {
    section: {
        width: "100%",
        padding: "80px 5vw",
        background: "#FFF",
        overflow: "hidden"
    },
    container: {
        maxWidth: 1400,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
    },
    videoWrapper: {
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        backgroundColor: "#000"
    },
    video: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block"
    },
    contentWrapper: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    headline: {
        fontFamily: "var(--font-heading)", // 'Cormorant Garamond', serif
        fontSize: "clamp(2rem, 4vw, 3.5rem)",
        lineHeight: 1.1,
        color: "#2D2A26",
        marginBottom: 40,
        fontWeight: 700
    },
    ctaButton: {
        display: "inline-block",
        padding: "18px 42px",
        fontSize: "1.1rem",
        fontWeight: 600,
        color: "#FFF",
        backgroundColor: "#B1121B",
        borderRadius: 50,
        textDecoration: "none",
        cursor: "pointer",
        letterSpacing: "0.05em",
        fontFamily: "var(--font-body)"
    }
}
