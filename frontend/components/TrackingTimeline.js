import { motion } from "framer-motion";

export default function TrackingTimeline({ history, currentStatus, awb }) {
    if (!history || history.length === 0) {
        return (
            <div style={styles.container}>
                <h3 style={styles.header}>Tracking Status</h3>
                <div style={styles.empty}>
                    Tracking details for AWB <strong>#{awb}</strong> are being updated.
                    <br />Currently: <strong>{currentStatus}</strong>
                </div>
            </div>
        );
    }

    // Sort history by date descending (newest first)
    const sortedHistory = [...history].reverse();

    return (
        <div style={styles.container}>
            <h3 style={styles.header}>Shipment Journey</h3>
            <p style={styles.awb}>AWB: {awb}</p>

            <div style={styles.timeline}>
                {sortedHistory.map((event, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={styles.eventItem}
                    >
                        {/* Dot & Line */}
                        <div style={styles.lineCol}>
                            <div style={index === 0 ? styles.dotActive : styles.dot}></div>
                            {index !== sortedHistory.length - 1 && <div style={styles.line}></div>}
                        </div>

                        {/* Content */}
                        <div style={styles.contentCol}>
                            <div style={styles.status}>{event.scan_status || event.status}</div>
                            <div style={styles.location}>{event.scan_location || event.location}</div>
                            <div style={styles.time}>
                                {new Date(event.scan_date_time || event.date).toLocaleString()}
                            </div>
                            {event.scan_comment && <div style={styles.comment}>{event.scan_comment}</div>}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    container: {
        background: "#fff",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        marginTop: 24
    },
    header: {
        fontSize: 18,
        fontWeight: 700,
        color: "#111827",
        marginBottom: 8
    },
    awb: {
        fontSize: 13,
        color: "#6B7280",
        marginBottom: 24,
        fontWeight: 500
    },
    timeline: {
        display: "flex",
        flexDirection: "column",
        gap: 0
    },
    eventItem: {
        display: "flex",
        gap: 16,
        minHeight: 80
    },
    lineCol: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 20
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: "#E5E7EB",
        zIndex: 2
    },
    dotActive: {
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: "#16A34A", // Green
        boxShadow: "0 0 0 4px #DCFCE7",
        zIndex: 2
    },
    line: {
        flex: 1,
        width: 2,
        background: "#F3F4F6",
        margin: "4px 0"
    },
    contentCol: {
        flex: 1,
        paddingBottom: 24
    },
    status: {
        fontSize: 15,
        fontWeight: 600,
        color: "#374151"
    },
    location: {
        fontSize: 13,
        color: "#6B7280",
        marginTop: 2
    },
    time: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 4
    },
    comment: {
        fontSize: 12,
        fontStyle: "italic",
        color: "#6B7280",
        marginTop: 4
    },
    empty: {
        padding: 20,
        textAlign: "center",
        color: "#6B7280",
        fontSize: 14,
        background: "#F9FAFB",
        borderRadius: 8
    }
};
