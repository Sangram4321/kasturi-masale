import Link from 'next/link';

const PremiumShort = () => {
    return (
        <div style={styles.container}>
            <h4 style={styles.heading}>Why Kasturi?</h4>
            <p style={styles.subline}>Better ingredients. Honest process.</p>

            <ul style={styles.list}>
                <li style={styles.item}>✓ Free from Palm Oil</li>
                <li style={styles.item}>✓ Natural Cold-Process Aroma</li>
                <li style={styles.item}>✓ 100% Taste Guarantee</li>
            </ul>

            <Link href="/why-kasturi#premium" legacyBehavior>
                <a style={styles.link}>Read full story {'>'}</a>
            </Link>
        </div>
    );
};

const styles = {
    container: {
        background: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '16px',
        margin: '20px 0',
    },
    heading: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#111827',
        margin: '0 0 4px 0',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    subline: {
        fontSize: '13px',
        color: '#6B7280',
        margin: '0 0 12px 0',
        fontStyle: 'italic'
    },
    list: {
        listStyle: 'none',
        padding: 0,
        margin: '0 0 12px 0',
    },
    item: {
        fontSize: '13px',
        color: '#374151',
        marginBottom: '6px',
        fontWeight: '500'
    },
    link: {
        fontSize: '13px',
        color: '#B1121B',
        fontWeight: '600',
        textDecoration: 'none',
        display: 'inline-block'
    }
};

export default PremiumShort;
