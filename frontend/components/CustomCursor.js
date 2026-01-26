import { useEffect, useState, useRef } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export default function CustomCursor() {
    const [isHovered, setIsHovered] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [particles, setParticles] = useState([])

    // Prune particles that are too old (fallback cleanup)
    useEffect(() => {
        const interval = setInterval(() => {
            if (particles.length > 20) {
                setParticles(prev => prev.slice(prev.length - 20))
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [particles.length])

    // Use springs for smooth movement
    const cursorX = useMotionValue(-100)
    const cursorY = useMotionValue(-100)

    const springConfig = { damping: 25, stiffness: 700 }
    const springX = useSpring(cursorX, springConfig)
    const springY = useSpring(cursorY, springConfig)

    useEffect(() => {
        // Only run on desktop
        if (window.matchMedia("(pointer: fine)").matches) {
            setIsVisible(true)
        }

        const moveCursor = (e) => {
            cursorX.set(e.clientX - 16) // Center offset (32px / 2)
            cursorY.set(e.clientY - 16)

            // 🌶️ SPICE DUST LOGIC
            // Only spawn if moving fast enough or randomly to avoid clumping
            if (Math.random() > 0.8) {
                const id = Date.now() + Math.random()
                const newParticle = {
                    id,
                    x: e.clientX,
                    y: e.clientY,
                    size: Math.random() * 4 + 2 // 2-6px size
                }
                setParticles(prev => [...prev, newParticle])
            }
        }

        const handleMouseOver = (e) => {
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
                setIsHovered(true)
            } else {
                setIsHovered(false)
            }
        }

        window.addEventListener("mousemove", moveCursor)
        window.addEventListener("mouseover", handleMouseOver)

        return () => {
            window.removeEventListener("mousemove", moveCursor)
            window.removeEventListener("mouseover", handleMouseOver)
        }
    }, [])

    if (!isVisible) return null

    return (
        <>
            <motion.div
                style={{
                    translateX: springX,
                    translateY: springY,
                    position: "fixed",
                    left: 0,
                    top: 0,
                    zIndex: 9999,
                    pointerEvents: "none",
                    mixBlendMode: "difference"
                }}
            >
                <motion.div
                    animate={{
                        scale: isHovered ? 2.5 : 1,
                        opacity: isHovered ? 0.8 : 1
                    }}
                    transition={{ duration: 0.2 }}
                    style={{
                        width: 32,
                        height: 32,
                        backgroundColor: "#fff",
                        borderRadius: "50%"
                    }}
                />
            </motion.div>

            {/* 🌶️ SPICE PARTICLES */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9998, overflow: 'hidden' }}>
                {particles.map(p => (
                    <Particle
                        key={p.id}
                        {...p}
                        onComplete={() => setParticles(prev => prev.filter(item => item.id !== p.id))}
                    />
                ))}
            </div>
            <style jsx global>{`
        body {
            cursor: none; /* Hide default cursor */
        }
        a, button, [role="button"] {
            cursor: none; /* Ensure it stays hidden on interactables */
        }
        
        /* Show default cursor on mobile/touch */
        @media (hover: none) and (pointer: coarse) {
            body, a, button {
                cursor: auto !important;
            }
        }
      `}</style>
        </>
    )
}

/* 🌶️ INDIVIDUAL PARTICLE */
const Particle = ({ x, y, size, onComplete }) => {
    return (
        <motion.div
            initial={{ opacity: 0.8, scale: 1, x: x - size / 2, y: y - size / 2 }}
            animate={{
                opacity: 0,
                scale: 0,
                y: y + 20, // Gravity effect
                x: x + (Math.random() * 10 - 5) // Drift
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onAnimationComplete={onComplete}
            style={{
                position: "absolute",
                width: size,
                height: size,
                borderRadius: "50%",
                background: "#E0A106", // Gold Spice
                boxShadow: "0 0 4px rgba(224, 161, 6, 0.6)",
                pointerEvents: "none"
            }}
        />
    )
}
