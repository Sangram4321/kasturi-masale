import Link from "next/link"
import { motion } from "framer-motion"

export default function Custom404() {
    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <motion.h1
                    style={styles.errorCode}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    404
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    <h2 style={styles.heading}>Page Not Found</h2>
                    <p style={styles.text}>
                        Lagta hai aap galat jagah aa gaye hain.<br />
                        Let's get you back to the fresh spices.
                    </p>

                    <Link href="/" passHref legacyBehavior>
                        <a style={styles.button}>Back to Home</a>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

const styles = {
    section: {
        height: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FDFBF7",
        textAlign: "center",
        padding: "0 20px"
    },
    container: {
        maxWidth: 600,
    },
    errorCode: {
        fontSize: "clamp(6rem, 15vw, 10rem)",
        fontFamily: "var(--font-heading)",
        color: "rgba(166, 27, 30, 0.1)", // Faded brand red
        margin: 0,
        lineHeight: 1,
        position: "absolute",
        zIndex: 0,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none"
    },
    heading: {
        position: "relative",
        zIndex: 1,
        fontFamily: "var(--font-heading)",
        fontSize: "2.5rem",
        color: "#2D2A26",
        marginBottom: 16
    },
    text: {
        position: "relative",
        zIndex: 1,
        fontFamily: "var(--font-body)",
        fontSize: "1.1rem",
        color: "#5D4037",
        marginBottom: 32,
        lineHeight: 1.6
    },
    button: {
        position: "relative",
        zIndex: 1,
        display: "inline-block",
        backgroundColor: "#9A1B1F",
        color: "#fff",
        padding: "16px 32px",
        borderRadius: 50,
        textDecoration: "none",
        fontFamily: "var(--font-body)",
        fontWeight: 500,
        fontSize: "1rem",
        boxShadow: "0 10px 20px rgba(154, 27, 31, 0.2)"
    }
}
