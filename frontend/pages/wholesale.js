import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

export default function Wholesale() {
    const [loading, setLoading] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

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
            const email = formData.get("email")
            const phone = formData.get("phone")
            const message = formData.get("message")

            const subject = `Wholesale Inquiry from ${name}`
            const body = `Name: ${name}%0D%0ACompany: ${company}%0D%0AEmail: ${email}%0D%0APhone: ${phone}%0D%0A%0D%0AMessage:%0D%0A${message}`

            window.location.href = `mailto:support@kasturimasale.in?subject=${subject}&body=${body}`
        }, 1500)
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.8, staggerChildren: 0.15 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
    }

    // Dynamic Styles for Responsive Design
    const dynamicStyles = {
        grid: {
            ...styles.grid,
            gridTemplateColumns: isMobile ? "1fr" : "0.8fr 1.2fr",
            gap: isMobile ? 40 : 80,
        },
        title: {
            ...styles.title,
            fontSize: isMobile ? 42 : 64,
        },
        formCard: {
            ...styles.formCard,
            padding: isMobile ? "40px 24px" : "60px",
        }
    }

    return (
        <section style={styles.section}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={styles.container}
            >
                <div style={dynamicStyles.grid}>

                    {/* LEFT CONTENT */}
                    <div style={styles.left}>
                        <motion.span variants={itemVariants} style={styles.eyebrow}>
                            Partner with Us
                        </motion.span>
                        <motion.h1 variants={itemVariants} style={dynamicStyles.title}>
                            Wholesale &<br />Bulk Orders
                        </motion.h1>
                        <motion.p variants={itemVariants} style={styles.description}>
                            Join our network of premium retailers and restaurants.
                            We provide consistent, high-grade spices sourced directly
                            from origin, ensuring your customers taste the difference.
                        </motion.p>

                        <motion.div variants={itemVariants} style={styles.benefitsList}>
                            <BenefitItem icon="✨" text="Premium Grade Quality" />
                            <BenefitItem icon="📦" text="Flexible Bulk Packaging" />
                            <BenefitItem icon="🚚" text="Priority Shipping" />
                        </motion.div>

                        <motion.div variants={itemVariants} style={styles.imageWrapper}>
                            {/* Placeholder or specific wholesale image */}
                            <img src="/images/hero/hero-ingredients-2.png" alt="Premium Spices" style={styles.image} />
                        </motion.div>
                    </div>

                    {/* RIGHT FORM */}
                    <motion.div
                        variants={itemVariants}
                        style={dynamicStyles.formCard}
                    >
                        {/* Decorative Background Element */}
                        <div style={styles.cardPattern} />

                        <div style={styles.formContent}>
                            <h3 style={styles.formTitle}>Request a Quote</h3>
                            <p style={styles.formSubtitle}>Fill out the details below and our sales team will get back to you within 24 hours.</p>

                            <form style={styles.form} onSubmit={handleSubmit}>
                                <div style={styles.row}>
                                    <Field label="Full Name" name="name" type="text" placeholder="John Doe" />
                                    <Field label="Company / Store" name="company" type="text" placeholder="The Spice House" />
                                </div>
                                <div style={styles.row}>
                                    <Field label="Email Address" name="email" type="email" required placeholder="john@example.com" />
                                    <div style={styles.field}>
                                        <label style={styles.label}>Phone Number</label>
                                        <div style={styles.phoneInputWrap}>
                                            <span style={styles.countryCode}>+91</span>
                                            <input name="phone" type="tel" style={styles.phoneInput} placeholder="98765 43210" />
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.field}>
                                    <label style={styles.label}>Message / Requirements</label>
                                    <textarea name="message" style={styles.textarea} rows={4} placeholder="I'm interested in bulk pricing for..."></textarea>
                                </div>

                                <motion.button
                                    type="submit"
                                    style={styles.submitBtn}
                                    whileHover={{ scale: 1.01, backgroundColor: "#fff", color: "#8B1E20" }} // Invert on hover
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
                                                <div style={styles.spinner} /> Sending...
                                            </motion.div>
                                        ) : (
                                            <motion.span key="idle">Send Inquiry</motion.span>
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
            <label style={styles.label}>{label} {required && <span style={{ color: '#ff6b6b' }}>*</span>}</label>
            <input name={name} type={type} style={styles.input} required={required} placeholder={placeholder} />
        </div>
    )
}

