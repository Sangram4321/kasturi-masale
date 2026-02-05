import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

export default function Preloader() {
    // Default to false to avoid flash on repeat visits during hydration
    // We'll set to true only if check passes
    // Default to TRUE (Visible) to prevent flash of unstyled content
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        // Safety: ensure this runs only on client
        if (typeof window === 'undefined') return

        const hasVisited = sessionStorage.getItem("kasturi_welcome_shown")

        if (hasVisited) {
            // Already visited this session? Hide instantly.
            setIsVisible(false)
        } else {
            // First visit? Show for 1.5s then hide.
            sessionStorage.setItem("kasturi_welcome_shown", "true")
            const timer = setTimeout(() => {
                setIsVisible(false)
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="preloader"
                    // Immediate unmount exit
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={styles.container}
                >
                    <div style={styles.logoWrapper}>
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <motion.img
                                src="/images/brand/kasturi-logo-red.png"
                                alt="Kasturi Masale"
                                style={styles.logo}
                                // Cinematic Blur Reveal
                                initial={{ opacity: 0, scale: 1.05, filter: "blur(5px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                transition={{
                                    duration: 1.2,
                                    ease: [0.25, 0.46, 0.45, 0.94], // Cinematic Ease
                                    delay: 0.2
                                }}
                            />

                            {/* Subtle Shimmer Effect */}
                            <motion.div
                                style={styles.shimmer}
                                initial={{ x: "-100%" }}
                                animate={{ x: "200%" }} // Move comfortably past
                                transition={{
                                    duration: 1.5,
                                    ease: "easeInOut",
                                    delay: 1.4, // Play after logo settles
                                    repeat: 0
                                }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const styles = {
    container: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#F9F6F1",
        zIndex: 10001,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    logoWrapper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    logo: {
        width: 180, // Slightly refined size
        height: "auto",
        display: "block",
    },
    shimmer: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "50%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
        transform: "skewX(-20deg)",
        opacity: 0.6,
        pointerEvents: "none"
    }
}
