import React from 'react';

const PremiumJustificationBar = () => {
    return (
        <div style={styles.bar}>
            <div style={styles.container}>
                <p style={styles.text}>
                    "Premium ingredients kabhi budget price pe nahi aate."
                </p>
            </div>
        </div>
    );
};

const styles = {
    bar: {
        width: '100%',
        background: '#7F1D1D', // Deep spice red / maroon
        padding: '32px 24px',
        marginTop: '64px',
        marginBottom: '64px',
    },
    container: {
        maxWidth: 1200,
        margin: '0 auto',
        textAlign: 'center',
    },
    text: {
        color: '#FFFFFF',
        fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
        fontWeight: 700,
        fontStyle: 'italic',
        margin: 0,
        fontFamily: "'Inter', sans-serif", // Or serif if preferred for quote
    }
};

export default PremiumJustificationBar;