function BenefitItem({ icon, text }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontFamily: '"Inter", sans-serif', color: '#5D4037', fontSize: 15, fontWeight: 500 }}>{text}</span>
        </div>
    )
}

const styles = {
    section: {
        background: "#F9F5F1", // Warm beige background
        minHeight: "100vh",
        padding: "140px 24px 80px",
        overflow: "hidden"
    },
    container: {
        maxWidth: 1280,
        margin: "0 auto",
    },
    grid: {
        display: "grid",
        alignItems: "stretch", // Stretch to match heights
    },

    /* Left Content */
    left: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingRight: 20
    },
    eyebrow: {
        fontFamily: '"Inter", sans-serif',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "#C02729",
        marginBottom: 16,
        display: "block"
    },
    title: {
        fontFamily: '"Playfair Display", serif',
        color: "#1f1f1f",
        lineHeight: 1.05,
        marginBottom: 24,
        letterSpacing: "-0.02em"
    },
    description: {
        fontFamily: '"Inter", sans-serif',
        fontSize: 17,
        lineHeight: 1.6,
        color: "#5D4037",
        maxWidth: 480,
        marginBottom: 32,
        opacity: 0.9
    },
    benefitsList: {
        marginBottom: 40
    },
    imageWrapper: {
        width: '100%',
        maxWidth: 420,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
        marginTop: 'auto' // Push to bottom if space permits
    },
    image: {
        width: "100%",
        display: "block",
        transform: "scale(1.05)"
    },

    /* Right Form Card */
    formCard: {
        background: "#8B1E20", // Deep Premium Red
        borderRadius: 32,
        color: "#fff",
        boxShadow: "0 40px 80px -20px rgba(139, 30, 32, 0.4)",
        position: "relative",
        overflow: "hidden",
    },
    cardPattern: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
        zIndex: 0
    },
    formContent: {
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    formTitle: {
        fontFamily: '"Playfair Display", serif',
        fontSize: 32,
        color: "#fff",
        marginBottom: 12,
    },
    formSubtitle: {
        fontFamily: '"Inter", sans-serif',
        fontSize: 15,
        color: "rgba(255,255,255,0.8)",
        marginBottom: 40,
        maxWidth: '90%'
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 24,
    },
    row: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
        '@media (max-width: 768px)': {
            gridTemplateColumns: "1fr"
        }
    },
    field: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        flex: 1
    },
    label: {
        fontFamily: '"Inter", sans-serif',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.7)"
    },
    input: {
        background: "#fff",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: "16px 20px",
        fontSize: 16,
        color: "#1a1a1a",
        fontFamily: '"Inter", sans-serif',
        outline: "none",
        transition: "all 0.2s ease",
        width: '100%'
    },
    phoneInputWrap: {
        display: 'flex',
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        border: "1px solid rgba(255,255,255,0.1)",
    },
    countryCode: {
        background: '#f5f5f5',
        padding: '16px 16px',
        color: '#555',
        fontSize: 15,
        fontWeight: 600,
        borderRight: '1px solid #ddd',
        fontFamily: '"Inter", sans-serif',
    },
    phoneInput: {
        border: 'none',
        padding: '16px 20px',
        fontSize: 16,
        flex: 1,
        outline: 'none',
        fontFamily: '"Inter", sans-serif',
    },
    textarea: {
        background: "#fff",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: "16px 20px",
        fontSize: 16,
        color: "#1a1a1a",
        fontFamily: '"Inter", sans-serif',
        outline: "none",
        minHeight: 120,
        resize: "vertical",
        width: '100%'
    },
    submitBtn: {
        marginTop: 16,
        background: "#F7EFDB", // Brand Cream
        color: "#8B1E20",
        border: "none",
        borderRadius: 12,
        padding: "20px",
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "all 0.3s ease",
        fontFamily: '"Inter", sans-serif',
    },
    spinner: {
        width: 18,
        height: 18,
        border: "2px solid rgba(0,0,0,0.1)",
        borderTopColor: "currentColor",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
    }
}

// Add keyframes
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    input::placeholder, textarea::placeholder {
        color: #aaa;
    }
  `
    document.head.appendChild(styleSheet)
}
