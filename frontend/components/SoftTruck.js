import { motion } from "framer-motion"



export default function SoftTruck({ className, isMoving = false, color = "#DC2626" }) {
    // 🚚 Truck Physics 
    const truckVariants = {
        idle: {
            y: [0, -2, 0],
            rotate: 0,
            transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
        },
        moving: {
            y: [0, 1, 0, -1, 0], // Subtle road bump
            rotate: [-1, 0, 1, 0], // Chassis suspension rock
            transition: { repeat: Infinity, duration: 0.5, ease: "linear" }
        },
        departing: {
            x: 300,
            rotate: -5, // Wheelie effect on exit
            opacity: 0,
            transition: { duration: 0.6, ease: "backIn" }
        }
    }

    // 🎡 Wheel Physics
    const wheelVariants = {
        idle: { rotate: 0 },
        moving: {
            rotate: 360,
            transition: { repeat: Infinity, duration: 0.25, ease: "linear" }
        }
    }

    // 💨 Speed Lines
    const windVariants = {
        hidden: { opacity: 0, x: 10 },
        visible: {
            opacity: [0, 1, 0],
            x: [10, -5],
            transition: { repeat: Infinity, duration: 0.4, delay: 0.2 }
        }
    }

    return (
        <motion.div
            className={className}
            variants={truckVariants}
            animate={isMoving ? "moving" : "idle"}
            style={{ display: "inline-block", width: 48, height: 32, position: "relative" }}
        >
            <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* CHASSIS */}
                <motion.g>
                    {/* Box */}
                    <path d="M5 10C5 8.89543 5.89543 8 7 8H30V22H5V10Z" fill={color} />
                    <path d="M5 8H30V12H5V8Z" fill="rgba(255,255,255,0.2)" /> {/* Highlight */}

                    {/* Cabin */}
                    <path d="M30 11H38C40.2091 11 42 12.7909 42 15V22H30V11Z" fill={color} />
                    <path d="M42 22H44V20H42V22Z" fill="#333" /> {/* Bumper */}

                    {/* Window */}
                    <path d="M38 12H32V16H38C39.1046 16 40 15.1046 40 14V12.5C40 12.2239 39.7761 12 39.5 12H38Z" fill="#DBEAFE" />
                </motion.g>

                {/* WHEELS */}
                <motion.g variants={wheelVariants} animate={isMoving ? "moving" : "idle"} initial="idle" style={{ originX: "12px", originY: "24px" }}>
                    <circle cx="12" cy="24" r="4" fill="#1F2937" />
                    <circle cx="12" cy="24" r="2" fill="#E5E7EB" />
                </motion.g>

                <motion.g variants={wheelVariants} animate={isMoving ? "moving" : "idle"} initial="idle" style={{ originX: "36px", originY: "24px" }}>
                    <circle cx="36" cy="24" r="4" fill="#1F2937" />
                    <circle cx="36" cy="24" r="2" fill="#E5E7EB" />
                </motion.g>

                {/* WIND / SPEED */}
                {isMoving && (
                    <motion.g variants={windVariants} initial="hidden" animate="visible">
                        <path d="M4 14H0" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                        <path d="M2 18H-2" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                    </motion.g>
                )}
            </svg>
        </motion.div>
    )
}
