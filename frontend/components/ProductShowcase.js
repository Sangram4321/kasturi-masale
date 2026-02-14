import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

export default function ProductShowcase() {
    const product = {
        id: "kanda-lasun-500",
        name: "Kolhapuri Kanda Lasun Masala",
        tagline: "The Original Ghati Masala",
        weight: "500g",
        price: 280,
        image: "/images/mobile-hero/IMG_5470.PNG"
    }

    return (
        <section className="product-showcase">
            <div className="container">

                {/* 1. Header Area - Very Clean */}
                <div className="header-area">
                    <span className="premium-tag">The Pride of Kolhapur</span>
                    <h2 className="main-title">Our Signature Blend</h2>
                </div>

                {/* 2. The Artifact (Image) */}
                <div className="artifact-stage">
                    {/* Ambient Glow behind the product */}
                    <div className="glow-backdrop" />

                    <div className="image-container">
                        <Image
                            src={product.image}
                            alt={product.name}
                            layout="fill"
                            objectFit="contain"
                            className="product-image"
                            priority
                        />
                    </div>
                </div>

                {/* 3. Product Details - Elegant Typography */}
                <div className="details-area">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">
                        Hand-pounded precision. Authentic taste loved by 1200+ homes.
                    </p>

                    {/* Trust Badges - Minimal */}
                    <div className="trust-row">
                        <span className="trust-pill">No Preservatives</span>
                        <span className="trust-dot">•</span>
                        <span className="trust-pill">Kandap Ground</span>
                        <span className="trust-dot">•</span>
                        <span className="trust-pill">100% Natural</span>
                    </div>

                    {/* 4. CTA - Pill Shape */}
                    <div className="action-area">
                        <Link href="/product" legacyBehavior>
                            <a className="shop-pill-btn">
                                Order Now <span className="arrow">→</span>
                            </a>
                        </Link>
                    </div>
                </div>

            </div>

            <style jsx>{`
                .product-showcase {
                    padding: 80px 24px 100px;
                    background: #F9F6F1; /* Seamless blend */
                    position: relative;
                    overflow: hidden;
                    text-align: center;
                }

                .container {
                    max-width: 1000px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 2;
                }

                /* HEADER */
                .premium-tag {
                    display: block;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: #8B4513; /* Earthy Bronze */
                    margin-bottom: 12px;
                    font-weight: 600;
                }

                .main-title {
                    font-family: var(--font-heading, 'Playfair Display', serif);
                    font-size: clamp(32px, 5vw, 48px);
                    color: #2D2A26;
                    margin: 0 0 40px;
                    font-weight: 800;
                }

                /* ARTIFACT STAGE */
                .artifact-stage {
                    position: relative;
                    width: 100%;
                    max-width: 500px; /* Generous width */
                    margin: 0 auto 40px;
                    display: flex;
                    justify-content: center;
                }

                .glow-backdrop {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 120%;
                    height: 120%;
                    transform: translate(-50%, -50%);
                    background: radial-gradient(circle, rgba(255, 165, 0, 0.15) 0%, transparent 70%);
                    filter: blur(40px);
                    z-index: 0;
                }

                .image-container {
                    position: relative;
                    width: 100%;
                    height: 500px; /* Tall and proud */
                    z-index: 1;
                    filter: drop-shadow(0 20px 40px rgba(0,0,0,0.15)); /* Soft shadow for depth */
                    transition: transform 0.5s ease-out;
                }
                
                .image-container:hover {
                    transform: scale(1.02);
                }

                /* DETAILS */
                .product-name {
                    font-family: var(--font-heading, 'Playfair Display', serif);
                    font-size: clamp(24px, 4vw, 36px);
                    color: #1a1a1a;
                    margin: 0 0 16px;
                }

                .product-desc {
                    font-size: 16px;
                    color: #555;
                    max-width: 600px;
                    margin: 0 auto 24px;
                    line-height: 1.6;
                }

                .trust-row {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 40px;
                    flex-wrap: wrap;
                }

                .trust-pill {
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #666;
                    font-weight: 500;
                }
                .trust-dot { color: #ccc; }

                /* CTA */
                .shop-pill-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    background: #B1121B; /* Brand Red */
                    color: white;
                    padding: 18px 48px;
                    border-radius: 50px; /* Full Pill */
                    font-size: 18px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 25px rgba(177, 18, 27, 0.3);
                }

                .shop-pill-btn:hover {
                    background: #8E0E15;
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px rgba(177, 18, 27, 0.4);
                }

                .arrow { font-size: 20px; transition: transform 0.2s; }
                .shop-pill-btn:hover .arrow { transform: translateX(4px); }

                /* MOBILE OPTIMIZATIONS */
                @media (max-width: 768px) {
                    .product-showcase { padding: 60px 20px 80px; }
                    .image-container { height: 350px; } /* Slightly smaller on mobile but still dominant */
                    .shop-pill-btn { width: 100%; justify-content: center; }
                }
            `}</style>
        </section>
    )
}
