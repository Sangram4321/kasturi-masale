import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ShoppingBag, Check } from "lucide-react"

/* 
  PRODUCT SHOWCASE SECTION
  - Grid Layout (Mobile 2-col, Desktop 4-col)
  - Mobile-First Add to Cart (Visible always)
  - Trust Indicators
*/

const PRODUCTS = [
    {
        id: "kanda-lasun-500",
        name: "Kolhapuri Kanda Lasun Masala",
        weight: "500g",
        price: 280,
        image: "/images/products/kanda-lasun-500.png"
    }
]

export default function ProductShowcase() {
    return (
        <section className="product-section">
            <div className="container">

                {/* HEADLINE */}
                <div className="section-header">
                    <h2 className="section-title">The Pride of Kolhapur</h2>
                    <p className="section-subtitle">Our signature blend, loved by 1200+ homes.</p>
                </div>

                {/* PRODUCT HIGHLIGHT */}
                <div className="product-highlight">
                    {PRODUCTS.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {/* TRUST INDICATORS (Guarantee) */}
                <div className="trust-strip">
                    <TrustItem icon="🌶️" label="No Artificial Color" sub="100% Natural Ingredients" />
                    <TrustItem icon="🥣" label="Traditionally Pounded" sub="Kandap Machine Method" />
                    <TrustItem icon="🏡" label="Made in Kolhapur" sub="Authentic Local Taste" />
                </div>

            </div>

            <style jsx>{`
                .product-section {
                    padding: 80px 24px;
                    background: #F9F6F1;
                    position: relative;
                    z-index: 10;
                    overflow: hidden; /* Contain glow */
                }
                
                .container {
                    max-width: 1280px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 2; /* Lift content above glow */
                }

                .section-header {
                    text-align: center;
                    margin-bottom: 48px;
                }

                .section-title {
                    font-family: var(--font-heading);
                    font-size: 36px;
                    color: var(--color-text-dark);
                    margin-bottom: 8px;
                }

                .section-subtitle {
                    color: var(--color-text-muted);
                    margin-bottom: 16px;
                    font-size: 16px;
                }

                .product-highlight {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 64px;
                }
                
                :global(.product-card) {
                    width: 100%;
                    max-width: 380px; /* Single Card Limit */
                }

                .trust-strip {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    padding-top: 40px;
                    border-top: 1px solid rgba(0,0,0,0.05); /* Optional: Keep or remove based on strictness */
                }
                @media (max-width: 600px) {
                    .trust-strip {
                        grid-template-columns: 1fr;
                        gap: 16px;
                        text-align: center;
                    }
                }
            `}</style>
        </section>
    )
}

function ProductCard({ product }) {
    return (
        <div className="product-card-wrapper">
            {/* 1. Ambient Glow (Energy from product) */}
            <div className="ambient-glow" style={{ zIndex: 0 }} />

            {/* 2. Localized Contrast (For blur to read) */}
            <div className="glass-contrast" style={{ zIndex: 1 }} />

            {/* 3. The Glass Card itself */}
            <div className="product-card glass-card">
                {/* IMAGE AREA */}
                <div className="image-wrapper">
                    {/* Fallback placeholder logic or Image */}
                    <Image
                        src={product.image}
                        alt={product.name}
                        layout="fill"
                        objectFit="contain"
                        className="prod-img"
                    />
                </div>

                {/* INFO AREA */}
                <div className="info-wrapper">
                    <h3 className="prod-name">{product.name}</h3>

                    {/* CTA BUTTON */}
                    <Link href="/product" legacyBehavior>
                        <a className="add-btn" onClick={() => import('../lib/feedback').then(({ feedback }) => feedback.trigger('cta'))}>
                            ORDER NOW
                        </a>
                    </Link>
                </div>
            </div>

            <style jsx>{`
                .product-card-wrapper {
                    position: relative; /* Anchor for glow/contrast */
                    transition: transform 0.3s ease;
                    /* Ensure wrapper has size */
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .product-card-wrapper:hover {
                    transform: translateY(-6px);
                }

                .product-card {
                    /* STRICT GLASSMORPHISM APPLIED VIA .glass-card GLOBAL CLASS */
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    position: relative; /* z-index context */
                    z-index: 10; /* Top layer */
                    width: 100%; /* Fill wrapper */
                }
                
                /* Resetting any conflicting styles */
                .product-card {
                     background: var(--glass-bg); 
                }
                
                /* Ensure Contrast Patch matches card size */
                :global(.glass-contrast) {
                    border-radius: 20px;
                }

                /* MOBILE OPTIMIZATION */
                @media (max-width: 768px) {
                    :global(.ambient-glow) {
                        opacity: 0.4; /* Significantly reduced */
                        transform: translate(-50%, -50%) scale(0.7); /* Smaller */
                    }
                    :global(.glass-contrast) {
                        /* Keep contrast but ensure it doesn't look odd with reduced glow */
                    }
                    .product-card-wrapper {
                        padding: 0 8px; /* Ensure breathing room */
                    }
                }

                .image-wrapper {
                    width: 100%;
                    aspect-ratio: 1;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                }
                
                :global(.prod-img) {
                    border-radius: 14px;
                    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.18));
                }

                .info-wrapper {
                    padding: 24px 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .prod-name {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--color-text-dark);
                    margin: 0 0 16px 0;
                    line-height: 1.3;
                    text-align: center;
                }

                .add-btn {
                    width: 100%;
                    background: var(--color-brand-red); 
                    color: #fff;
                    padding: 12px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-decoration: none;
                    border: none;
                    box-shadow: 0 4px 12px rgba(177, 18, 27, 0.2);
                }
                .add-btn:hover {
                    background: #8e0e15;
                    transform: scale(1.02);
                }
            `}</style>
        </div>
    )
}

function TrustItem({ icon, label, sub }) {
    return (
        <div className="trust-item">
            <span className="trust-icon">{icon}</span>
            <div className="trust-info">
                <span className="trust-label">{label}</span>
                <span className="trust-sub">{sub}</span>
            </div>
            <style jsx>{`
                .trust-item {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 12px;
                    background: #FAFAFA;
                    border-radius: 12px;
                }
                .trust-icon {
                    font-size: 24px;
                }
                .trust-info {
                    display: flex;
                    flex-direction: column;
                }
                .trust-label {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--color-text-dark);
                }
                .trust-sub {
                    font-size: 12px;
                    color: var(--color-text-muted);
                }
                @media (max-width: 600px) {
                    .trust-item {
                        flex-direction: column;
                        gap: 8px;
                    }
                }
            `}</style>
        </div>
    )
}
