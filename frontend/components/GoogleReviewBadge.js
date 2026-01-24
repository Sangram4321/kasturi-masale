import { motion } from "framer-motion";

const GOOGLE_ICON = (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M21.35 11.1H12.18V13.83H17.5C17.21 15.19 16.35 16.89 12.18 16.89C9.37 16.89 7.07 14.7 7.07 11.89C7.07 9.09 9.37 6.89 12.18 6.89C13.85 6.89 14.86 7.61 15.5 8.21L17.57 6.25C16.2 5.01 14.37 4.09 12.18 4.09C7.88 4.09 4.39 7.58 4.39 11.89C4.39 16.2 7.88 19.69 12.18 19.69C16.48 19.69 19.86 16.2 19.86 11.89C19.86 11.62 19.84 11.36 19.81 11.1H21.35Z"
            fill="currentColor"
        />
        <path
            d="M12.18 4.09C14.37 4.09 16.2 5.01 17.57 6.25L15.5 8.21C14.86 7.61 13.85 6.89 12.18 6.89C9.37 6.89 7.07 9.09 7.07 11.89C7.07 12.42 7.15 12.92 7.29 13.4L4.54 15.2C4.44 14.15 4.39 13.04 4.39 11.89C4.39 7.58 7.88 4.09 12.18 4.09Z"
            fill="#EA4335"
        />
        <path
            d="M12.18 19.69C14.41 19.69 16.27 18.94 17.61 17.72L15.34 15.26C14.54 15.82 13.49 16.21 12.18 16.21C10.03 16.21 8.16 14.87 7.43 12.87L4.69 15.17C5.97 17.82 8.84 19.69 12.18 19.69Z"
            fill="#34A853"
        />
        <path
            d="M7.43 12.87C7.26 12.24 7.15 11.58 7.15 10.89C7.15 10.2 7.26 9.54 7.43 8.91L4.69 6.61C4.12 7.91 3.79 9.35 3.79 10.89C3.79 12.43 4.12 13.87 4.69 15.17L7.43 12.87Z"
            fill="#FBBC05"
        />
        <path
            d="M21.35 11.1H12.18V13.83H17.5C17.18 15.5 16.32 17.06 15.34 15.26L17.61 17.72C19.7 15.7 20.8 13.04 20.8 10.89C20.8 10.35 20.73 9.87 20.62 9.4L21.35 11.1Z"
            fill="#4285F4"
        />
    </svg>
);

const STARS = (
    <div style={{ display: "flex", gap: 2 }}>
        {[...Array(5)].map((_, i) => (
            <svg
                key={i}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="#FBBC05"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
        ))}
    </div>
);

export default function GoogleReviewBadge({ variant = "standard" }) {
    const isLarge = variant === "large";

    return (
        <motion.a
            href="https://share.google/sxB76mJ75YvtjFHUZ"
            target="_blank"
            rel="noopener noreferrer"
            style={{
                ...styles.container,
                ...(isLarge ? styles.largeContainer : {}),
            }}
            whileHover="hover"
            initial="rest"
            animate="rest"
        >
            <div style={styles.glassBg} />

            {/* SHINE EFFECT */}
            <motion.div
                variants={{
                    rest: { x: "-100%", opacity: 0 },
                    hover: { x: "200%", opacity: 0.5, transition: { duration: 0.8, ease: "easeInOut" } }
                }}
                style={styles.shine}
            />

            {/* CONTENT */}
            <motion.div
                style={styles.content}
                variants={{
                    rest: { scale: 1 },
                    hover: { scale: 1.02 }
                }}
            >
                <div style={styles.iconWrapper}>
                    {GOOGLE_ICON}
                </div>

                <div style={styles.textCol}>
                    <div style={styles.ratingRow}>
                        {STARS}
                        <span style={styles.ratingText}>5.0</span>
                    </div>
                    <p style={styles.reviewCount}>Based on 50+ Reviews</p>
                </div>

                <motion.div
                    style={styles.arrowIcon}
                    variants={{
                        rest: { x: 0 },
                        hover: { x: 4 }
                    }}
                >
                    →
                </motion.div>
            </motion.div>
        </motion.a>
    );
}

const styles = {
    container: {
        position: "relative",
        display: "inline-flex",
        textDecoration: "none",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
    },
    largeContainer: {
        width: "100%",
        height: "100%",
        minHeight: 140, // Match typical card height if needed
        borderRadius: 32,
        border: "none",
        background: "#fff",
        boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
    },
    glassBg: {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))",
        zIndex: 0,
    },
    shine: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "50%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
        transform: "skewX(-20deg)",
        zIndex: 1,
        pointerEvents: "none",
    },
    content: {
        position: "relative",
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        gap: 12,
        width: "100%",
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    textCol: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
    },
    ratingRow: {
        display: "flex",
        alignItems: "center",
        gap: 6,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2D2A26",
        fontFamily: '"Inter", sans-serif',
    },
    reviewCount: {
        fontSize: 12,
        color: "#5D4037",
        opacity: 0.8,
        margin: 0,
        fontFamily: '"Inter", sans-serif',
    },
    arrowIcon: {
        marginLeft: "auto",
        fontSize: 18,
        color: "#C02729",
        fontWeight: 600,
    }
};
