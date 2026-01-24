import { motion } from "framer-motion"

export default function Privacy() {
    return (
        <section style={styles.section}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={styles.container}
            >
                <h1 style={styles.title}>Privacy Policy</h1>
                <div style={styles.content}>
                    <p style={styles.disclaimer}>
                        <strong>A Legal Disclaimer</strong><br />
                        We collect personal information like name, email, and contact details for order processing and improving user experience.
                    </p>

                    <h3 style={styles.heading}>Kasturi Masale Privacy Policy</h3>

                    <p><strong>Information We Collect:</strong> We gather personal details like name, contact information, and payment data when you place orders or subscribe to our services. We also collect browsing information through cookies to improve user experience.</p>

                    <p><strong>How We Use Your Information:</strong> Your data is used for processing orders, delivering products, and providing customer support. We may also send promotional emails if you've opted in.</p>

                    <p><strong>Data Sharing:</strong> We do not sell or share your personal information with third parties, except for trusted partners like payment processors and shipping providers.</p>

                    <p><strong>Security:</strong> Your personal information is protected using secure encryption and industry-standard measures.</p>

                    <p><strong>Your Rights:</strong> You can access, update, or request the deletion of your personal information at any time. You may also opt-out of marketing emails.</p>

                    <p><strong>Contact Us:</strong> For any questions or concerns, please reach out at <a href="mailto:support@kasturimasale.in" style={styles.link}>support@kasturimasale.in</a> or call 7737379292.</p>
                </div>
            </motion.div>
        </section>
    )
}

const styles = {
    section: {
        padding: "120px 24px 80px",
        background: "#FDFBF7",
        minHeight: "100vh",
    },
    container: {
        maxWidth: 800,
        margin: "0 auto",
    },
    title: {
        fontSize: "clamp(32px, 5vw, 42px)",
        fontFamily: '"Playfair Display", serif',
        color: "#2D2A26",
        marginBottom: 40,
        textAlign: "center",
    },
    content: {
        background: "#fff",
        padding: "40px 50px",
        borderRadius: 24,
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        fontSize: 16,
        lineHeight: 1.8,
        color: "#5D4037",
        fontFamily: '"Inter", sans-serif',
    },
    disclaimer: {
        background: "#f9f9f9",
        padding: "20px",
        borderRadius: 12,
        marginBottom: 30,
        fontStyle: "italic",
        borderLeft: "4px solid #C02729"
    },
    heading: {
        fontSize: 20,
        fontWeight: 700,
        marginTop: 30,
        marginBottom: 16,
        color: "#2D2A26",
    },
    link: {
        color: "#C02729",
        textDecoration: "underline",
    }
}

// Mobile responsive
if (typeof window !== "undefined" && window.innerWidth < 768) {
    styles.content.padding = "30px 20px"
}
