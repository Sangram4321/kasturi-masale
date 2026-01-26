import { useState } from "react";
import { useRouter } from "next/router";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

export default function TrackingInput() {
    const [input, setInput] = useState("");
    const router = useRouter();

    const handleTrack = (e) => {
        e.preventDefault();
        if (input.trim().length > 3) {
            router.push(`/order/${input.trim()}`);
        }
    };

    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <h2 style={styles.title}>Track Your Order</h2>
                <p style={styles.subtitle}>Enter your Order ID (ORD-...) or Tracking Number (AWB)</p>

                <form onSubmit={handleTrack} style={styles.form}>
                    <div style={styles.inputWrapper}>
                        <Search size={20} color="#9CA3AF" />
                        <input
                            type="text"
                            placeholder="e.g. ORD-1715 or 123456789"
                            style={styles.input}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        style={styles.button}
                    >
                        Track
                    </motion.button>
                </form>
            </div>
        </section>
    );
}

const styles = {
    section: {
        background: "#fff",
        padding: "60px 20px",
        borderTop: "1px solid #f3f4f6",
        borderBottom: "1px solid #f3f4f6"
    },
    container: {
        maxWidth: 600,
        margin: "0 auto",
        textAlign: "center"
    },
    title: {
        fontSize: 28,
        fontWeight: 800,
        color: "#111827",
        marginBottom: 8,
        fontFamily: "var(--font-heading)"
    },
    subtitle: {
        color: "#6B7280",
        marginBottom: 32,
        fontSize: 15
    },
    form: {
        display: "flex",
        gap: 12,
        maxWidth: 480,
        margin: "0 auto",
        flexWrap: "wrap"
    },
    inputWrapper: {
        flex: 1,
        background: "#F9FAFB",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 240
    },
    input: {
        border: "none",
        background: "transparent",
        flex: 1,
        padding: "16px 0",
        fontSize: 15,
        outline: "none",
        color: "#1F2937"
    },
    button: {
        background: "#111827", // Black
        color: "#fff",
        border: "none",
        padding: "0 32px",
        height: 52, // Match input height roughly
        borderRadius: 12,
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        flexShrink: 0
    }
};
