import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X } from "lucide-react"

export default function WhatsAppChat() {
    const [isHovered, setIsHovered] = useState(false)
    const [status, setStatus] = useState("idle") // idle | connecting
    const [isVisible, setIsVisible] = useState(false) // Hidden on Hero
    const phoneNumber = "917737379292"
    const message = encodeURIComponent("Hi, I need assistance with Kasturi Masale.")

    const handleClick = () => {
        if (status === "connecting") return
        setStatus("connecting")

        // Show "Connecting..." animation then open
        setTimeout(() => {
            window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank")
            setStatus("idle")
        }, 1500)
    }

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }
        window.addEventListener("scroll", toggleVisibility)
        toggleVisibility() // Check on mount
        return () => window.removeEventListener("scroll", toggleVisibility)
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    style={styles.wrapper}
                >
                    <AnimatePresence>
                        {/* Tooltip - Shows when idle and NOT hovered (or logic can be adjusted) */}
                        {status === "idle" && !isHovered && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 10, scale: 0.8 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                style={styles.tooltip}
                            >
                                <span style={{ fontWeight: 600 }}>Need Help?</span>
                                <div style={styles.tooltipArrow} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        layout
                        onHoverStart={() => setIsHovered(true)}
                        onHoverEnd={() => setIsHovered(false)}
                        onClick={handleClick}
                        style={{
                            ...styles.button,
                            width: status === "connecting" ? 180 : 60, // Expand on click
                            borderRadius: 30
                        }}
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(37, 211, 102, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <AnimatePresence mode="wait">
                            {status === "idle" ? (
                                <motion.div
                                    key="icon"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={styles.content}
                                >
                                    <MessageCircle size={32} color="#fff" fill="currentColor" strokeWidth={0} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="text"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    style={styles.textContent}
                                >
                                    <span style={{ marginRight: 8, fontSize: 14, fontWeight: 600 }}>Opening...</span>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        style={styles.spinner}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Pulse Ring (Only when idle) */}
                        {status === "idle" && (
                            <motion.div
                                style={styles.pulse}
                                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            />
                        )}
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const styles = {
    wrapper: {
        position: "fixed",
        bottom: 30,
        right: 30,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexDirection: 'row'
    },
    button: {
        height: 60,
        background: "#25D366",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        position: "relative",
        overflow: "hidden"
    },
    content: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        position: 'relative',
        zIndex: 2
    },
    textContent: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        whiteSpace: "nowrap",
        width: "100%"
    },
    pulse: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: "50%",
        border: "2px solid #fff",
        zIndex: 1
    },
    spinner: {
        width: 16,
        height: 16,
        border: "2px solid rgba(255,255,255,0.3)",
        borderTop: "2px solid #fff",
        borderRadius: "50%"
    },
    tooltip: {
        background: "#fff",
        color: "#1F2937",
        padding: "8px 16px",
        borderRadius: 12,
        fontSize: 13,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        position: "absolute",
        right: 70, // To the left of the button
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center"
    },
    tooltipArrow: {
        position: "absolute",
        right: -6,
        width: 12,
        height: 12,
        background: "#fff",
        transform: "rotate(45deg)",
        zIndex: -1
    }
}
