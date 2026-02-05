import React from 'react';
import { motion } from 'framer-motion';

const GuaranteeBox = () => {
    return (
        <motion.div
            style={styles.container}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <div style={styles.box}>
                <div style={styles.iconWrapper}>
                    <ShieldCheckIcon />
                </div>

                <h3 style={styles.headline}>100% Taste Guarantee</h3>

                <p style={styles.text}>
                    Agar Kasturi Kanda Lasun Masala pasand nahi aaya,<br />
                    <strong>product vapas karein aur 100% refund paayein.</strong>
                </p>

                <p style={styles.boldLine}>
                    Ya pasand aayega — ya hum vapas le lenge.
                </p>

                <p style={styles.finePrint}>
                    *First purchase only. Reasonable quantity used hona chahiye.
                </p>
            </div>
        </motion.div>
    );
};

const ShieldCheckIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

const styles = {
    container: {
        maxWidth: 800,
        margin: '0 auto',
        padding: '0 24px',
        textAlign: 'center',
    },
    box: {
        background: '#FFF',
        border: '2px solid #D97706', // Gold border
        borderRadius: '24px',
        padding: '40px 32px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
        position: 'relative',
        marginTop: '40px',
    },
    iconWrapper: {
        position: 'absolute',
        top: -24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#FFF',
        padding: '0 16px',
    },
    headline: {
        fontSize: '2rem',
        fontWeight: 800,
        color: '#1F2937',
        marginTop: '16px',
        marginBottom: '16px',
    },
    text: {
        fontSize: '1.1rem',
        color: '#4B5563',
        lineHeight: 1.6,
        marginBottom: '16px',
    },
    boldLine: {
        fontSize: '1.2rem',
        fontWeight: 700,
        color: '#059669', // Trust green
        marginBottom: '24px',
    },
    finePrint: {
        fontSize: '0.875rem',
        color: '#9CA3AF',
        fontStyle: 'italic',
    }
};

export default GuaranteeBox;
