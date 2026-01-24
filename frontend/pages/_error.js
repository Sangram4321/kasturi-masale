import Link from "next/link"

function Error({ statusCode }) {
    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <h1 style={styles.heading}>
                    {statusCode
                        ? `An error ${statusCode} occurred on server`
                        : "An error occurred on client"}
                </h1>
                <p style={styles.text}>
                    We apologize for the inconvenience. Please try refreshing or go back home.
                </p>
                <Link href="/" passHref legacyBehavior>
                    <a style={styles.button}>Back to Home</a>
                </Link>
            </div>
        </section>
    )
}

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404
    return { statusCode }
}

export default Error

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
    heading: {
        fontFamily: "var(--font-heading)",
        fontSize: "2rem",
        color: "#2D2A26",
        marginBottom: 16
    },
    text: {
        fontFamily: "var(--font-body)",
        fontSize: "1.1rem",
        color: "#5D4037",
        marginBottom: 32,
        lineHeight: 1.6
    },
    button: {
        display: "inline-block",
        backgroundColor: "#2D2A26",
        color: "#fff",
        padding: "14px 28px",
        borderRadius: 4,
        textDecoration: "none",
        fontFamily: "var(--font-body)",
        fontWeight: 500,
        fontSize: "1rem"
    }
}
