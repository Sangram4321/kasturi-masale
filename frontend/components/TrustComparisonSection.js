import React from 'react';

const TrustComparisonSection = () => {
    return (
        <div style={styles.container}>
            {/* Desktop Heading */}
            <div className="desktop-heading-container">
                <h2 style={styles.heading}>Why Kasturi Is Premium</h2>
                <p style={styles.subline}>
                    Better ingredients. Honest process. No shortcuts.
                </p>
            </div>

            {/* Mobile Heading (Emotional Hook) */}
            <div className="mobile-heading-container">
                <h2 className="mobile-headline">Asli Kolhapuri Taste ka Farq</h2>
                <p className="mobile-trust-line">
                    Kandap-ground • No Palm Oil • No Preservatives • Fresh Small Batch
                </p>
            </div>

            <style jsx>{`
                .desktop-heading-container { display: block; }
                .mobile-heading-container { display: none; }

                @media (max-width: 768px) {
                    .desktop-heading-container { display: none; }
                    .mobile-heading-container { display: block; margin-bottom: 24px; }
                    
                    .mobile-headline {
                        font-size: 2rem;
                        font-weight: 800;
                        color: #1a1a1a;
                        line-height: 1.2;
                        margin-bottom: 8px;
                        font-family: var(--font-heading, 'Playfair Display', serif);
                    }

                    .mobile-trust-line {
                        font-size: 0.9rem;
                        color: #666;
                        font-weight: 500;
                        line-height: 1.5;
                        padding: 0 10px;
                        margin: 0;
                        font-family: var(--font-body, 'Inter', sans-serif);
                    }
                }
            `}</style>
        </div>
    );
};

const styles = {
    container: {
        textAlign: 'center',
        padding: '64px 24px 24px', // Reduced bottom padding as Grid has its own
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
