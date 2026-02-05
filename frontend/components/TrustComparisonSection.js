import React from 'react';

const TrustComparisonSection = () => {
    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Why Kasturi Is Premium</h2>
            <p style={styles.subline}>
                Better ingredients. Honest process. No shortcuts.
            </p>
        </div>
    );
};

const styles = {
    container: {
        textAlign: 'center',
        padding: '64px 24px',
        maxWidth: 1200,
        margin: '0 auto',
        backgroundColor: '#F9F6F1', // Off-white / light beige (premium, food-safe)
    },
    heading: {
        fontSize: 'clamp(2rem, 5vw, 3.5rem)', // Fluid typography
        fontWeight: 800,
        color: '#2D2A26',
        marginBottom: '16px',
        lineHeight: 1.1,
    },
    subline: {
        fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
        color: '#5D4037',
        fontWeight: 500,
        margin: 0,
    }
};

export default TrustComparisonSection;
