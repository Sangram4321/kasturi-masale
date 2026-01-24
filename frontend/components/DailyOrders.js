import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect, useState } from "react"

// User provided numbers
const ORDER_COUNTS = [100, 150, 160, 300, 200, 405, 232, 105, 350, 362, 410]

export default function DailyOrders() {
    const [todayCount, setTodayCount] = useState(0)
    const count = useMotionValue(0)
    const rounded = useTransform(count, Math.round)

    useEffect(() => {
        // Deterministic daily rotation
        const today = new Date()
        // Day of year calc (simple approximation is fine for rotation)
        const start = new Date(today.getFullYear(), 0, 0)
        const diff = today - start
        const oneDay = 1000 * 60 * 60 * 24
        const dayOfYear = Math.floor(diff / oneDay)

        // Select index based on day
        const index = dayOfYear % ORDER_COUNTS.length
        setTodayCount(ORDER_COUNTS[index])
    }, [])

    useEffect(() => {
        if (todayCount > 0) {
            const animation = animate(count, todayCount, {
                duration: 2.5,
                ease: "easeOut"
            })
            return animation.stop
        }
    }, [todayCount])

    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <div style={styles.label}>Today’s Total Orders</div>

                <motion.div style={styles.numberWrapper}>
                    <motion.span style={styles.number}>
                        {rounded}
                    </motion.span>
                    <span style={styles.plus}>+</span>
                </motion.div>

                <p style={styles.subtext}>
                    Freshly ground, packed, and shipping to kitchens across India.
                </p>
            </div>
        </section>
    )
}

const styles = {
    section: {
        padding: "60px 20px",
        background: "#FDFBF7",
        textAlign: "center"
    },
    container: {
        maxWidth: 600,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12
    },
    label: {
        fontSize: "1.1rem",
        fontWeight: 600,
        color: "#8D7B6F",
        textTransform: "uppercase",
        letterSpacing: "0.1em"
    },
    numberWrapper: {
        display: "flex",
        alignItems: "flex-start",
        lineHeight: 1
    },
    number: {
        fontSize: "clamp(4rem, 8vw, 6rem)",
        fontFamily: "var(--font-heading)",
        fontWeight: 700,
        color: "#B1121B", // Brand Red
    },
    plus: {
        fontSize: "clamp(2rem, 4vw, 3rem)",
        color: "#B1121B",
        marginTop: 10,
        fontWeight: 700
    },
    subtext: {
        fontSize: "1.1rem",
        color: "#5D5A56",
        maxWidth: 400
    }
}
