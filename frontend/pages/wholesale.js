import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export default function Wholesale() {
    const [loading, setLoading] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)

        // Simulate processing
        setTimeout(() => {
            setLoading(false)

            // Construct Mailto
            const formData = new FormData(e.target)
            const name = formData.get("name")
            const company = formData.get("company")
            const phone = formData.get("phone")
            const message = formData.get("message")

            const subject = `Wholesale Inquiry from ${name}`
            const body = `Name: ${name}%0D%0ACompany: ${company}%0D%0APhone: ${phone}%0D%0A%0D%0AMessage:%0D%0A${message}`

            window.location.href = `mailto:support@kasturimasale.in?subject=${subject}&body=${body}`
        }, 1500)
    }

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
                <div style={styles.grid}>

                    {/* LEFT CONTENT */}
                    <div style={styles.left}>
                        <motion.h1 variants={itemVariants} style={styles.title}>Wholesale<br />Request Form</motion.h1>
                        <motion.p variants={itemVariants} style={styles.description}>
                            Our wholesale program is dedicated to building long-lasting partnerships.
                            We prioritize transparency in every transaction and are committed to delivering
                            top-quality, organic spices that meet your business needs.
                        </motion.p>

                        <motion.div variants={itemVariants} style={styles.imageWrapper}>
                            <img src="/images/hero/hero-ingredients-2.png" alt="Spices" style={styles.image} />
                        </motion.div>
                    </div>

                    {/* RIGHT FORM */}
                    <motion.div
                        variants={itemVariants}
                        style={styles.formCard}
                    >
                        <div style={styles.glassOverlay} />
                        <div style={styles.formContent}>
                            <h3 style={styles.formTitle}>
                                Fill out the form, and our team of spice experts will contact you
                            </h3>

                            <form style={styles.form} onSubmit={handleSubmit}>
                                <Field label="FULL NAME" name="name" type="text" placeholder="John Doe" />
                                <Field label="Company / store" name="company" type="text" placeholder="The Spice Emperor" />
                                <Field label="EMAIL ADDRESS *" name="email" type="email" required placeholder="name@example.com" />

                                <div style={styles.field}>
                                    <label style={styles.label}>PHONE NUMBER</label>
                                    <div style={styles.phoneInputWrap}>
                                        <span style={styles.globeIcon}>🇮🇳 +91</span>
                                        <input name="phone" type="tel" style={{ ...styles.input, paddingLeft: 80 }} placeholder="98765 43210" />
                                    </div>
                                </div>

                                <div style={styles.field}>
                                    <label style={styles.label}>MESSAGE</label>
                                    <textarea name="message" style={styles.textarea} rows={4} placeholder="Tell us about your requirements..."></textarea>
                                </div>

                                <motion.button
                                    type="submit"
                                    style={styles.submitBtn}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                >
                                    <AnimatePresence mode="wait">
                                        {loading ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
                                            >
                                                <div style={styles.spinner} /> Processing...
                                            </motion.div>
                                        ) : (
                                            <motion.span key="idle">SUBMIT REQUEST</motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>

                </div>
            </motion.div>
        </section>
    )
}

function Field({ label, name, type, required, placeholder }) {
    return (
        <div style={styles.field}>
            <label style={styles.label}>{label}</label>
            <input name={name} type={type} style={styles.input} required={required} placeholder={placeholder} />
        </div>
    )
}

const styles = {
    section: {
        padding: "120px 24px 80px",
        background: "#fff",
        minHeight: "100vh",
    },
    container: {
        maxWidth: 1100,
        margin: "0 auto",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 60,
        alignItems: "start",
    },

    /* Left Styles */
    left: {
        paddingTop: 20,
    },
    title: {
        fontSize: "clamp(40px, 5vw, 56px)",
        lineHeight: 1.1,
        fontFamily: '"Playfair Display", serif',
        color: "#1f1f1f",
        marginBottom: 30,
    },
    description: {
        fontSize: 18,
        lineHeight: 1.6,
        color: "#5D4037",
        marginBottom: 60,
        maxWidth: 450,
        fontFamily: '"Inter", sans-serif',
    },
    imageWrapper: {
        maxWidth: 400,
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
    },
    image: {
        width: "100%",
        display: "block",
    },

    /* Right Form Styles */
    formCard: {
        position: "relative",
        background: "#C02729", // Red brand color
        borderRadius: 32,
        color: "#fff",
        boxShadow: "0 30px 60px rgba(192, 39, 41, 0.25)",
        overflow: "hidden",
    },
    glassOverlay: {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))",
        backdropFilter: "blur(10px)", // Glass effect
        zIndex: 0,
    },
    formContent: {
        position: "relative",
        zIndex: 1,
        padding: "40px",
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 500,
        marginBottom: 30,
        lineHeight: 1.5,
        opacity: 0.95,
        fontFamily: '"Inter", sans-serif',
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 20,
    },
    field: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    label: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        opacity: 0.9,
        color: "rgba(255,255,255,0.9)"
    },
    input: {
        background: "#E3F2FD", // Light Blue/White background for visibility
        border: "none",
        padding: "16px",
        color: "#2D2A26", // Dark text
        fontSize: 16,
        outline: "none",
        borderRadius: 8,
        fontFamily: '"Inter", sans-serif',
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
    },
    phoneInputWrap: {
        position: "relative",
    },
    globeIcon: {
        position: "absolute",
        left: 16,
        top: 16,
        fontSize: 14,
        color: "#555",
        fontWeight: 500,
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        gap: 4
    },
    textarea: {
        background: "#fff",
        border: "none",
        padding: "16px",
        color: "#2D2A26",
        fontSize: 16,
        outline: "none",
        borderRadius: 8,
        resize: "vertical",
        fontFamily: '"Inter", sans-serif',
        minHeight: 120,
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
    },
    submitBtn: {
        background: "#F7EFDB", // Cream/Beige
        color: "#8B1E20",
        border: "none",
        padding: "18px",
        fontSize: 15,
        fontWeight: 800,
        letterSpacing: "0.1em",
        borderRadius: 12,
        marginTop: 10,
        cursor: "pointer",
        textTransform: "uppercase",
        boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 56
    },
    spinner: {
        width: 20,
        height: 20,
        border: "2px solid rgba(139, 30, 32, 0.2)",
        borderTopColor: "#8B1E20",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
    }
}

// Global style for spinner
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `
    document.head.appendChild(styleSheet)
}

// Mobile
if (typeof window !== "undefined" && window.innerWidth < 900) {
    styles.grid.gridTemplateColumns = "1fr";
    styles.grid.gap = "40px";
    styles.formContent.padding = "30px 20px";
    styles.title.fontSize = "36px";
}
