import { motion } from "framer-motion"

export default function Terms() {
    return (
        <section style={styles.section}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={styles.container}
            >
                <h1 style={styles.title}>Terms & Conditions</h1>
                <div style={styles.content}>
                    <p style={styles.disclaimer}>
                        <strong>A Legal Disclaimer</strong><br />
                        Welcome to Kasturi Masale. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. Please review them carefully before making any purchases or using our services.
                    </p>

                    <h3 style={styles.heading}>1. Introduction</h3>
                    <p>These Terms and Conditions apply to your use of the Kasturi Masale website ("Website"), owned and operated by The Spice Emperor Kasturi Masale ("We", "Us", "Our"). By using this Website or purchasing any products, you agree to these Terms and Conditions in full. If you do not accept these Terms, you must refrain from using the Website.</p>

                    <h3 style={styles.heading}>2. Product Information</h3>
                    <p><strong>Accuracy of Information:</strong> We make every effort to display accurate product descriptions, images, and pricing. However, slight variations in color, size, and packaging may occur due to factors beyond our control.</p>
                    <p><strong>Availability:</strong> All products listed on the Website are subject to availability. We reserve the right to discontinue or modify any product without notice.</p>

                    <h3 style={styles.heading}>3. Pricing and Payment</h3>
                    <p><strong>Pricing:</strong> All prices listed on the Website are in INR (Indian Rupees) and are inclusive of all applicable taxes unless stated otherwise.</p>
                    <p><strong>Payment Methods:</strong> We accept payments via major credit cards, debit cards, UPI, and net banking. All transactions are processed through secure payment gateways.</p>
                    <p><strong>Pricing Errors:</strong> In the event of a pricing error, we reserve the right to cancel orders that contain incorrect pricing, whether or not the order has been confirmed and payment received.</p>

                    <h3 style={styles.heading}>4. Order and Shipping Policy</h3>
                    <p><strong>Order Acceptance:</strong> We reserve the right to accept or reject any order placed through the Website. Once an order is confirmed, you will receive a confirmation email.</p>
                    <p><strong>Shipping:</strong> Orders will be shipped to the address provided during the checkout process. We strive to deliver products within the specified time frame, but delivery times may vary based on location and external factors.</p>
                    <p><strong>Shipping Charges:</strong> Shipping charges may vary based on your order size and delivery location and will be displayed during checkout.</p>

                    <h3 style={styles.heading}>5. Return and Refund Policy</h3>
                    <p>For details on returns, refunds, and exchanges, please refer to our Return & Refund Policy.</p>

                    <h3 style={styles.heading}>6. Cancellation Policy</h3>
                    <p><strong>Customer-Initiated Cancellations:</strong> You may cancel your order before it is shipped by contacting us via email at support@thespiceemperor.in or calling 7737379292. Once shipped, cancellations are not allowed.</p>
                    <p><strong>Company-Initiated Cancellations:</strong> We reserve the right to cancel any order due to stock unavailability, pricing errors, or any unforeseen circumstances. In such cases, you will be notified, and a full refund will be issued.</p>

                    <h3 style={styles.heading}>7. Limitation of Liability</h3>
                    <p>To the fullest extent permitted by law, Kasturi Masale will not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from:</p>
                    <ul style={styles.list}>
                        <li>The use or inability to use our Website.</li>
                        <li>Unauthorized access or alterations to your transmissions or data.</li>
                        <li>Errors, omissions, interruptions, or delays in our services.</li>
                    </ul>

                    <h3 style={styles.heading}>8. User Conduct</h3>
                    <p>You agree not to:</p>
                    <ul style={styles.list}>
                        <li>Violate any laws or regulations.</li>
                        <li>Interfere with the proper functioning of the Website.</li>
                        <li>Engage in any fraudulent, abusive, or harmful activity.</li>
                    </ul>

                    <h3 style={styles.heading}>9. Intellectual Property</h3>
                    <p>All content on this Website, including product descriptions, images, logos, and trademarks, are the intellectual property of Kasturi Masale. You may not copy, reproduce, distribute, or use any content without prior written permission.</p>

                    <h3 style={styles.heading}>10. Third-Party Links</h3>
                    <p>Our Website may contain links to third-party websites or services. We do not endorse or assume responsibility for any third-party content or websites.</p>

                    <h3 style={styles.heading}>11. Privacy Policy</h3>
                    <p>Your use of this Website is also governed by our Privacy Policy, which outlines how we collect, use, and protect your personal data.</p>

                    <h3 style={styles.heading}>12. Governing Law</h3>
                    <p>These Terms and Conditions are governed by the laws of India. Any disputes arising out of or relating to these Terms will be subject to the exclusive jurisdiction of the courts in Kolhapur, Maharashtra.</p>

                    <h3 style={styles.heading}>13. Changes to Terms and Conditions</h3>
                    <p>We reserve the right to update or modify these Terms and Conditions at any time without prior notice. Any changes will be effective immediately upon posting on the Website. It is your responsibility to review these Terms regularly.</p>
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
        marginTop: 40,
        marginBottom: 16,
        color: "#2D2A26",
    },
    list: {
        paddingLeft: 20,
        marginBottom: 16,
    }
}

// Mobile responsive
if (typeof window !== "undefined" && window.innerWidth < 768) {
    styles.content.padding = "30px 20px"
}
