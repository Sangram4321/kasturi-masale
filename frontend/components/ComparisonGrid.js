import React from 'react';
import { motion } from 'framer-motion';

const ComparisonGrid = () => {
    return (
        <div style={styles.wrapper}>
            <div style={styles.grid}>
                {/* Headers - Desktop only */}
                <div style={styles.headerRow} className="desktop-header">
                    <div style={{ ...styles.headerCol, ...styles.kasturiHeader }}>
                        <span style={styles.brandName}>KASTURI MASALA</span>
                    </div>
                    <div style={{ ...styles.headerCol, ...styles.marketHeader }}>
                        <span style={styles.marketName}>MARKET MASALA</span>
                    </div>
                </div>

                {/* Row 1: Oil Used */}
                <ComparisonRow
                    icon={<PeanutIcon />}
                    label="Oil Used"
                    kasturiText={<><strong>Cottonseed Oil (Refined)</strong><br />Natural aroma, clean finish</>}
                    marketText={<>Palm Oil<br />Cost-cutting oil</>}
                />

                {/* Row 2: Chillies & Raw Material */}
                <ComparisonRow
                    icon={<ChilliIcon />}
                    label="Chillies & Raw Material"
                    kasturiText={<>Selective, fresh chillies<br />Natural color & heat</>}
                    marketText={<>Low-grade / old chillies<br />Color se taste cover</>}
                />

                {/* Row 3: Salt Level */}
                <ComparisonRow
                    icon={<SaltIcon />}
                    label="Salt Level"
                    kasturiText={<>Namak kam<br />Masala ka real taste</>}
                    marketText={<>Namak zyada<br />Quantity badhane ka shortcut</>}
                />

                {/* Row 4: Number of Spices */}
                <ComparisonRow
                    icon={<SpiceBowlIcon />}
                    label="Number of Spices"
                    kasturiText={<><strong>25+ balanced spices</strong><br />Layered Kolhapuri flavour</>}
                    marketText={<>Limited ingredients<br />Flat, one-note taste</>}
                />

                {/* Row 5: Overall Quality */}
                <ComparisonRow
                    icon={<DiamondIcon />}
                    label="Overall Quality"
                    kasturiText={<>Premium ingredients<br />Careful processing</>}
                    marketText={<>Bulk production<br />Cost-first approach</>}
                />
            </div>

            <style jsx>{`
                /* Global selectors needed because these classes are inside the child component ComparisonRow */
                :global(.desktop-icon) { display: flex; }
                :global(.mobile-label) { display: none; }
                
                @media (max-width: 768px) {
                    .desktop-header { display: none !important; }
                    :global(.comparison-row) { grid-template-columns: 1fr !important; gap: 16px !important; margin-bottom: 32px; display: grid; }
                    :global(.desktop-icon) { display: none !important; }
                    :global(.mobile-label) { display: block !important; margin-bottom: 8px; text-align: center; }
                }
            `}</style>
        </div>
    );
};

const ComparisonRow = ({ icon, label, kasturiText, marketText }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        style={styles.row}
        className="comparison-row" // Added class for targeting
    >
        {/* Mobile Label */}
        <div style={styles.mobileLabel} className="mobile-label">
            <span style={styles.iconWrapper}>{icon}</span>
            {label}
        </div>

        {/* Kasturi Card */}
        <div style={{ ...styles.card, ...styles.kasturiCard }}>
            <div style={styles.desktopIcon} className="desktop-icon">{icon}</div>
            <div style={styles.cardContent}>
                <span style={styles.cardText}>{kasturiText}</span>
            </div>
        </div>

        {/* Market Card */}
        <div style={{ ...styles.card, ...styles.marketCard }}>
            <div style={styles.cardContent}>
                <span style={styles.cardText}>{marketText}</span>
            </div>
        </div>
    </motion.div>
);

/* Icons (Outline/Minimal SVG) */
const PeanutIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 16.5C6 15 4.5 13.5 4.5 11.5C4.5 10 5.5 8 7.5 8C8.5 8 9.5 8.5 10.5 9.5L12 11" />
        <path d="M17 7.5C18 9 19.5 10.5 19.5 12.5C19.5 14 18.5 16 16.5 16C15.5 16 14.5 15.5 13.5 14.5L12 13" />
        <path d="M12 12C9 9 13 5 15.5 7.5" />
        <path d="M12 12C15 15 11 19 8.5 16.5" />
    </svg>
); // Approximated peanut/drop shape logic or generic oil drop

const ChilliIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16.5 3 C16.5 3 13 8 13 10 C13 14 15 16 18 16 C20 16 21 14 21 12" />
        <path d="M6 8 C6 8 8 10 8 12 C8 16 6 18 4 18" />
        <path d="M10 20 C10 20 8 22 6 22" />
        <path d="M13 10C10 6 6 5 4 5" />
    </svg>
); // Simplified chili shape

const SaltIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 12L8 4H16L18 12" />
        <path d="M6 12H18L17 20H7L6 12Z" />
        <circle cx="10" cy="8" r="1" fill="currentColor" />
        <circle cx="14" cy="8" r="1" fill="currentColor" />
        <circle cx="12" cy="6" r="1" fill="currentColor" />
    </svg>
);

const SpiceBowlIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12" />
        <path d="M4 12H20" />
        <path d="M7 12V8C7 5 9 4 12 4C15 4 17 5 17 8V12" />
        <path d="M10 8H14" />
    </svg>
);

const DiamondIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H18L21 14L12 21L3 14L6 9Z" />
        <path d="M6 9L12 21" />
        <path d="M18 9L12 21" />
        <path d="M3 14H21" />
    </svg>
);


const styles = {
    wrapper: {
        maxWidth: 1000,
        margin: '0 auto',
        padding: '0 24px',
    },
    grid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    headerRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        marginBottom: '16px',
    },
    headerCol: {
        textAlign: 'center',
        padding: '12px',
        borderRadius: '12px',
    },
    kasturiHeader: {
        // background: 'rgba(5, 150, 105, 0.1)',
    },
    marketHeader: {
        // background: 'rgba(239, 68, 68, 0.1)',
    },
    brandName: {
        fontSize: '1.25rem',
        fontWeight: 800,
        color: '#065F46', // Dark green
        letterSpacing: '1px',
    },
    marketName: {
        fontSize: '1.25rem',
        fontWeight: 800,
        color: '#7F1D1D', // Dark red
        letterSpacing: '1px',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        alignItems: 'stretch', // Ensure equal height
        position: 'relative',
    },
    mobileLabel: {
        textAlign: 'center',
        fontWeight: 700,
        color: '#4B5563',
        marginBottom: '8px',
        // Display toggled via CSS
    },
    card: {
        padding: '24px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
        fontSize: '1rem',
        lineHeight: 1.5,
        minHeight: '100px',
    },
    kasturiCard: {
        background: '#ECFDF5', // Light green bg
        border: '1px solid #A7F3D0',
        color: '#064E3B',
    },
    marketCard: {
        background: '#F9FAFB', // Light grey/red bg
        border: '1px solid #E5E7EB',
        color: '#6B7280',
    },
    desktopIcon: {
        color: '#059669',
        flexShrink: 0,
        background: 'rgba(255,255,255,0.6)',
        padding: '8px',
        borderRadius: '50%',
        display: 'flex',
    },
    // Icon wrapper for mobile label
    iconWrapper: {
        display: 'inline-flex',
        verticalAlign: 'middle',
        marginRight: 8,
        color: '#059669',
    },
    cardContent: {
        display: 'flex',
        flexDirection: 'column',
    },
    cardText: {
        display: 'block',
    }
};

export default ComparisonGrid;
