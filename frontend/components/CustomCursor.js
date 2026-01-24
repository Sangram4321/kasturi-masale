import { useEffect, useState, useRef } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export default function CustomCursor() {
    const [isHovered, setIsHovered] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

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
