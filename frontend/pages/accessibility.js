import { motion } from "framer-motion"

export default function Accessibility() {
    return (
        <section style={styles.section}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={styles.container}
            >
                <h1 style={styles.title}>Accessibility Statement</h1>
                <div style={styles.content}>
                    <p style={styles.intro}>
                        This statement was last updated on January 17, 2026.
                    </p>
                    <p>
                        We at <strong>Kasturi Masale</strong> are working to make our site accessible to people with disabilities.
                    </p>

                    <h3 style={styles.heading}>What web accessibility is</h3>
                    <p>An accessible site allows visitors with disabilities to browse the site with the same or a similar level of ease and enjoyment as other visitors. This can be achieved with the capabilities of the system on which the site is operating, and through assistive technologies.</p>

                    <h3 style={styles.heading}>Accessibility adjustments on this site</h3>
                    <p>We have adapted this site in accordance with WCAG 2.1 guidelines, and have made the site accessible to the level of AA. This site's contents have been adapted to work with assistive technologies, such as screen readers and keyboard use. As part of this effort, we have also:</p>
                    <ul style={styles.list}>
                        <li>Used the Accessibility Wizard to find and fix potential accessibility issues</li>
                        <li>Set the language of the site</li>
                        <li>Set the content order of the site’s pages</li>
                        <li>Defined clear heading structures on all of the site’s pages</li>
                        <li>Added alternative text to images</li>
                        <li>Implemented color combinations that meet the required color contrast</li>
                        <li>Reduced the use of motion on the site where appropriate</li>
                        <li>Ensured all videos, audio, and files on the site are accessible</li>
                    </ul>

                    <h3 style={styles.heading}>Requests, issues and suggestions</h3>
                    <p>If you find an accessibility issue on the site, or if you require further assistance, you are welcome to contact us through the organization's accessibility coordinator:</p>

                    <div style={styles.contactIconBox}>
                        <p><strong>Customer Support Team</strong></p>
                        <p>Phone: <a href="tel:+917737379292" style={styles.link}>7737379292</a></p>
                        <p>Email: <a href="mailto:support@kasturimasale.in" style={styles.link}>support@kasturimasale.in</a></p>
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
        marginBottom: 20,
        fontStyle: "italic",
        opacity: 0.8,
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
    contactIconBox: {
        marginTop: 20,
        padding: "20px",
        background: "#F9F5EC",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.05)",
    },
    link: {
        color: "#C02729",
        textDecoration: "underline",
        fontWeight: 500,
    }
}

// Mobile responsive
if (typeof window !== "undefined" && window.innerWidth < 768) {
    styles.content.padding = "30px 20px"
}
