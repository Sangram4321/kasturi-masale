import { motion } from "framer-motion"
import GoogleReviewBadge from "../components/GoogleReviewBadge"

export default function Contact() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.6, staggerChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }

    return (
        <section style={styles.section}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={styles.container}
            >
                <div style={styles.header}>
                    <motion.h1 variants={itemVariants} style={styles.title}>
                        Get in Touch
                    </motion.h1>
                    <motion.p variants={itemVariants} style={styles.subtitle}>
                        We'd love to hear from you. Here's how you can reach us.
                    </motion.p>
                </div>

                <div style={styles.grid}>
                    {/* CARD 1: OFFICE HOURS (Featured) */}
                    <motion.div variants={itemVariants} style={styles.redCard}>
                        <div style={styles.glassOverlay} />
                        <div style={styles.cardContentRelative}>
                            <h3 style={styles.cardLabel}>OFFICE HOURS</h3>
                            <div style={styles.cardBody}>
                                <p style={styles.timeLabel}>Monday - Friday:</p>
                                <p style={styles.timeValue}>9:00AM - 7:00PM</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* CARD 2: ADDRESS */}
                    <motion.div variants={itemVariants} style={styles.pinkCard}>
                        <h3 style={{ ...styles.cardLabel, color: "#8B1E20" }}>ADDRESS</h3>
                        <div style={{ ...styles.cardBody, color: "#5D4037" }}>
                            <p>Gawaliwada Lane, Yavaluj</p>
                            <p>Kolhapur, Maharashtra 416205</p>
                        </div>
                    </motion.div>

                    {/* CARD 3: INFO */}
                    <motion.div variants={itemVariants} style={styles.beigeCard}>
                        <h3 style={{ ...styles.cardLabel, color: "#5D4037" }}>INFO</h3>
                        <div style={{ ...styles.cardBody, color: "#5D4037" }}>
                            <a href="mailto:support@kasturimasale.in" style={styles.link}>
                                support@kasturimasale.in
                            </a>
                            <p style={{ marginTop: 8 }}>contact : +91 7737379292</p>
                        </div>
                    </motion.div>

                    {/* CARD 4: REVIEWS */}
                    <motion.div variants={itemVariants} style={styles.imageCard}>
                        <GoogleReviewBadge variant="large" />
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}

const styles = {
    section: {
        padding: "140px 24px 80px",
        background: "#fff",
        minHeight: "100vh",
    },
    container: {
        maxWidth: 1200,
        margin: "0 auto",
    },
    header: {
        marginBottom: 60,
        maxWidth: 600,
    },
    title: {
        fontSize: "clamp(42px, 5vw, 64px)",
        lineHeight: 1.1,
        fontFamily: '"Playfair Display", serif',
        color: "#1f1f1f",
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        lineHeight: 1.6,
        color: "#5D4037",
        fontFamily: '"Inter", sans-serif',
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 30, // Increased gap for cleaner look
    },
    /* Card Common Styles */
    redCard: {
        position: "relative",
        background: "#C02729",
        borderRadius: 32,
        padding: "40px 32px",
        color: "#fff",
        boxShadow: "0 20px 40px rgba(192, 39, 41, 0.2)",
        overflow: "hidden",
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    },
    pinkCard: {
        background: "#FFE4E9",
        borderRadius: 32,
        padding: "40px 32px",
        minHeight: 320,
        display: "flex", // Keep layout consistent
        flexDirection: "column",
        justifyContent: "space-between",
    },
    beigeCard: {
        background: "#F5F0DC",
        borderRadius: 32,
        padding: "40px 32px",
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    },
    imageCard: {
        borderRadius: 32,
        overflow: "hidden",
        minHeight: 320,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    },
    /* Internals */
    glassOverlay: {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0))",
        backdropFilter: "blur(5px)", // Subtle blur
        zIndex: 0,
    },
    cardContentRelative: {
        position: "relative",
        zIndex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        opacity: 0.8,
        fontFamily: '"Inter", sans-serif',
        marginBottom: 20
    },
    cardBody: {
        fontSize: 20,
        fontWeight: 500,
        lineHeight: 1.4,
        fontFamily: '"Inter", sans-serif',
    },
    timeLabel: {
        fontSize: 14,
        opacity: 0.9,
        marginBottom: 4,
        fontWeight: 400
    },
    timeValue: {
        fontSize: 24,
        fontWeight: 600,
    },
    link: {
        color: "inherit",
        textDecoration: "none",
        borderBottom: "1px solid rgba(93, 64, 55, 0.3)",
        paddingBottom: 2,
        transition: "border-color 0.2s",
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
    }
}
