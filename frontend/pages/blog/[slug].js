import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { blogPosts } from '../../data/blogPosts'

export default function BlogPost() {
    const router = useRouter()
    const { slug } = router.query

    // Find post (in a real app, use getStaticProps/Paths)
    const post = blogPosts.find(p => p.slug === slug)

    if (!post && typeof window !== 'undefined') {
        return <div style={{ padding: 100, textAlign: 'center' }}>Loading article...</div>
    }

    if (!post) return null // server side safe

    return (
        <div style={styles.page}>
            <Head>
                <title>{post.title} | Masala Guide</title>
                <meta name="description" content={post.excerpt} />
            </Head>

            <div style={styles.container}>
                <Link href="/blog" legacyBehavior>
                    <a style={styles.backLink}>
                        <ArrowLeft size={16} /> Back to Guide
                    </a>
                </Link>

                <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <header style={styles.header}>
                        <div style={styles.meta}>
                            {post.readTime} • {new Date(post.date).toLocaleDateString()}
                        </div>
                        <h1 style={styles.title}>{post.title}</h1>
                    </header>

                    <div
                        style={styles.content}
                        className="blog-content"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                </motion.article>

                <style jsx global>{`
                    .blog-content p {
                        font-size: 18px;
                        line-height: 1.8;
                        color: #333;
                        margin-bottom: 24px;
                    }
                    .blog-content h3 {
                        font-family: 'Cormorant Garamond', serif;
                        font-size: 28px;
                        color: #C02729;
                        margin-top: 40px;
                        margin-bottom: 16px;
                    }
                    .blog-content h4 {
                        font-size: 20px;
                        font-weight: 700;
                        margin-top: 32px;
                    }
                    .blog-content ul {
                        margin-bottom: 24px;
                        padding-left: 20px;
                    }
                    .blog-content li {
                        margin-bottom: 12px;
                        font-size: 17px;
                        color: #444;
                    }
                    .blog-cta {
                        background: #FFF5F5;
                        border-left: 4px solid #C02729;
                        padding: 24px;
                        margin: 40px 0;
                        border-radius: 8px;
                    }
                    .blog-cta p {
                        margin-bottom: 12px;
                        color: #2D2A26;
                        font-size: 17px;
                    }
                    .blog-cta a {
                        color: #C02729;
                        font-weight: 700;
                        text-decoration: none;
                        font-size: 15px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .blog-cta a:hover {
                        text-decoration: underline;
                    }
                    @media (max-width: 768px) {
                        .blog-content p { font-size: 16px; }
                        .blog-content h3 { font-size: 24px; }
                    }
                `}</style>
            </div>
        </div>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        background: '#fff',
        paddingTop: 120,
        paddingBottom: 80
    },
    container: {
        maxWidth: 740,
        margin: '0 auto',
        padding: '0 24px'
    },
    backLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: '#888',
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: 500,
        marginBottom: 40,
        transition: 'color 0.2s'
    },
    header: {
        marginBottom: 40,
        textAlign: 'center'
    },
    meta: {
        fontSize: 13,
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
        fontWeight: 600
    },
    title: {
        fontSize: 'clamp(32px, 5vw, 48px)',
        lineHeight: 1.2,
        color: '#111',
        fontFamily: 'Cormorant Garamond, serif',
        fontWeight: 700
    },
    content: {
        fontFamily: 'Inter, sans-serif' // Keeping body text clean
    }
}
