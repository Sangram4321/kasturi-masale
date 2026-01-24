
import { motion, useScroll, useTransform, useSpring, useVelocity } from "framer-motion"
import { useState } from "react"

export default function VisualStory() {
    const images = [
        "/images/hero/hero2/page-image-1.PNG",
        "/images/hero/hero2/page-image-2.JPG",
        "/images/hero/hero2/page-image-3.JPG",
        "/images/hero/hero2/page-image-4.JPG",
        "/images/hero/hero2/page-image-5.JPG",
    ]

    const marqueeImages = [...images, ...images, ...images, ...images]

    const { scrollY } = useScroll()
    const scrollVelocity = useVelocity(scrollY)
    const skewVelocity = useSpring(scrollVelocity, {
        stiffness: 100,
        damping: 30
    })
    const skewVelocityFactor = useTransform(skewVelocity, [-1000, 1000], [-3, 3]) // Reduced skew for elegance

    const [isHovered, setIsHovered] = useState(false)

    return (
        <section style={styles.section}>
            {/* Ambient Background Elements */}
            <div style={styles.noiseOverlay} />
            <div style={styles.vignette} />

            <div style={styles.container}>
                <motion.h2
                    style={styles.headline}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    Authentic. <span style={styles.italic}>Raw.</span> Pure.
                </motion.h2>

                <p style={styles.subtext}>The Art of Traditional Masala Making</p>

                <div
                    style={styles.marqueeWrapper}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <motion.div
                        style={{ ...styles.track, skewX: skewVelocityFactor }}
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            x: {
                                duration: isHovered ? 60 : 35,
                                repeat: Infinity,
                                ease: "linear"
                            }
                        }}
                    >
                        {marqueeImages.map((src, i) => (
                            <motion.div
                                key={i}
                                style={styles.imageCard}
                                whileHover={{ scale: 0.98, filter: "grayscale(0%) brightness(1.1)" }}
                                transition={{ duration: 0.4 }}
                            >
                                <motion.img
                                    src={src}
                                    alt="Kasturi Masala Making"
                                    style={styles.image}
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                />
                                <div style={styles.cardBorder} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

const styles = {
    section: {
        padding: "var(--space-lg) 0",
        background: "#080808",
        color: "#fff",
        overflow: "hidden",
        position: "relative"
    },
    noiseOverlay: {
        position: "absolute",
        inset: 0,
        opacity: 0.05,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        pointerEvents: "none",
        zIndex: 1
    },
    vignette: {
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at center, transparent 0%, #000 100%)",
        pointerEvents: "none",
        zIndex: 2,
        opacity: 0.8
    },
    container: {
        maxWidth: "100%",
        padding: "0",
        position: "relative",
        zIndex: 5
    },
    headline: {
        fontSize: "var(--font-display-lg)",
        fontFamily: "var(--font-heading)",
        textAlign: "center",
        marginBottom: "var(--space-xs)",
        color: "#F5F5F5",
        letterSpacing: -1,
        lineHeight: 1
    },
    italic: {
        fontStyle: "italic",
        color: "#D4AF37",
        fontFamily: "var(--font-heading)"
    },
    subtext: {
        textAlign: "center",
        fontFamily: "var(--font-body)",
        fontSize: "0.875rem",
        textTransform: "uppercase",
        letterSpacing: 2,
        color: "#888",
        marginBottom: "var(--space-lg)"
    },
    marqueeWrapper: {
        width: "100%",
        overflow: "visible",
        display: "flex",
        perspective: 1000,
        paddingTop: 20,
        paddingBottom: 20
    },
    track: {
        display: "flex",
        gap: "var(--space-md)",
        whiteSpace: "nowrap",
        willChange: "transform"
    },
    imageCard: {
        flex: "0 0 auto",
        width: "clamp(280px, 80vw, 500px)", // Gallery feel preserved
        aspectRatio: "3/4",
        height: "auto",
        borderRadius: "var(--border-radius-md)",
        overflow: "hidden",
        position: "relative",
        filter: "grayscale(100%) contrast(1.2)",
        cursor: "pointer",
        boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.5)"
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block"
    },
    cardBorder: {
        position: "absolute",
        inset: 0,
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: 24,
        pointerEvents: "none"
    }
}
