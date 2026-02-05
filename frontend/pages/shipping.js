import { motion } from "framer-motion"

export default function Shipping() {
    return (
        <section style={styles.section}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={styles.container}
            >
                <h1 style={styles.title}>Shipping Policy</h1>
                <div style={styles.content}>

                    <h3 style={styles.heading}>1. Shipping Locations</h3>
                    <p>We ship across India to all major cities and towns. Unfortunately, we do not currently offer international shipping.</p>

                    <h3 style={styles.heading}>2. Processing Time</h3>
                    <p><strong>Order Processing:</strong> All orders are processed within 1-2 business days after payment confirmation. Orders placed on weekends or public holidays will be processed on the next business day.</p>
                    <p><strong>Delays:</strong> In rare cases of high order volumes or unforeseen circumstances, processing times may be delayed. We will notify you via email or phone in such cases.</p>

                    <h3 style={styles.heading}>3. Shipping Charges</h3>
                    <p><strong>Free Shipping above ₹500:</strong> We offer free shipping on all orders with a value above ₹500. For orders below this amount, a standard shipping fee of ₹50 applies. COD handling charges (₹40) are separate and applicable if Cash on Delivery is selected.</p>

                    <h3 style={styles.heading}>4. Delivery Time</h3>
                    <p><strong>Standard Delivery:</strong> Orders are typically delivered within 3-7 business days after they are shipped, depending on your location.</p>
                    <ul style={styles.list}>
                        <li><strong>Metro Cities:</strong> 3-4 business days.</li>
                        <li><strong>Other Cities & Towns:</strong> 5-7 business days.</li>
                    </ul>
                    <p>Delivery times may vary during peak seasons, sales, or due to external factors such as weather conditions or lockdowns. We will notify you of any potential delays.</p>

                    <h3 style={styles.heading}>5. Tracking Your Order</h3>
                    <p>Once your order is shipped, you will receive an email or SMS notification with the tracking number and details on how to track your shipment. You can monitor your delivery status on the courier’s website.</p>

                    <h3 style={styles.heading}>6. Missed Delivery</h3>
                    <p>If a delivery attempt is unsuccessful due to the recipient being unavailable, the courier service may attempt delivery again. After multiple failed attempts, the order may be returned to us. In such cases, we will contact you to arrange a re-delivery.</p>

                    <h3 style={styles.heading}>7. Order Modifications</h3>
                    <p>Once an order has been placed, it cannot be modified. If you need to change the shipping address, please contact us immediately at <a href="mailto:support@kasturimasale.in" style={styles.link}>support@kasturimasale.in</a> or call 7737379292. Changes to the address can only be made before the order has been shipped.</p>

                    <h3 style={styles.heading}>8. Damaged or Lost Packages</h3>
                    <p><strong>Damaged Goods:</strong> If your package arrives damaged, please notify us within 48 hours of delivery with photos of the damaged package and products. We will work to resolve the issue and either offer a replacement or a refund based on the circumstances.</p>
                    <p><strong>Lost Packages:</strong> If your order is marked as delivered but you have not received it, please contact us immediately at 7737379292. We will liaise with the courier to investigate and resolve the issue.</p>

                    <h3 style={styles.heading}>9. Wrong Address Disclaimer</h3>
                    <p>Kasturi Masale is not responsible for packages not delivered due to incorrect or incomplete addresses provided by the customer. Please double-check your delivery details before completing the order.</p>

                    <div style={styles.contactBox}>
                        <p><strong>Contact Information</strong></p>
                        <p>If you have any questions regarding shipping, feel free to contact our customer support team at:</p>
                        <p style={{ marginTop: 12 }}>Email: <a href="mailto:support@kasturimasale.in" style={styles.link}>support@kasturimasale.in</a></p>
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
