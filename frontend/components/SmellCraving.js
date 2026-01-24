
import { motion } from "framer-motion"
import Link from "next/link"

export default function SmellCraving() {
    return (
        <section style={styles.section}>
            <motion.div
                style={styles.overlay}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            />

            <div style={styles.container}>
                <motion.h2
                    style={styles.headline}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    Packet Khulte Hi Jo Khushboo Aaye —<br />
                    <span style={styles.highlight}>Wahi Asli Masala</span>
                </motion.h2>

                <div style={styles.contentGrid}>
                    {/* Visual for Woman Smelling Masala / Fresh Ingredients */}
                    <motion.div
                        style={styles.imageWrapper}
                        initial={{ scale: 0.95, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <img
                            src="/images/hero/hero-ingredients-2.png"
                            alt="Fresh spices and texture"
                            style={styles.realImage}
                        />
                    </motion.div>

                    <motion.div
                        style={styles.textContent}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <p style={styles.copy}>
                            Har baar naya packet nahi,<br />
                            har baar naya masala jaisa experience.
                        </p>
                        <Link href="/product" passHref legacyBehavior>
                            <motion.a
                                style={styles.cta}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Experience the Freshness →
                            </motion.a>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

const styles = {
    section: {
        padding: "80px 20px",
        background: "#1A1513", // Dark, premium background
        color: "#fff",
        position: "relative",
        overflow: "hidden"
    },
    overlay: {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(45deg, rgba(166, 27, 30, 0.1), rgba(0,0,0,0))",
        pointerEvents: "none"
    },
    container: {
        maxWidth: 1100,
        margin: "0 auto",
        position: "relative",
        zIndex: 2
    },
    headline: {
        fontSize: "clamp(2rem, 4vw, 3.5rem)",
        fontFamily: "var(--font-heading)",
        textAlign: "center",
        marginBottom: 60,
        lineHeight: 1.2,
    },
    // ...
    copy: {
        fontSize: "clamp(1.1rem, 1.5vw, 1.375rem)",
        fontFamily: "var(--font-body)",
        lineHeight: 1.6,
        marginBottom: 40,
        color: "#D7CCC8",
    },
    cta: {
        display: "inline-block",
        padding: "16px 32px",
        background: "#fff",
        color: "#1A1513",
        borderRadius: 50,
        fontWeight: 700, // Restored from 500
        textDecoration: "none",
        boxShadow: "0 10px 20px rgba(255,255,255,0.1)"
    },
    // Media query handling via grid-template definition above mostly, 
    // but specific overrides can be handled if we used CSS modules. 
    // For inline styles, 'repeat(auto-fit...)' handles the stacking.
}
