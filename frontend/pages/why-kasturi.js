import Head from 'next/head'
import Link from 'next/link'
import { motion, useScroll, useTransform, useSpring, useMotionTemplate } from 'framer-motion'
import { useRef, useState } from 'react'
import translations from '../languages/translations'
import TrustComparisonSection from '../components/TrustComparisonSection'
import ComparisonGrid from '../components/ComparisonGrid'
import PremiumJustificationBar from '../components/PremiumJustificationBar'
import GuaranteeBox from '../components/GuaranteeBox'

/* ================= CUSTOM COMPONENTS ================= */

/* 🌌 GRAIN OVERLAY */
const GrainOverlay = () => (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        opacity: 0.05,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }} />
)

/* 🧲 MAGNETIC BUTTON */
const MagneticButton = ({ children, onClick, style, href }) => {
    const ref = useRef(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const handleMouse = (e) => {
        const { clientX, clientY } = e
        const { height, width, left, top } = ref.current.getBoundingClientRect()
        const middleX = clientX - (left + width / 2)
        const middleY = clientY - (top + height / 2)
        setPosition({ x: middleX * 0.2, y: middleY * 0.2 })
    }
    const reset = () => setPosition({ x: 0, y: 0 })
    const { x, y } = position

    const content = (
        <motion.button
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            onClick={onClick}
            style={{ ...styles.magneticBtn, ...style }}
        >
            {children}
        </motion.button>
    )

    if (href) return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>
    return content
}

/* ================= PAGE COMPONENT ================= */
export default function WhyKasturi({ lang, setLang }) {
    const t = translations[lang] || translations.en
    const { scrollY } = useScroll()

    /* PARALLAX TRANSFORMS - DISABLED FOR "NO SCROLL EFFECT" REQUEST */
    const yHero = 0 // useTransform(scrollY, [0, 500], [0, 200])
    const opacityHero = 1 // useTransform(scrollY, [0, 400], [1, 0]) 
    const yBg = 0 // useTransform(scrollY, [0, 1000], [0, -150])
    const rotateBg = 0 // useTransform(scrollY, [0, 1000], [0, 20])
    // const yBlob2 = 0 // useTransform(scrollY, [0, 1000], [0, 100])

    return (
        <div style={styles.page}>
            <Head>
                <title>{t.whyHeroTitle} | Kasturi Masale</title>
            </Head>

            {/* <GrainOverlay /> // Disabled for performance (stuttering) */}

            {/* 🌶️ ANIMATED BACKGROUND BLOBS */}
            <motion.div style={{ ...styles.blob, top: -100, right: -100, background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)', y: yBg, rotate: rotateBg }} />
            <motion.div style={{ ...styles.blob, top: '40%', left: -200, background: 'radial-gradient(circle, rgba(192, 39, 41, 0.08) 0%, transparent 70%)', y: 0 }} />



            {/* ================= HERO SECTION ================= */}
            <section style={styles.hero} className="hero-section">
                <div style={styles.container}>
                    <motion.div style={{ opacity: opacityHero, position: 'relative', zIndex: 1 }}>

                        <motion.h1
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            style={styles.heroTitle}
                            className="hero-title"
                        >
                            <div style={{ whiteSpace: 'pre-wrap' }}>{t.whyPremiumTitle}</div>
                        </motion.h1>

                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={styles.heroSub}
                            className="hero-sub"
                        >
                            {t.whyPremiumSub}
                        </motion.h2>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            style={styles.centered}
                            className="hero-text"
                        >
                            <p style={styles.bodyText}>
                                {t.whyPremiumBody1}
                            </p>
                            <p style={styles.bodyText}>
                                {t.whyPremiumBody2}
                            </p>
                            <p style={styles.bodyText}>
                                <span style={{ whiteSpace: 'pre-wrap' }}>{t.whyPremiumBody3}</span>
                            </p>
                            <p style={{ ...styles.bodyText, fontWeight: 700, color: '#111827', marginTop: 24 }}>
                                <span style={{ whiteSpace: 'pre-wrap' }}>{t.whyPremiumBody4}</span>
                            </p>
                        </motion.div>

                        <motion.div
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            style={{ marginTop: 40 }}
                        >
                            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
                                <div style={styles.trustLine}>✔ {t.whyCleanNoPalm}</div>
                                <div style={styles.trustLine}>✔ {t.whyCleanNoPreserve || "No Excess Salt"}</div> {/* Fallback/Adjust key if needed */}
                                <div style={styles.trustLine}>✔ {t.whyCleanNoColor}</div>
                            </div>

                            <div style={styles.noteBox}>
                                <strong>{t.whyGuarantee}</strong>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            style={{ ...styles.btnGroup, marginTop: 40 }}
                            className="btn-group"
                        >
                            <MagneticButton href="/product" style={styles.primaryBtn}>
                                {t.whyCtaBtn1 || "Shop Now"}
                            </MagneticButton>
                        </motion.div>

                    </motion.div>
                </div>
            </section>

            {/* ================= 1. WHY KASTURI IS PREMIUM (#premium) ================= */}
            {/* Content moved to Hero as it is the main page now. Keeping section for structure/visuals if needed or removing empty section. 
                 User request puts "Body Content" under "Section 1: Why Kasturi Is Premium". 
                 The Hero already covers this. I will remove the redundant Section 1 block that had sub-components. 
             */}

            {/* ================= FINAL CTA ================= */}
            <section style={styles.ctaSection} className="cta-section">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={styles.ctaCard}
                    className="cta-card"
                >
                    <div style={styles.ctaGlow} />
                    <h2 style={styles.ctaTitle} className="cta-title"><div style={{ whiteSpace: 'pre-wrap' }}>{t.whyCtaTitle}</div></h2>
                    <div style={styles.btnGroup} className="btn-group">
                        <MagneticButton href="/product" style={styles.primaryBtnLarge}>{t.whyCtaBtn1 || t.shopNow}</MagneticButton>
                        <MagneticButton href="/product" style={styles.secondaryBtnLarge}>{t.whyCtaBtn2 || t.explore}</MagneticButton>
                    </div>
                </motion.div>
            </section>

            <style jsx>{`
                @media (max-width: 768px) {
                    .hero-section { padding-top: 100px !important; padding-bottom: 60px !important; }
                    .hero-title { font-size: 32px !important; letter-spacing: -1px; line-height: 1.1 !important; }
                    .hero-sub { font-size: 16px !important; margin-bottom: 16px !important; }
                    .hero-text { font-size: 16px !important; margin-bottom: 24px !important; }
                    .btn-group { flex-direction: column; width: 100%; gap: 12px; }
                    
                    /* Grid Stacking */
                    .grid-2, .grid-2-reverse { 
                        grid-template-columns: 1fr !important; 
                        gap: 32px !important; 
                        display: flex !important; 
                        flex-direction: column-reverse !important;
                        align-items: stretch !important; /* Fix for shrinking cards */
                    }

                    .grid-3 { grid-template-columns: 1fr !important; }
                    .grid-4 { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
                    
                    /* Typography Scaling */
                    .section-title, .section-title-center { 
                        font-size: 24px !important; 
                        text-align: center !important; 
                        line-height: 1.2 !important;
                    }
                    .body-text, p { font-size: 16px !important; line-height: 1.5 !important; }
                    
                    .promise-grid { flex-direction: column; gap: 24px; padding: 20px 0 !important; }
                    .text-content { padding: 0 !important; text-align: center; width: 100% !important; }

                    /* Fix for Mobile Image Cards - Contain within screen */
                    .glass-img-card { 
                        width: 100% !important; /* Ensure full width */
                        height: auto !important; 
                        min-height: auto !important; 
                        padding: 24px !important; 
                        border-radius: 20px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                    }
                    /* Ensure images inside don't overflow */
                    .glass-img-card img {
                        max-height: 250px; /* Reduced further to ensure fit */
                        object-fit: contain;
                    }

                    /* Map Graphic Mobile Scaling */
                    .map-pin { font-size: 40px !important; }
                    .map-ring { width: 150px !important; height: 150px !important; }
                    .map-ring-large { width: 100px !important; height: 100px !important; }
                    
                    /* Badges/Icons Scaling */
                    .shelf-life-badge { width: 120px !important; height: 120px !important; }
                    .shelf-life-badge span:first-child { fontSize: 28px !important; }
                    
                    .cta-title { font-size: 32px !important; }
                    .cta-card { padding: 40px 20px !important; border-radius: 24px !important; }
                    
                    /* Safety Margins */
                    .container { padding: 0 16px !important; }
                }
            `}</style>
        </div>
    )
}

/* ================= HELPERS & SUB-COMPONENTS ================= */

const Section = ({ id, bg = 'transparent', children }) => (
    <section id={id} style={{ ...styles.section, background: bg }}>
        <div style={styles.container}>
            {children}
        </div>
    </section>
)

const SectionTitle = ({ children }) => (
    <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={styles.sectionTitle}
    >
        {children}
    </motion.h2>
)

const ParallaxCard = ({ children, delay = 0 }) => (
    <motion.div
        className="glass-img-card"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ delay, duration: 1.2, ease: [0.16, 1, 0.3, 1] }} // Buttery smooth ease
        whileHover={{
            y: -15,
            scale: 1.02,
            transition: { duration: 0.5, ease: "easeOut" }
        }}
        style={styles.glassImgCard}
    >
        {children}
    </motion.div>
)

