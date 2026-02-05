import { motion, useMotionValue, useTransform } from "framer-motion"
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
            depth: Math.random() * 20 + 10 // Factor for parallax (10 to 30)
        })
    }
    return particles
}

export default function FloatingParticles({ count = 15 }) {
    const [particles, setParticles] = useState([])
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Smooth subtle parallax
    const x = useTransform(mouseX, [-500, 500], [-15, 15])
    const y = useTransform(mouseY, [-500, 500], [-15, 15])

    useEffect(() => {
        setParticles(generateParticles(count))

        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window
            const centerX = innerWidth / 2
            const centerY = innerHeight / 2
            mouseX.set(e.clientX - centerX)
            mouseY.set(e.clientY - centerY)
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [count, mouseX, mouseY])

    return (
        <motion.div
            style={{ ...styles.container, x, y }}
        >
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
        </motion.div>
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
        zIndex: 1, // Behind text, above overlay
        overflow: "hidden",
    },
    particle: {
        position: "absolute",
        backgroundColor: "#FFD700", // Gold dust
        borderRadius: "50%",
        filter: "blur(0.5px)",
        boxShadow: "0 0 4px rgba(255, 215, 0, 0.4)" // Soft glow
    },
}
