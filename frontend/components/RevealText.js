
import { motion } from "framer-motion"

export default function RevealText({
    children,
    delay = 0,
    duration = 0.8,
    className = "",
    style = {},
    tag = "div"
}) {
    // If it's a string, we wrap it in a span. If it's components (like spans with styles inside h2), we handle differently.
    // For simplicity, this wrapper acts as the "mask" and the child acts as the slider.

    return (
        <div
            className={className}
            style={{
                ...style,
                overflow: "hidden",
                display: style.display || "block" // Default to block for headlines
            }}
        >
            <motion.div
                initial={{ y: "110%" }} // Start slightly below fully hidden to ensure no bleeding
                whileInView={{ y: 0 }}
                viewport={{ once: true, margin: "-10%" }} // Trigger slightly before full view
                transition={{
                    duration: duration,
                    delay: delay,
                    ease: [0.22, 1, 0.36, 1] // Custom "premium" ease
                }}
            >
                {/* Dynamically create the tag (h1, h2, p, div...) if passed, or just render children */}
                {children}
            </motion.div>
        </div>
    )
}
