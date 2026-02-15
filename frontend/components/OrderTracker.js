
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import PremiumTruck from "./PremiumTruck";
import { Check, Clock, Package, Truck, Home } from "lucide-react";

export default function OrderTracker({ status, awb }) {
    // defined stages
    const stages = [
        { id: "PENDING_SHIPMENT", label: "Ordered", icon: Clock },
        { id: "PACKED", label: "Packed", icon: Package },
        { id: "SHIPPED", label: "Shipped", icon: Truck },
        { id: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
        { id: "DELIVERED", label: "Delivered", icon: Home }
    ];

    // Status mapping to index (0 to 4)
    const getStatusIndex = (s) => {
        if (!s) return 0;
        const norm = s.toUpperCase();
        if (norm === "PENDING_SHIPMENT") return 0;
        if (norm === "PACKED") return 1;
        if (norm === "SHIPPED" || norm === "ON_THE_WAY") return 2; // ON_THE_WAY maps to Shipped visually
        if (norm === "OUT_FOR_DELIVERY") return 3;
        if (norm === "DELIVERED") return 4;
        if (norm === "CANCELLED" || norm === "RTO_INITIATED" || norm === "RTO_DELIVERED") return 0; // Edge cases reset
        return 0;
    };

    const activeIndex = getStatusIndex(status);

    // Calculate progress percentage (0%, 25%, 50%, 75%, 100%)
    const progress = (activeIndex / (stages.length - 1)) * 100;

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <h3 style={styles.title}>Shipment Status</h3>
                {awb && (
                    <a
                        href={`https://www.ithinklogistics.com/track-order?awb=${awb}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.trackLink}
                    >
                        Track on Carrier Website &rarr;
                    </a>
                )}
            </div>

            <div style={styles.trackerWrapper}>
                {/* PROGRESS BAR BACKGROUND */}
                <div style={styles.progressBarBg}>
                    {/* FILLED PROGRESS BAR */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        style={styles.progressBarFill}
                    />
                </div>

                {/* STEPS (DOTS) */}
                <div style={styles.stepsContainer}>
                    {stages.map((stage, i) => {
                        const isActive = i <= activeIndex;
                        const isCurrent = i === activeIndex;
                        const Icon = stage.icon;

                        return (
                            <div key={stage.id} style={styles.stepWrapper}>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: isActive ? 1 : 0.8, opacity: 1 }}
                                    transition={{ delay: i * 0.2 }}
                                    style={{
                                        ...styles.dot,
                                        background: isActive ? "#10B981" : "#E5E7EB",
                                        boxShadow: isCurrent ? "0 0 0 4px #D1FAE5" : "none"
                                    }}
                                >
                                    {isActive ? (
                                        <Check size={14} color="#fff" strokeWidth={3} />
                                    ) : (
                                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#9CA3AF" }} />
                                    )}
                                </motion.div>
                                <span style={{
                                    ...styles.label,
                                    color: isActive ? "#111827" : "#9CA3AF",
                                    fontWeight: isActive ? 600 : 400
                                }}>
                                    {stage.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* ANIMATED TRUCK */}
                <motion.div
                    initial={{ left: "0%" }}
                    animate={{ left: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    style={styles.truckContainer}
                >
                    <div style={{ transform: "scale(0.6) translateY(-50%) translate(-50%, -20px)" }}>
                        <PremiumTruck status={activeIndex < 4 ? "driving" : "idle"} />
                    </div>
                    {/* Tooltip for Truck */}
                    <div style={styles.truckTooltip}>
                        {activeStageLabel(status)}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

const activeStageLabel = (s) => {
    if (!s) return "Processing";
    return s.replace(/_/g, " ");
};

const styles = {
    container: {
        background: "#fff",
        borderRadius: 16,
        padding: "24px 20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        border: "1px solid #F3F4F6",
        marginBottom: 24,
        overflow: "visible" // Allow truck to peek if needed
    },
    headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 40
    },
    title: {
        fontSize: 18,
        fontWeight: 700,
        color: "#111827",
        margin: 0
    },
    trackLink: {
        fontSize: 13,
        color: "#2563EB",
        textDecoration: "none",
        fontWeight: 600,
        border: "1px solid #DBEAFE",
        padding: "6px 12px",
        borderRadius: 8,
        background: "#EFF6FF"
    },
    trackerWrapper: {
        position: "relative",
        height: 100, // Reserve space for labels and truck
        margin: "0 10px"
    },
    progressBarBg: {
        position: "absolute",
        top: 20,
        left: 0,
        right: 0,
        height: 4,
        background: "#F3F4F6",
        borderRadius: 4,
        zIndex: 1
    },
    progressBarFill: {
        height: "100%",
        background: "#10B981",
        borderRadius: 4
    },
    stepsContainer: {
        position: "absolute",
        top: 10, // Align dots vertically center to bar (bar top is 20, height 4 -> center 22. dot size 24 -> top 10 centers it)
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-between",
        zIndex: 2
    },
    stepWrapper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 80, // Fixed width to center label
        transform: "translateX(0)" // Handled by layout since it's space-between
    },
    dot: {
        width: 24,
        height: 24,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        background: "#fff",
        border: "2px solid #fff" // creating a gap effect if needed
    },
    label: {
        fontSize: 11,
        textAlign: "center",
        lineHeight: 1.2
    },
    truckContainer: {
        position: "absolute",
        top: 20, // Align with bar
        // left is animated
        zIndex: 3,
        transform: "translateX(-50%)" // Center truck on the point
    },
    truckTooltip: {
        position: "absolute",
        top: -45, // Above truck
        left: "50%",
        transform: "translateX(-50%)",
        background: "#111827",
        color: "#fff",
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: 10,
        fontWeight: 600,
        whiteSpace: "nowrap",
        pointerEvents: "none"
    }
};
