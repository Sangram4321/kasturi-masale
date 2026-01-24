import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

export default function Preloader() {
    // Default to false to avoid flash on repeat visits during hydration
    // We'll set to true only if check passes
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check session storage
        const hasVisited = sessionStorage.getItem("kasturi_welcome_shown")

        if (!hasVisited) {
            setIsVisible(true)

            // Mark as visited immediately so restarts don't trigger it again
            sessionStorage.setItem("kasturi_welcome_shown", "true")

            // Hide after 1.5s (1500ms) max as requested
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
                        <motion.img
                            src="/images/brand/kasturi-logo-red.png"
                            alt="Kasturi Masale"
                            style={styles.logo}
                            // Fast, premium scale-in
                            initial={{ scale: 0.9, opacity: 0, filter: "blur(4px)" }}
                            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />

                        {/* No loading bars, no text animations that delay wait time. 
                            Just the brand mark, then fade. 
                        */}
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
        backgroundColor: "#F9F6F1", // Matches global cream background
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
        width: 200, // Larger for visibility
        height: "auto",
        display: "block",
    },
}
