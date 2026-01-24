import { motion } from "framer-motion"

export default function Refund() {
    return (
        <section style={styles.section}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={styles.container}
            >
                <h1 style={styles.title}>Refund Policy</h1>
                <div style={styles.content}>
                    <p style={styles.intro}>
                        At Kasturi Masale, we take pride in offering you the highest quality spices. Your satisfaction is our top priority, and if for any reason you're not happy with your purchase, we're here to help.
                    </p>

                    <h3 style={styles.heading}>Eligibility for Returns</h3>

                    <p><strong>Unopened and Unused Items:</strong></p>
                    <ul style={styles.list}>
                        <li>Products must be returned in their original packaging, unopened, and unused.</li>
                        <li>The request must be initiated within 7 days of receiving the order.</li>
                    </ul>

                    <p><strong>Damaged or Incorrect Products:</strong></p>
                    <ul style={styles.list}>
                        <li>If you receive a damaged product or an incorrect item, please notify us within 48 hours of delivery.</li>
                        <li>Kindly share photos of the damaged/incorrect product along with your order details when contacting us.</li>
                    </ul>

                    <h3 style={styles.heading}>Non-Returnable Items</h3>
                    <ul style={styles.list}>
                        <li>Products that have been opened, used, or tampered with.</li>
                        <li>Items purchased during sale or clearance events.</li>
                        <li>Customized or special order products.</li>
                    </ul>

                    <h3 style={styles.heading}>Return Process</h3>
                    <p><strong>Contact Us:</strong></p>
                    <ul style={styles.list}>
                        <li>Email us at <a href="mailto:support@kasturimasale.in" style={styles.link}>support@kasturimasale.in</a> or call us at 7737379292 within the return window mentioned above.</li>
                        <li>Provide your order number, the reason for return, and any supporting documents (such as photos in case of damaged goods).</li>
                    </ul>

                    <p><strong>Return Shipping:</strong></p>
                    <ul style={styles.list}>
                        <li>We will arrange for a reverse pickup of the product, free of charge in the event of damaged or incorrect orders.</li>
                        <li>For other returns (unopened and unused items), customers are responsible for return shipping costs.</li>
                    </ul>

                    <h3 style={styles.heading}>Refund or Exchange</h3>
                    <p>Once we receive and inspect the returned product, we will notify you about the approval or rejection of your return.</p>
                    <p><strong>For approved returns:</strong></p>
                    <ul style={styles.list}>
                        <li><strong>Refunds:</strong> Refunds will be processed within 7-10 business days to your original method of payment.</li>
                        <li><strong>Exchanges:</strong> If you prefer an exchange, we will process it after receiving the returned item.</li>
                    </ul>

                    <h3 style={styles.heading}>Important Notes</h3>
                    <ul style={styles.list}>
                        <li>Refunds will not be initiated for products that do not meet the return criteria.</li>
                        <li>Please ensure that the product is well-packed to avoid any damage during transit.</li>
                        <li>We thank you for shopping with Kasturi Masale and look forward to serving you again!</li>
                    </ul>

                    <div style={styles.contactBox}>
                        <p><strong>For any assistance:</strong></p>
                        <p>Email: <a href="mailto:support@kasturimasale.in" style={styles.link}>support@kasturimasale.in</a></p>
                        <p>Phone: 7737379292</p>
                    </div>
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
    intro: {
        fontSize: 17,
        fontStyle: "italic",
        marginBottom: 30,
        color: "#2D2A26",
    },
    heading: {
        fontSize: 20,
        fontWeight: 700,
        marginTop: 30,
        marginBottom: 16,
        color: "#2D2A26",
    },
    list: {
        paddingLeft: 20,
        marginBottom: 16,
    },
    link: {
        color: "#C02729",
        textDecoration: "underline",
    },
    contactBox: {
        marginTop: 40,
        padding: 24,
        background: "#F9F5EC",
        borderRadius: 12,
    }
}

// Mobile responsive
if (typeof window !== "undefined" && window.innerWidth < 768) {
    styles.content.padding = "30px 20px"
}
