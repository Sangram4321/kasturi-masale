import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const MASALA_ASSETS = [
    "/images/png-masala-images/mirchi.png",
    "/images/png-masala-images/lavang.png",
    "/images/png-masala-images/kalimiri.png",
    "/images/png-masala-images/velldode.png",
    "/images/png-masala-images/dalchini.png",
    "/images/png-masala-images/ful.png"
]

// STRICT CONSTRAINTS
// STRICT CONSTRAINTS
const MAX_PARTICLES_DESKTOP = 2
const MAX_PARTICLES_MOBILE = 0 // Removed on mobile
const MIN_OPACITY = 0.06
const MAX_OPACITY = 0.14
const MIN_DURATION = 18
const MAX_DURATION = 30
const MAX_DRIFT = 6 // pixels
const MAX_ROTATION = 0 // Static as per "Rotation static" constraint

const generateParticles = (isMobile, overrideCount) => {
    let count = isMobile ? MAX_PARTICLES_MOBILE : MAX_PARTICLES_DESKTOP

    if (typeof overrideCount === 'number') {
        // Respect mobile limit if strictly required, but usually override is specific
        // If override is LOWER than mobile limit, respect it.
        // If override is HIGHER than mobile limit, cap at mobile limit for mobile.
        if (isMobile) {
            count = Math.min(overrideCount, MAX_PARTICLES_MOBILE)
        } else {
            count = overrideCount
        }
    }

    const particles = []

    for (let i = 0; i < count; i++) {
        const asset = MASALA_ASSETS[Math.floor(Math.random() * MASALA_ASSETS.length)]

        particles.push({
            id: i,
            src: asset,
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            size: Math.random() * 30 + 30, // 30-60px
            opacity: Math.random() * (MAX_OPACITY - MIN_OPACITY) + MIN_OPACITY,
            rotation: (Math.random() * MAX_ROTATION * 2) - MAX_ROTATION,
            duration: Math.random() * (MAX_DURATION - MIN_DURATION) + MIN_DURATION,
            delay: Math.random() * 5,
            driftY: (Math.random() * MAX_DRIFT * 2) - MAX_DRIFT
        })
    }
    return particles
}

export default function MasalaParticles({ overrideCount }) {
    const [particles, setParticles] = useState([])

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768
            setParticles(generateParticles(mobile, overrideCount))
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [overrideCount])

    return (
        <div style={styles.container}>
            {particles.map((p) => (
                <motion.img
                    key={p.id}
                    src={p.src}
                    alt=""
                    style={{
                        position: "absolute",
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: "auto",
                        opacity: p.opacity,
                        rotate: p.rotation,
                        pointerEvents: "none",
                        userSelect: "none"
                    }}
                    animate={{
                        y: [0, p.driftY, 0],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
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
        pointerEvents: "none",
        zIndex: 0, // Behind content
        overflow: "hidden",
    }
}