const FeatureCard = ({ title, desc, icon }) => (
    <motion.div
        whileHover={{
            y: -10,
            boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
            transition: { duration: 0.4, ease: "easeOut" }
        }}
        style={styles.featureCard}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
        <div style={styles.featureIcon}>{icon}</div>
        <h3 style={styles.featureTitle}>{title}</h3>
        <p style={styles.featureDesc}>{desc}</p>
    </motion.div>
)

const CheckItem = ({ children }) => (
    <motion.li
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={styles.checkItem}
    >
        <span style={styles.checkIcon}>✓</span>
        {children}
    </motion.li>
)

const FloatingSpice = ({ emoji, x, y, delay }) => (
    <motion.div
        animate={{
            y: [y, y - 20, y],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
        }}
        transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
            delay
        }}
        style={{ position: 'absolute', top: '50%', left: '50%', fontSize: 40, marginLeft: x, marginTop: y }}
    >
        {emoji}
    </motion.div>
)

const ProofCard = ({ icon, title, text }) => (
    <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={styles.proofCard}
    >
        <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#1F2937' }}>{title}</div>
        <div style={{ fontSize: 14, color: '#6B7280' }}>{text}</div>
    </motion.div>
)

const KitchenCard = ({ icon, text }) => (
    <motion.div
        style={styles.kitchenCard}
        whileHover={{ scale: 1.05, rotate: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
        <span style={{ fontSize: 32, marginBottom: 8, display: 'block' }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: 16 }}>{text}</span>
    </motion.div>
)

const Badge = ({ type, text, icon }) => (
    <div style={{ ...styles.badge, borderColor: type === 'yes' ? '#10B981' : '#EF4444', color: type === 'yes' ? '#065F46' : '#991B1B', background: type === 'yes' ? '#D1FAE5' : '#FEE2E2' }}>
        <span>{icon || (type === 'yes' ? '✅' : '🚫')}</span> {text}
    </div>
)

// ... other existing components

const PromiseItem = ({ title }) => (
    <div style={styles.promiseItem}>
        <div style={styles.goldBar} />
        <span style={{ fontSize: 18, fontWeight: 600 }}>{title}</span>
    </div>
)

/* ================= STYLES ================= */
const styles = {
    // ... existing styles
    page: {
        minHeight: '100vh',
        background: '#FAFAFA',
        color: '#1F2937',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        paddingTop: 0,
        overflow: 'hidden' // Prevent horizontal scroll from blobs
    },
    // ...
    heroTitle: { fontSize: 64, fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-1px' },
    heroSub: { fontSize: 24, fontWeight: 600, color: '#C02729', marginBottom: 24, letterSpacing: '0.5px' }, // NEW

    // ...

    /* NEW STYLES */
    freshBadge: { background: '#10B981', color: '#fff', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, marginTop: 10, display: 'inline-block', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' },
    trustLine: { fontSize: 24, fontStyle: 'italic', fontWeight: 600, color: '#C02729', borderLeft: '4px solid #C02729', paddingLeft: 16 },
    shelfLifeBadge: { width: 180, height: 180, background: '#F59E0B', color: '#FFF', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(245, 158, 11, 0.4)', border: '4px solid #fff' },
    noteBox: { background: '#FFF7ED', padding: 20, borderRadius: 12, borderLeft: '4px solid #F59E0B', marginTop: 30, fontSize: 16 },
    kitchenCard: { background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.04)', textAlign: 'center', border: '1px solid #F3F4F6' },
    bulletItem: { fontSize: 18, color: '#4B5563', marginBottom: 10, listStyle: 'none' },

    /* UTILS */
    container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 },
    centered: { textAlign: 'center', maxWidth: 800, margin: '0 auto' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' },
    grid2Reverse: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 80, alignItems: 'center' },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 30 },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginTop: 40 },

    blob: {
        position: 'absolute', width: 600, height: 600, borderRadius: '50%', filter: 'blur(80px)', zIndex: 1, pointerEvents: 'none', willChange: 'transform'
    },

    /* HERO */
    hero: { paddingTop: 180, paddingBottom: 120, textAlign: 'center', position: 'relative' },
    gradientText: { background: 'linear-gradient(45deg, #C02729, #D97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    heroText: { fontSize: 20, color: '#4B5563', lineHeight: 1.6, marginBottom: 40 },
    eyebrow: { display: 'inline-block', fontSize: 13, fontWeight: 700, letterSpacing: 2, color: '#D97706', marginBottom: 20, textTransform: 'uppercase' },

    /* BUTTONS */
    btnGroup: { display: 'flex', gap: 16, justifySelf: 'center', justifyContent: 'center' },
    magneticBtn: { fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    primaryBtn: { background: '#1F2937', color: '#fff', padding: '16px 32px', borderRadius: 99, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' },
    secondaryBtn: { background: '#fff', color: '#1F2937', padding: '16px 32px', borderRadius: 99, border: '1px solid #E5E7EB' },
    primaryBtnLarge: { background: '#F59E0B', color: '#1F2937', padding: '20px 48px', borderRadius: 99, border: 'none', fontSize: 18, fontWeight: 700, boxShadow: '0 20px 40px rgba(245, 158, 11, 0.3)' },
    secondaryBtnLarge: { background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '20px 48px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.3)', fontSize: 18, fontWeight: 700, backdropFilter: 'blur(10px)' },

    /* SECTIONS */
    section: { padding: '120px 0', position: 'relative', zIndex: 5 },
    sectionTitle: { fontSize: 42, fontWeight: 800, marginBottom: 24, letterSpacing: '-0.5px', color: '#111827' },
    sectionTitleCenter: { fontSize: 42, fontWeight: 800, marginBottom: 24, letterSpacing: '-0.5px', color: '#111827', textAlign: 'center' },
    subTitle: { fontSize: 16, fontWeight: 700, color: '#C02729', letterSpacing: 1, textTransform: 'uppercase' },
    bodyText: { fontSize: 18, lineHeight: 1.7, color: '#4B5563', marginBottom: 20 },
    highlightText: { fontSize: 24, fontWeight: 500, fontStyle: 'italic', color: '#92400E', marginTop: 60 },

    /* CARDS */
    glassImgCard: {
        height: 500, borderRadius: 32,
        background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)',
        backdropFilter: 'blur(20px)', boxShadow: '0 30px 60px rgba(0,0,0,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
    },
    featureCard: {
        padding: 40, borderRadius: 24, background: '#fff',
        boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.03)',
        textAlign: 'left', transition: 'box-shadow 0.3s'
    },
    featureIcon: { fontSize: 40, marginBottom: 20 },
    featureTitle: { fontSize: 20, fontWeight: 700, marginBottom: 10, color: '#111827' },
    featureDesc: { fontSize: 16, color: '#6B7280', lineHeight: 1.6 },

    /* MAP ANIMATION */
    mapGraphic: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    mapPin: { fontSize: 60, zIndex: 2 },
    mapLabel: { fontWeight: 800, fontSize: 14, letterSpacing: 2, marginTop: 10, color: '#1F2937' },
    mapRing: { position: 'absolute', width: 120, height: 120, border: '2px solid #C02729', borderRadius: '50%', opacity: 0.2, top: -20, animation: 'ping 2s infinite' },

    /* LISTS */
    checkList: { listStyle: 'none', padding: 0, marginTop: 30 },
    checkItem: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, fontSize: 18, fontWeight: 500, color: '#374151' },
    checkIcon: { width: 24, height: 24, borderRadius: '50%', background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold' },

    /* SPICES */
    spiceContainer: { position: 'relative', width: '100%', height: '100%' },
    centerPestle: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 80, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.2))' },

    /* BADGES & TAGS */
    badgeWrapper: { display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 40 },
    badge: { padding: '10px 20px', borderRadius: 99, fontSize: 14, fontWeight: 600, border: '1px solid', display: 'flex', alignItems: 'center', gap: 8 },
    tagGrid: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 },
    tag: { padding: '12px 24px', background: '#fff', borderRadius: 16, fontSize: 16, fontWeight: 600, color: '#374151', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' },

    /* PROOF CARD */
    proofCard: { padding: 30, background: '#fff', borderRadius: 24, border: '1px solid #F3F4F6', boxShadow: '0 10px 20px rgba(0,0,0,0.02)' },

    /* PROMISE SECTION */
    promiseSection: { padding: '100px 0', background: '#111827', color: '#fff' },
    promiseGrid: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 60, padding: '40px 0' },
    promiseItem: { textAlign: 'center', flex: 1, borderRight: '1px solid rgba(255,255,255,0.1)' },
    goldBar: { width: 40, height: 4, background: '#F59E0B', margin: '0 auto 20px', borderRadius: 4 },

    /* CTA */
    ctaSection: { padding: '0 24px 100px', textAlign: 'center' },
    ctaCard: { background: '#1F2937', borderRadius: 40, padding: '100px 40px', color: '#fff', position: 'relative', overflow: 'hidden' },
    ctaGlow: { position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)' },
    ctaTitle: { fontSize: 56, fontWeight: 800, marginBottom: 40, position: 'relative', lineHeight: 1.1 },

    iconBig: { fontSize: 80, width: 140, height: 140, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', margin: '0 auto 24px' }
}
