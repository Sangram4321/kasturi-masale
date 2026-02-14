import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WhatsAppButton = () => {
    // Show after scrolling a bit, or always visible? 
    // Let's make it always visible but animate in.
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const phoneNumber = "917737379292"; // From Footer.js
    const message = encodeURIComponent("Hi Kasturi Masale, I want to place an order.");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={styles.button}
                    aria-label="Chat on WhatsApp"
                >
                    <img
                        src="/images/icons/whatsapp.svg"
                        alt="WhatsApp"
                        style={styles.icon}
                    />
                </motion.a>
            )}
        </AnimatePresence>
    );
};

const styles = {
    button: {
        position: "fixed",
        bottom: "24px",
        left: "24px", // Bottom Left as requested in plan
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: "#25D366",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000, // High z-index
        cursor: "pointer",
        textDecoration: "none",
        border: "2px solid #fff" // Premium feel
    },
    icon: {
        width: "32px",
        height: "32px",
        objectFit: "contain"
    }
};

export default WhatsAppButton;
