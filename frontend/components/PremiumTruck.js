
import { motion, useAnimation } from "framer-motion"
import { useEffect, useState } from "react"

/* 💨 DUST PARTICLE */
const Particle = ({ delay }) => (
    <motion.div
        initial={{ x: 0, y: 0, scale: 0, opacity: 0.8 }}
        animate={{ x: -60, y: -20, scale: 2, opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay }}
        style={{
            position: "absolute", bottom: 5, left: 10,
            width: 6, height: 6, borderRadius: "50%",
            background: "#E5E5E5", zIndex: -1
        }}
    />
)

export default function PremiumTruck({ status = "idle", cargoCount = 0 }) {
    // STATE: For internal physics logic
    // 'idle', 'starting' (rev), 'driving', 'stopping'

    const isMoving = status === 'departing' || status === 'go'
    const isRevving = status === 'starting'

    // 🏎️ CHASSIS PHYSICS
    // "Squat" when accelerating (rotate -2deg), "Dive" when stopping (rotate 2deg)
    const chassisVariants = {
        idle: { y: [0, -2, 0], rotate: 0, transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } }, // Floating levitation
        starting: {
            y: [0, 2, 0],
            rotate: [0, -1, 1, -1, 0], // Engine shake
            transition: { duration: 0.4, repeat: Infinity }
        },
        driving: {
            y: 1,
            rotate: -2, // Squat back
            transition: { type: "spring", stiffness: 100 }
        },
        stopping: {
            y: 2,
            rotate: 3, // Dive forward
            transition: { type: "spring", stiffness: 200 }
        }
    }

    // 💡 LIGHTS
    const lightsVariants = {
        off: { opacity: 0.3, scale: 0.8 },
        on: { opacity: 1, scale: 1, boxShadow: "0 0 15px 2px rgba(255, 230, 0, 0.6)" },
        blink: { opacity: [0.3, 1, 0.3, 1], scale: [1, 1.2, 1, 1.2], transition: { duration: 0.4 } }
    }

    return (
        <div style={{ position: "relative", width: 140, height: 90 }}>

            {/* 💨 EXHAUST PARTICLES */}
            {(isMoving || isRevving) && (
                <>
                    <Particle delay={0} />
                    <Particle delay={0.2} />
                    <Particle delay={0.4} />
                </>
            )}

            {/* 🌑 SHADOW (Scale changes with jump) */}
            <motion.div
                animate={status === 'idle' ? { scaleX: [1, 0.9, 1], opacity: [0.2, 0.15, 0.2] } : { scaleX: 1.1, opacity: 0.1 }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                style={{
                    position: 'absolute', bottom: 15, left: 10, width: 100, height: 10,
                    background: 'black', borderRadius: '50%', filter: 'blur(4px)', opacity: 0.2
                }}
            />

            {/* 🚚 BODY GROUP (Levitating) */}
            <motion.div
                variants={chassisVariants}
                animate={isMoving ? "driving" : isRevving ? "starting" : "idle"}
                style={{ originX: 0.7, originY: 0.8 }} // Rotate around rear axle for wheelie effect
            >
                {/* 📦 CARGO STACK */}
                <div style={{ position: "absolute", top: 16, left: 15, zIndex: 0, display: "flex", gap: 3 }}>
                    {[...Array(cargoCount)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: -40, opacity: 0, rotate: 10 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 12, delay: i * 0.1 }}
                            style={{ width: 14, height: 14, background: "#8B5CF6", borderRadius: 3, border: "1px solid #7C3AED", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
                        />
                    ))}
                </div>

                <svg width="120" height="80" viewBox="0 0 120 80" fill="none" style={{ overflow: 'visible' }}>

                    {/* CONTAINER */}
                    <g transform="translate(0, -2)"> {/* Lift body slightly */}
                        <path d="M10 25 L80 25 L80 60 L10 60 Z" fill="#FFF" stroke="#DC2626" strokeWidth="2" />
                        <path d="M10 25 L20 15 L90 15 L80 25 Z" fill="#EF4444" />
                        <path d="M80 60 L90 50 L90 15 L80 25 Z" fill="#991B1B" />

                        {/* 3D DECAL */}
                        <text x="20" y="48" fontFamily="serif" fontSize="16" fontWeight="900" fill="#DC2626" style={{ filter: "drop-shadow(1px 1px 0px rgba(0,0,0,0.1))" }}>
                            Kasturi
                        </text>
                    </g>

                    {/* CABIN */}
                    <g transform="translate(0, -2)">
                        <path d="M80 30 L100 30 L110 45 L110 60 L80 60 Z" fill="#DC2626" />
                        <path d="M80 30 L90 20 L110 20 L100 30 Z" fill="#EF4444" />
                        <path d="M100 30 L110 45 L110 20 Z" fill="#60A5FA" opacity="0.4" />

                        {/* HEADLIGHT BEAM */}
                        {(status === 'departing' || status === 'go') && (
                            <motion.path
                                d="M110 50 L180 30 L180 70 Z"
                                fill="url(#lightBeam)"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.4 }}
                            />
                        )}
                    </g>

                    {/* HEADLIGHTS */}
                    <motion.circle
                        cx="110" cy="48" r="3.5" fill="#FEF08A"
                        variants={lightsVariants}
                        animate={isMoving || isRevving ? "on" : status === 'success' ? "blink" : "off"}
                    />

                    {/* DEFINITIONS */}
                    <defs>
                        <linearGradient id="lightBeam" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </motion.div>

            {/* 🎡 WHEELS (Independent of body rotation) */}
            <div style={{ position: 'absolute', top: 50, left: 0, width: '100%', pointerEvents: 'none' }}>
                <motion.div
                    animate={isMoving ? { rotate: 360 } : { rotate: 0 }}
                    transition={isMoving ? { repeat: Infinity, duration: 0.15, ease: "linear" } : {}}
                    style={{ position: 'absolute', left: 25, width: 16, height: 16, background: '#1F2937', borderRadius: '50%', border: '4px solid #374151' }}
                >
                    <div style={{ width: '100%', height: 2, background: '#9CA3AF', marginTop: 3 }} /> {/* Spoke */}
                </motion.div>

                <motion.div
                    animate={isMoving ? { rotate: 360 } : { rotate: 0 }}
                    transition={isMoving ? { repeat: Infinity, duration: 0.15, ease: "linear" } : {}}
                    style={{ position: 'absolute', left: 95, width: 16, height: 16, background: '#1F2937', borderRadius: '50%', border: '4px solid #374151' }}
                >
                    <div style={{ width: '100%', height: 2, background: '#9CA3AF', marginTop: 3 }} /> {/* Spoke */}
                </motion.div>
            </div>

        </div>
    )
}
