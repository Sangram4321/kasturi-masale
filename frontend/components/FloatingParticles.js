import { motion } from "framer-motion"
import { useEffect, useState } from "react"

// Create random particles
const generateParticles = (count) => {
    const particles = []
    for (let i = 0; i < count; i++) {
        particles.push({
            id: i,
            x: Math.random() * 100, // %
            y: Math.random() * 100, // %
            size: Math.random() * 4 + 1, // 1px to 5px
            duration: Math.random() * 10 + 10, // 10s to 20s float duration
            delay: Math.random() * 5,
        })
    }
    return particles
}

export default function FloatingParticles({ count = 15 }) {
    const [particles, setParticles] = useState([])

    useEffect(() => {
        setParticles(generateParticles(count))
    }, [count])

    return (
        <div style={styles.container}>
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    style={{
                        ...styles.particle,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                    }}
                    animate={{
                        y: [0, -40, 0], // Float up and down
                        x: [0, 20, 0], // Drift right and back
                        opacity: [0.3, 0.7, 0.3], // Twinkle
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay,
                    }}
                />
            ))}
        </div>
    )
}

const styles = {
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none", // Allow clicks through
        zIndex: 1, // Behind text (which is usually zIndex 2), above overlay (zIndex 1)
        overflow: "hidden",
    },
    particle: {
        position: "absolute",
        backgroundColor: "#FFD700", // Gold dust
        borderRadius: "50%",
        filter: "blur(0.5px)",
    },
}
