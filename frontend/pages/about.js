import Head from 'next/head'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import translations from '../languages/translations'

const GrainOverlay = () => (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        opacity: 0.05,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }} />
)

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
}

export default function About({ lang, setLang }) {
    const t = translations[lang] || translations.en
    const { scrollY } = useScroll()
    const yBg = useTransform(scrollY, [0, 1000], [0, -150])

    return (
        <div style={styles.page}>
            <Head>
                <title>{t.aboutHeroTitle} | Kasturi Masale</title>
            </Head>

            <GrainOverlay />

            {/* BACKGROUND BLOBS */}
            <motion.div style={{ ...styles.blob, top: -200, left: -200, background: 'radial-gradient(circle, rgba(235, 94, 40, 0.15) 0%, transparent 70%)', y: yBg }} />
            <motion.div style={{ ...styles.blob, top: '40%', right: -200, background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)', y: yBg }} />

            {/* LANGUAGE SWITCHER */}
            <div style={{ position: 'fixed', top: 100, right: 20, zIndex: 50, display: 'flex', gap: 8 }}>
                {['en', 'hi', 'mr'].map(l => (
                    <button
                        key={l}
                        onClick={() => setLang(l)}
                        style={{
                            background: lang === l ? '#C02729' : 'rgba(255,255,255,0.8)',
                            color: lang === l ? '#fff' : '#333',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: 99,
                            padding: '8px 16px',
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {l.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* HERO SECTION */}
            <section style={styles.hero}>
                <div style={styles.container}>
                    <motion.h1
                        initial="hidden" animate="visible" variants={fadeInUp}
                        style={styles.heroTitle}
                        className="hero-title"
                    >
                        {t.aboutHeroTitle}
                    </motion.h1>
                    <motion.h2
                        initial="hidden" animate="visible" variants={fadeInUp}
                        style={styles.heroSub}
                    >
                        {t.aboutHeroSub}
                    </motion.h2>
                    <motion.p
                        initial="hidden" animate="visible" variants={fadeInUp}
                        style={styles.heroText}
                    >
                        {t.aboutHeroText}
                    </motion.p>
                    <div style={styles.btnGroup} className="btn-group">
                        <Link href="/product">
                            <button style={styles.primaryBtn}>{t.shopNow}</button>
                        </Link>
                        <Link href="/why-kasturi">
                            <button style={styles.secondaryBtn}>{t.whyKasturi}</button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* STORY SECTION */}
            <section style={styles.section}>
                <div style={styles.container}>
                    <div style={styles.grid2} className="grid-2">
                        <div>
                            <h2 style={styles.sectionTitle} className="section-title">{t.aboutStoryTitle}</h2>
                            <p style={styles.bodyText}>{t.aboutStoryText}</p>
                        </div>
                        <div style={styles.imageCard} className="image-card">
                            <span style={{ fontSize: 80 }}>📜</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* PILLARS */}
            <section style={{ ...styles.section, background: '#FFF7ED' }}>
                <div style={styles.containerCenter}>
                    <h2 style={styles.sectionTitleCenter} className="section-title-center">{t.aboutPillarsTitle}</h2>
                    <div style={styles.grid4} className="grid-4">
                        <Card title="Authenticity" icon="🌶️" />
                        <Card title="Purity" icon="🌱" />
                        <Card title="Consistency" icon="⚖️" />
                        <Card title="Transparency" icon="🔍" />
                    </div>
                </div>
            </section>

            {/* INGREDIENTS */}
            <section style={styles.section}>
                <div style={styles.containerCenter}>
                    <h2 style={styles.sectionTitleCenter} className="section-title-center">{t.aboutIngredientTitle}</h2>
                    <div style={styles.ingredientBadge} className="ingredient-badge">
                        ❌ No Fillers &nbsp; | &nbsp; ❌ No Artificial Colors &nbsp; | &nbsp; ✅ 100% Pure Spices
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={styles.ctaSection}>
                <div style={styles.containerCenter}>
                    <h2 style={{ ...styles.sectionTitleCenter, color: '#fff' }}>{t.aboutCtaTitle}</h2>
                    <Link href="/product">
                        <button style={styles.ctaBtn}>{t.shopNow}</button>
                    </Link>
                </div>
            </section>
            <style jsx>{`
                @media (max-width: 768px) {
                    .hero-title { font-size: 36px !important; letter-spacing: -1px; }
                    .btn-group { flex-direction: column; width: 100%; }
                    .grid-2 { grid-template-columns: 1fr !important; gap: 40px !important; display: flex !important; flex-direction: column-reverse !important; }
                    .grid-4 { grid-template-columns: 1fr 1fr !important; gap: 16px !important; }
                    
                    .section-title { font-size: 28px !important; text-align: center !important; }
                    .section-title-center { font-size: 28px !important; }

                    .image-card {
                        height: auto !important;
                        aspect-ratio: 1/1 !important;
                        width: 100% !important;
                    }
                    
                    .ingredient-badge { 
                        display: flex !important; flex-direction: column; gap: 12px; 
                        padding: 20px !important; border-radius: 20px !important; 
                        font-size: 16px !important;
                    }
                }
            `}</style>
        </div>
    )
}

const Card = ({ title, icon }) => (
    <div style={styles.card}>
        <span style={{ fontSize: 40, marginBottom: 12, display: 'block' }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: 18 }}>{title}</span>
    </div>
)

const styles = {
    page: { fontFamily: "'Inter', sans-serif", background: '#FAFAFA', minHeight: '100vh', position: 'relative', overflow: 'hidden' },
    container: { maxWidth: 1000, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 10 },
    containerCenter: { maxWidth: 1000, margin: '0 auto', padding: '0 20px', textAlign: 'center', position: 'relative', zIndex: 10 },

    hero: { padding: '140px 0 80px', textAlign: 'center', position: 'relative' },
    heroTitle: { fontSize: 56, fontWeight: 800, marginBottom: 16, color: '#1F2937', letterSpacing: '-1px' },
    heroSub: { fontSize: 24, fontWeight: 600, color: '#C02729', marginBottom: 24, letterSpacing: '0.5px' },
    heroText: { fontSize: 18, color: '#4B5563', lineHeight: 1.6, maxWidth: 700, margin: '0 auto 40px' },

    btnGroup: { display: 'flex', gap: 16, justifyContent: 'center' },
    primaryBtn: { background: '#C02729', color: '#fff', padding: '14px 28px', borderRadius: 99, border: 'none', fontSize: 16, fontWeight: 600, cursor: 'pointer', boxShadow: '0 10px 20px rgba(192, 39, 41, 0.3)' },
    secondaryBtn: { background: 'rgba(255,255,255,0.6)', color: '#1F2937', padding: '14px 28px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(10px)' },

    section: { padding: '100px 0', position: 'relative' },
    sectionTitle: { fontSize: 36, fontWeight: 800, marginBottom: 20, color: '#111827' },
    sectionTitleCenter: { fontSize: 36, fontWeight: 800, marginBottom: 40, textAlign: 'center', color: '#111827' },
    bodyText: { fontSize: 18, lineHeight: 1.7, color: '#4B5563' },

    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' },

    // Glass Card for Image
    imageCard: {
        height: 400,
        background: 'rgba(255,255,255,0.25)',
        borderRadius: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.4)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
    },

    grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 },

    // Glass Features
    card: {
        background: 'rgba(255,255,255,0.6)',
        padding: 30,
        borderRadius: 24,
        boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.5)',
        backdropFilter: 'blur(10px)'
    },

    ingredientBadge: { background: '#fff', padding: '20px 40px', borderRadius: 99, display: 'inline-block', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', fontSize: 18, fontWeight: 600, color: '#166534' },

    ctaSection: { background: '#1F2937', padding: '100px 0', color: '#fff', position: 'relative', overflow: 'hidden' },
    ctaBtn: { background: '#F59E0B', color: '#1F2937', padding: '16px 36px', borderRadius: 99, border: 'none', fontSize: 18, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(245, 158, 11, 0.4)' },

    // Blobs
    blob: {
        position: 'absolute', width: 600, height: 600, borderRadius: '50%', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none', opacity: 0.6
    }
}
