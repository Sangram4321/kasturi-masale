import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import React from "react"

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
};

export default function ProductShowcase() {
    const [selectedVariant, setSelectedVariant] = React.useState("500g")
    const [activeImage, setActiveImage] = React.useState(0)
    const [direction, setDirection] = React.useState(0)

    const variants = {
        enter: (direction) => {
            return {
                x: direction > 0 ? 1000 : -1000,
                opacity: 0,
                scale: 0.5,
                zIndex: 0
            };
        },
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction) => {
            return {
                zIndex: 0,
                x: direction < 0 ? 1000 : -1000,
                opacity: 0,
                scale: 0.5
            };
        }
    };

    const productVariants = {
        "200g": {
            id: "kanda-lasun-200",
            weight: "200g",
            price: 120,
            images: [
                "/images/products/kanda-lasun-200.png",
                "/images/products/trust-cert.png",
                "/images/products/nutritional.png"
            ]
        },
        "500g": {
            id: "kanda-lasun-500",
            weight: "500g",
            price: 280,
            images: [
                "/images/products/kanda-lasun-500.png",
                "/images/products/trust-cert.png",
                "/images/products/nutritional.png"
            ]
        },
        "1kg": {
            id: "kanda-lasun-1000",
            weight: "1kg",
            price: 499,
            images: [
                "/images/products/kanda-lasun-1000.png",
                "/images/products/trust-cert.png",
                "/images/products/nutritional.png"
            ]
        },
        "2kg": {
            id: "kanda-lasun-2000",
            weight: "2kg",
            price: 899,
            images: [
                "/images/products/kanda-lasun-2000.png",
                "/images/products/trust-cert.png",
                "/images/products/nutritional.png"
            ]
        }
    }

    const currentVariant = productVariants[selectedVariant]

    const paginate = (newDirection) => {
        setDirection(newDirection);
        let nextIndex = activeImage + newDirection;

        // Infinite loop logic
        if (nextIndex < 0) nextIndex = currentVariant.images.length - 1;
        if (nextIndex >= currentVariant.images.length) nextIndex = 0;

        setActiveImage(nextIndex);
    };

    // Reset active image when variant changes
    React.useEffect(() => {
        setActiveImage(0)
    }, [selectedVariant])

    return (
        <section className="product-showcase">
            <div className="container">

                {/* 1. Header Area - Very Clean */}
                <div className="header-area">
                    <span className="premium-tag">The Pride of Kolhapur</span>
                    <h2 className="main-title">Our Signature Blend</h2>
                </div>

                {/* 2. The Artifact (Image Gallery) */}
                <div className="artifact-stage">
                    {/* Ambient Glow behind the product */}
                    <div className="glow-backdrop" />

                    <div className="image-container">
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={`${selectedVariant}-${activeImage}`}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={1}
                                onDragEnd={(e, { offset, velocity }) => {
                                    const swipe = swipePower(offset.x, velocity.x);

                                    if (swipe < -swipeConfidenceThreshold) {
                                        paginate(1);
                                    } else if (swipe > swipeConfidenceThreshold) {
                                        paginate(-1);
                                    }
                                }}
                                className="image-wrapper"
                            >
                                <Image
                                    src={currentVariant.images[activeImage]}
                                    alt={`Kolhapuri Kanda Lasun Masala ${currentVariant.weight} - View ${activeImage + 1}`}
                                    layout="fill"
                                    objectFit="contain"
                                    className="product-image"
                                    priority
                                    sizes="(max-width: 768px) 100vw, 500px"
                                    quality={90}
                                    draggable={false}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Preload Next/Prev Images for instant swipe */}
                        <div style={{ display: 'none' }}>
                            <Image
                                src={currentVariant.images[(activeImage + 1) % currentVariant.images.length]}
                                alt="preload next"
                                layout="fill"
                                priority
                            />
                            <Image
                                src={currentVariant.images[(activeImage - 1 + currentVariant.images.length) % currentVariant.images.length]}
                                alt="preload prev"
                                layout="fill"
                                priority
                            />
                        </div>
                    </div>

                    {/* Image Navigation Dots */}
                    <div className="image-nav">
                        {currentVariant.images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setDirection(idx > activeImage ? 1 : -1)
                                    setActiveImage(idx)
                                }}
                                className={`nav-dot ${idx === activeImage ? 'active' : ''}`}
                                aria-label={`View image ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* 3. Product Details - Elegant Typography */}
                <div className="details-area">
                    <h3 className="product-name">Kolhapuri Kanda Lasun Masala</h3>
                    <p className="tagline">The Original Ghati Masala</p>

                    {/* Variant Selector */}
                    <div className="variant-selector">
                        {Object.keys(productVariants).map((weight) => (
                            <button
                                key={weight}
                                onClick={() => setSelectedVariant(weight)}
                                className={`variant-btn ${selectedVariant === weight ? 'active' : ''}`}
                            >
                                {weight}
                            </button>
                        ))}
                    </div>

                    {/* Price Tag */}
                    <div className="price-block">
                        <span className="currency">₹</span>
                        <span className="amount">{currentVariant.price}</span>
                        <span className="per-weight">/ {currentVariant.weight}</span>
                    </div>

                    <p className="product-desc">
                        Hand-pounded precision. Authentic taste.
                    </p>


                    {/* Trust Badges - Minimal */}
                    <div className="trust-row">
                        <span className="trust-pill">No Preservatives</span>
                        <span className="trust-dot">•</span>
                        <span className="trust-pill">Kandap Ground</span>
                    </div>

                    {/* 4. CTA - Pill Shape */}
                    <div className="action-area">
                        <Link href="/product" legacyBehavior>
                            <a className="shop-pill-btn">
                                Order Now <span className="arrow">→</span>
                            </a>
                        </Link>

                        {/* TRUST SIGNALS (New) */}
                        <div className="trust-signals-hero">
                            <p className="purity-line">Fresh Homemade • No Palm Oil • No Preservatives</p>
                            <p className="cod-line">Cash on Delivery Available</p>
                        </div>
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
                    overflow: hidden; /* CRITICAL for slide animations */
                }
                
                .image-container:hover {
                    /* Transform removed to prevent conflict with drag gesture */
                    cursor: grab;
                }
                .image-container:active {
                    cursor: grabbing;
                }

                .image-wrapper {
                    position: absolute; /* CRITICAL for AnimatePresence sliding */
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }

                .image-nav {
                    position: absolute;
                    bottom: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 10px;
                    z-index: 10;
                }

                .nav-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #ddd;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .nav-dot.active {
                    background: #B1121B;
                    transform: scale(1.2);
                }

                /* DETAILS */
                .product-name {
                    font-family: var(--font-heading, 'Playfair Display', serif);
                    font-size: clamp(24px, 4vw, 36px);
                    color: #1a1a1a;
                    margin: 0 0 4px;
                }

                .tagline {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 24px;
                    font-style: italic;
                }

                .variant-selector {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                }

                .variant-btn {
                    padding: 8px 20px;
                    border: 1px solid #ddd;
                    background: transparent;
                    border-radius: 30px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #555;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .variant-btn:hover {
                    border-color: #B1121B;
                    color: #B1121B;
                }

                .variant-btn.active {
                    background: #B1121B;
                    color: white;
                    border-color: #B1121B;
                    box-shadow: 0 4px 10px rgba(177, 18, 27, 0.2);
                }

                .price-block {
                    font-family: var(--font-heading, 'Playfair Display', serif);
                    color: #B1121B; /* Brand Red */
                    margin-bottom: 16px;
                    display: flex;
                    align-items: baseline;
                    justify-content: center;
                    gap: 4px;
                }
                .currency { font-size: 20px; font-weight: 600; }
                .amount { font-size: 32px; font-weight: 700; }
                .per-weight { 
                    font-family: var(--font-body); 
                    font-size: 14px; 
                    color: #666; 
                    font-weight: 500;
                    margin-left: 4px;
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
                
                /* TRUST SIGNALS CSS */
                .trust-signals-hero {
                    margin-top: 20px;
                    color: #666;
                }
                .purity-line {
                    font-size: 12px;
                    margin: 0 0 4px;
                    font-weight: 500;
                    opacity: 0.9;
                }
                .cod-line {
                    font-size: 13px;
                    font-weight: 600;
                    color: #444; /* Slightly darker */
                    margin: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }
                /* Add a subtle icon or dot if needed, but text is clean */
                .cod-line::before {
                    content: '●';
                    color: #16a34a; /* Green dot for availability */
                    font-size: 8px;
                }

                /* MOBILE OPTIMIZATIONS (CONVERSION FOCUSED) */
                @media (max-width: 768px) {
                    .product-showcase { 
                        padding: 40px 20px 60px !important; /* Force tight padding */
                    }
                    
                    .header-area { margin-bottom: 24px !important; }
                    .main-title { margin-bottom: 0 !important; font-size: 28px !important; }
                    
                    .artifact-stage { margin-bottom: 24px !important; }
                    
                    .image-container { 
                        height: 260px !important; /* CRITICAL: Force reduced height */
                    } 
                    
                    .product-name { font-size: 22px !important; margin-bottom: 4px !important; }
                    
                    .price-block { margin-bottom: 12px !important; }
                    .amount { font-size: 28px !important; }
                    
                    .product-desc { 
                        margin-bottom: 16px;
                        font-size: 14px;
                    }

                    .trust-row {
                        margin-bottom: 24px !important;
                        gap: 8px !important;
                    }
                    .trust-pill { font-size: 11px !important; }

                    .shop-pill-btn { 
                        width: 100% !important; 
                        justify-content: center !important; 
                        padding: 16px 32px !important;
                    }
                }
            `}</style>
        </section>
    )
}
