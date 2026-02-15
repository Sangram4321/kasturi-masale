import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { blogPosts } from '../../data/blogPosts'

// 1. Generate Static Paths (SSG) - Tells Next.js which pages to build
export async function getStaticPaths() {
    const paths = blogPosts.map((post) => ({
        params: { slug: post.slug },
    }))

    return { paths, fallback: false }
}

// 2. Fetch Data for Each Page (SSG) - Passes data to the component
export async function getStaticProps({ params }) {
    const post = blogPosts.find((p) => p.slug === params.slug)

    // If not found (shouldn't happen with fallback:false but good practice)
    if (!post) {
        return { notFound: true }
    }

    return {
        props: { post },
    }
}

export default function BlogPost({ post }) {
    if (!post) return null

    return (
        <div style={styles.page}>
            <Head>
                <title>{post.title} | Masala Guide</title>
                <meta name="description" content={post.excerpt} />

                {/* Structured Data for SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "BlogPosting",
                            "headline": post.title,
                            "image": [
                                `https://kasturimasale.in${post.coverImage}`
                            ],
                            "datePublished": post.date,
                            "author": {
                                "@type": "Organization",
                                "name": "Kasturi Masale"
                            },
                            "description": post.excerpt
                        })
                    }}
                />
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
                            {post.readTime} • {new Date(post.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
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
                        font-family: 'Inter', sans-serif;
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
                        line-height: 1.6;
                    }
                    .blog-content strong {
                        font-weight: 600;
                        color: #111;
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
                        font-weight: 500;
                    }
                    .blog-cta a {
                        color: #C02729;
                        font-weight: 700;
                        text-decoration: none;
                        font-size: 15px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        display: inline-block;
                        margin-top: 5px;
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
