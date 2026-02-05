import React from 'react';

const CartTrustLine = () => {
    return (
        <div style={styles.container}>
            <CheckCircleIcon />
            <span style={styles.text}>No palm oil. No excess salt. 100% taste guarantee.</span>
        </div>
    );
};

const CheckCircleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#059669' }}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        margin: '16px 0',
        padding: '8px',
        background: 'rgba(5, 150, 105, 0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(5, 150, 105, 0.1)',
    },
    text: {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#374151',
    }
};

export default CartTrustLine;
