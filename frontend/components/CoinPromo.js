
import { motion } from "framer-motion"
import Link from "next/link"

export default function CoinPromo() {
    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <div style={styles.content}>
                    <motion.div
                        style={styles.badge}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        NEW LOYALTY PROGRAM
                    </motion.div>

                    <motion.h2
                        style={styles.headline}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        Shop. Earn. Save.<br />
                        <span style={styles.goldText}>Kasturi Coins</span>
                    </motion.h2>

                    <motion.p
                        style={styles.subtext}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        Get 5% back in coins on every order. Use them for discounts on your next authentic masala purchase.
                    </motion.p>

                    <div style={styles.steps}>
                        <Step icon="🛍️" title="Buy Masala" desc="Order your favorites" delay={0.3} />
                        <div style={styles.arrow}>→</div>
                        <Step icon="🪙" title="Earn Coins" desc="5% value credited" delay={0.4} />
                        <div style={styles.arrow}>→</div>
                        <Step icon="💸" title="Redeem" desc="Save on next order" delay={0.5} />
                    </div>

                    <Link href="/product" passHref legacyBehavior>
                        <motion.a
                            style={styles.cta}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Start Earning Now →
                        </motion.a>
                    </Link>
                </div>
            </div>
        </section>
    )
}

function Step({ icon, title, desc, delay }) {
    return (
        <motion.div
            style={styles.stepCard}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
        >
            <div style={styles.iconBox}>{icon}</div>
            <h4 style={styles.stepTitle}>{title}</h4>
            <p style={styles.stepDesc}>{desc}</p>
        </motion.div>
    )
}

const styles = {
    section: {
        padding: "var(--space-lg) var(--container-padding)",
        background: "#2D2A26",
        color: "#fff",
        overflow: "hidden"
    },
    container: {
        maxWidth: 1000,
        margin: "0 auto",
        textAlign: "center"
    },
    badge: {
        display: "inline-block",
        padding: "6px 16px",
        background: "rgba(255, 215, 0, 0.15)",
        color: "#FFD700",
        borderRadius: 50,
        fontSize: 12,
        fontWeight: 700, // Restored
        letterSpacing: 1,
        marginBottom: "var(--space-sm)",
        fontFamily: "var(--font-body)",
    },
    headline: {
        fontSize: "var(--font-display-lg)",
        fontFamily: "var(--font-heading)",
        marginBottom: "var(--space-sm)",
        lineHeight: 1.1,
    },
    // ...
    stepTitle: {
        fontSize: 18,
        fontWeight: 600,
        color: "#fff",
        margin: 0,
        fontFamily: "var(--font-heading)",
    },
    stepDesc: {
        fontSize: 14,
        color: "#BCAAA4",
        margin: 0,
        fontFamily: "var(--font-body)",
    },
    cta: {
        display: "inline-block",
        padding: "16px 40px",
        background: "#FFD700",
        color: "#2D2A26",
        borderRadius: 8,
        fontWeight: 700, // Restored
        textDecoration: "none",
        border: "2px solid #FFD700"
    }
}
