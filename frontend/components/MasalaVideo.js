import { useRef, useState, useEffect } from "react"
import { motion, useInView } from "framer-motion"

export default function MasalaVideo() {
    const videoRef = useRef(null)
    const containerRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const isInView = useInView(containerRef, { amount: 0.4 })

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 900)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    useEffect(() => {
        if (!isInView && isPlaying && videoRef.current) {
            videoRef.current.pause()
            setIsPlaying(false)
        }
    }, [isInView, isPlaying])

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <motion.div
                    ref={containerRef}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    style={{
                        ...styles.contentGrid,
                        flexDirection: isMobile ? "column" : "row",
                        textAlign: isMobile ? "center" : "left"
                    }}
                >
                    {/* TEXT CONTENT */}
                    <div style={styles.textWrapper}>
                        <div style={{ display: "inline-block", overflow: "hidden" }}>
                            <motion.span
                                initial={{ y: "100%" }}
                                whileInView={{ y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                style={styles.label}
                            >
                                Behind the Scenes
                            </motion.span>
                        </div>

                        <h2 style={styles.title}>The Making of Kasturi<br />Kanda Lasun Masala</h2>

                        <p style={styles.description}>
                            Witness the ancient art of "Kandap" (pounding).
                            We don't just grind spices; we preserve their soul.
                            Slow-pounded to retain natural oils, vibrant colour,
                            and that authentic Kolhapuri punch.
                        </p>

                        {!isMobile && (
                            <div style={styles.specRow}>
                                <motion.div
                                    style={styles.specItem}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <span style={styles.specVal}>100%</span>
                                    <span style={styles.specLabel}>Natural Oils</span>
                                </motion.div>
                                <div style={styles.specDivider}></div>
                                <motion.div
                                    style={styles.specItem}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <span style={styles.specVal}>0%</span>
                                    <span style={styles.specLabel}>Heat Loss</span>
                                </motion.div>
                            </div>
                        )}
                    </div>

                    {/* VIDEO PLAYER */}
                    <motion.div
                        style={{
                            ...styles.videoWrapper,
                            height: isMobile ? "60vh" : "auto",
                            aspectRatio: isMobile ? "auto" : "3/2",
                            width: isMobile ? "100%" : "55%" // desktop split sizing
                        }}
                        onClick={togglePlay}
                        whileHover={{ scale: 1.02, boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }} // Bloom effect
                        transition={{ duration: 0.4 }}
                    >
                        <video
                            ref={videoRef}
                            src="/images/making/masala-making.MP4"
                            style={styles.video}
                            poster="/images/hero/hero-texture-2.png"
                            playsInline
                            loop
                            muted={false}
                        />

                        {/* Dark Gradient Overlay for cinematic feel when paused */}
                        {!isPlaying && <div style={styles.gradientOverlay}></div>}

                        {!isPlaying && (
                            <div style={styles.playOverlay}>
                                <motion.div
                                    style={styles.playButton}
                                    whileHover={{ scale: 1.2, backgroundColor: "rgba(255,255,255,0.2)" }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                                >
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 5V19L19 12L8 5Z" fill="white" />
                                    </svg>
                                </motion.div>
                                <span style={styles.playText}>Watch the Process</span>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

const styles = {
    section: {
        padding: "100px 24px",
        background: "#1A1816", // Dark Cinematic Background
        color: "#FFF",
        position: "relative",
        overflow: "hidden"
    },
    container: {
        maxWidth: 1200,
        margin: "0 auto",
    },
    contentGrid: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 60,
    },
    textWrapper: {
        flex: 1,
        zIndex: 2,
    },
    label: {
        fontSize: 14,
        letterSpacing: "0.25em",
        fontWeight: 700,
        color: "#D4AF37", // Gold
        textTransform: "uppercase",
        marginBottom: 20,
        display: "block",
        fontFamily: "var(--font-body)",
    },
    title: {
        fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
        color: "#FFFFFF",
        fontFamily: "var(--font-heading)",
        marginBottom: 24,
        lineHeight: 1.1,
    },
    description: {
        fontSize: 17,
        lineHeight: 1.7,
        color: "rgba(255, 255, 255, 0.7)", // Muted white
        fontFamily: "var(--font-body)",
        maxWidth: 500,
        marginBottom: 40
    },
    specRow: {
        display: "flex",
        alignItems: "center",
        gap: 30,
        marginTop: 20,
        borderTop: "1px solid rgba(255,255,255,0.1)",
        paddingTop: 30
    },
    specItem: {
        display: "flex",
        flexDirection: "column",
        gap: 4
    },
    specVal: {
        fontSize: "2rem",
        fontFamily: "var(--font-heading)",
        color: "#D4AF37",
        lineHeight: 1
    },
    specLabel: {
        fontSize: 12,
        color: "rgba(255,255,255,0.5)",
        textTransform: "uppercase",
        letterSpacing: "0.1em"
    },
    specDivider: {
        width: 1,
        height: 40,
        background: "rgba(255,255,255,0.1)"
    },

    // VIDEO
    videoWrapper: {
        position: "relative",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0 30px 60px rgba(0,0,0,0.5)", // Deep shadow
        cursor: "pointer",
        background: "#000",
        flexShrink: 0
    },
    video: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        opacity: 0.9 // Slight dim for cinematic feel
    },
    gradientOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
        pointerEvents: "none"
    },
    playOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        zIndex: 5
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 30px rgba(255,255,255,0.1)"
    },
    playText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "var(--font-body)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        textShadow: "0 2px 10px rgba(0,0,0,0.5)"
    }
}
