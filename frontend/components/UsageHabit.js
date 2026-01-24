
import { motion } from "framer-motion"

export default function UsageHabit() {
    const habits = [
        { name: "Bhaji", icon: "🥦" },
        { name: "Dal", icon: "🥣" },
        { name: "Anda", icon: "🥚" },
        { name: "Usal", icon: "🥘" },
        { name: "Tadka", icon: "🔥" },
    ]

    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <motion.h2
                    style={styles.headline}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    Ek Chamach Roz — Har Sabzi Mein
                </motion.h2>

                <div style={styles.iconGrid}>
                    {habits.map((h, i) => (
                        <motion.div
                            key={i}
                            style={styles.habitCard}
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div style={styles.iconCircle}>{h.icon}</div>
                            <span style={styles.habitName}>{h.name}</span>
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    style={styles.subtext}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                >
                    Ek hi masala, roz ke khane ka taste upgrade.
                </motion.p>
            </div>
        </section>
    )
}

const styles = {
    section: {
        padding: "80px 20px",
        background: "#fff",
        borderTop: "1px solid #F5F5F5"
    },
    container: {
        maxWidth: 900,
        margin: "0 auto",
        textAlign: "center"
    },
    headline: {
        fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
        fontFamily: "var(--font-heading)",
        color: "#2D2A26",
        marginBottom: 50,
        // fontWeight mainly removed or 700 if Playfair default, 
        // original file Step 459 had NO fontWeight on headline (using font default).
        // I added fontWeight 600. I should remove it.
    },
    // ...
    habitName: {
        fontWeight: 600, // Restored from 500
        color: "#5D4037",
        fontFamily: "var(--font-body)"
    },
    subtext: {
        fontSize: 18,
        color: "#8D6E63",
        fontStyle: "italic"
    }
}
