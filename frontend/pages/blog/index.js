import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { blogPosts } from '../../data/blogPosts'
import Footer from '../../components/Footer'

export default function BlogIndex() {
    return (
        <div style={styles.page}>
            <Head>
                <title>Masala Guide | Kasturi Masale</title>
                <meta name="description" content="Discover the secrets of authentic Kolhapuri spices, cooking tips, and the truth about real masala." />
            </Head>

            <div style={styles.header}>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={styles.title}
                >
                    Masala Guide 📖
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.1 }}
                    style={styles.subtitle}
                >
                    Stories, tips, and traditions from the heart of Kolhapur.
                </motion.p>
            </div>

            <div style={styles.container}>
                <div style={styles.grid}>
                    {blogPosts.map((post, i) => (
                        <Link href={`/blog/${post.slug}`} key={post.id} legacyBehavior>
                            <a style={styles.cardLink}>
                                <motion.article
                                    style={styles.card}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div style={styles.metaRow}>
                                        <span style={styles.date}>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                        <span style={styles.dot}>•</span>
                                        <span style={styles.readTime}>{post.readTime}</span>
                                    </div>
                                    <h2 style={styles.cardTitle}>{post.title}</h2>
                                    <p style={styles.excerpt}>{post.excerpt}</p>
                                    <div style={styles.readMore}>Read Article →</div>
                                </motion.article>
                            </a>
                        </Link>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: 80 }}>
                {/* Footer is usually global in _app, but sticking to standard structure just in case */}
            </div>
        </div>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        background: '#FAF9F6',
        paddingTop: 120, // Header clearance
        paddingBottom: 40
    },
    header: {
        textAlign: 'center',
        marginBottom: 60,
        padding: '0 20px'
    },
    title: {
        fontSize: 'clamp(32px, 5vw, 48px)',
        color: '#2D2A26',
        marginBottom: 16,
        fontFamily: 'Cormorant Garamond, serif'
    },
    subtitle: {
        fontSize: '18px',
        color: '#5D4037',
        maxWidth: 600,
        margin: '0 auto',
        lineHeight: 1.6
    },
    container: {
        maxWidth: 1000,
        margin: '0 auto',
        padding: '0 24px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 30
    },
    cardLink: {
        textDecoration: 'none',
        color: 'inherit',
        display: 'block'
    },
    card: {
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid #F0EAE0',
        transition: 'all 0.3s ease'
    },
    metaRow: {
        fontSize: 12,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
        fontWeight: 600
    },
    dot: {
        margin: '0 8px',
        color: '#DDD'
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 700,
        color: '#2D2A26',
        marginBottom: 12,
        lineHeight: 1.3
    },
    excerpt: {
        fontSize: 15,
        color: '#666',
        lineHeight: 1.6,
        marginBottom: 24,
        flex: 1
    },
    readMore: {
        fontSize: 14,
        fontWeight: 700,
        color: '#C02729',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    }
}
