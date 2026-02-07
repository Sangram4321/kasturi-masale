import Link from "next/link"
import React from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Phone, Mail, MapPin } from "lucide-react"
import GoogleReviewBadge from "./GoogleReviewBadge"

/* 
  FINAL PRODUCTION FOOTER
  - Strict Safe Zones
  - 4-Column Grid (Desktop) / Stack (Mobile)
  - No Overflow
  - Compliance Ready (FSSAI + GSTIN)
  - Flashback Scroll Effect
  - Animated Buttons
*/

export default function Footer() {
    const [flash, setFlash] = React.useState(false)

    const handleLogoClick = () => {
        setFlash(true)
        setTimeout(() => {
            // Dispatch event for _app.js to handle scroll (Locomotive or Native)
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent('nav-to-top'))
            }
            // keep flash for a split second after scroll to hide the jump
            setTimeout(() => setFlash(false), 50)
        }, 150) // Flash duration before jump
    }

    // 🔄 FIX: Force Scroll Update on Mount (to fix cut-off issues)
    React.useEffect(() => {
        const updateScroll = () => {
            try {
                if (window.locomotiveScrollInstance && typeof window.locomotiveScrollInstance.update === 'function') {
                    window.locomotiveScrollInstance.update();
                }
            } catch (error) {
                console.warn("Locomotive Scroll update failed:", error);
            }
        }

        // Update immediately
        // Safe update with a small delay to allow DOM to settle
        const timer = setTimeout(updateScroll, 500);
        return () => clearTimeout(timer);

    }, []);

    return (
        <footer className="footer-wrapper">
            <AnimatePresence>
                {flash && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            padding: 0,
                            margin: 0,
                            background: '#fff',
                            zIndex: 9999,
                            pointerEvents: 'none'
                        }}
                    />
                )}
            </AnimatePresence>
            <div className="footer-safe-area">

                {/* --- MAIN GRID SECTION --- */}
                <div className="footer-grid">

                    {/* COLUMN 1: BRAND & ADDRESS */}
                    <div className="col brand-col">
                        <motion.div
                            className="brand-header"
                            onClick={handleLogoClick}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <img
                                src="/images/brand/kasturi-logo-red.png"
                                alt="Kasturi Masale"
                                className="brand-logo"
                            />
                        </motion.div>

                        <div className="text-content">
                            <p className="brand-desc">
                                Authentic Kolhapuri spices, pounded to perfection.
                                We bring the legacy of pure taste and tradition straight to your kitchen.
                            </p>

                            <div className="address-box">
                                <MapPin className="icon-shrink" size={18} />
                                <address className="address-text">
                                    Gawaliwada Lane, Yavaluj<br />
                                    Panhala, Kolhapur – 416205
                                </address>
                            </div>
                        </div>
                    </div>

                    {/* COLUMN 2: DISCOVER */}
                    <div className="col links-col">
                        <h4 className="col-heading">Discover</h4>
                        <nav className="nav-stack">
                            <FooterLink href="/product" label="Our Spices" />
                            <FooterLink href="/about" label="Our Heritage" />
                            <FooterLink href="/blog" label="Masala Guide" />
                            <FooterLink href="/wholesale" label="Bulk & Wholesale" />
                            <FooterLink href="/coins" label="Kasturi Rewards" />
                        </nav>
                    </div>

                    {/* COLUMN 3: SUPPORT */}
                    <div className="col links-col">
                        <h4 className="col-heading">Support</h4>
                        <nav className="nav-stack">
                            <FooterLink href="/contact" label="Support" />
                            <FooterLink href="/coins" label="Coins Policy" />
                            <FooterLink href="/shipping" label="Shipping & Delivery" />
                            <FooterLink href="/refund" label="Returns Policy" />
                            <FooterLink href="/privacy" label="Privacy Policy" />
                            <FooterLink href="/terms" label="Terms of Use" />
                        </nav>
                    </div>

                    {/* COLUMN 4: CONNECT */}
                    <div className="col connect-col">
                        <h4 className="col-heading">Connect</h4>

                        {/* Socials - Animated */}
                        <div className="social-row">
                            <SocialIcon href="https://instagram.com" src="/images/icons/instagram.svg" label="Instagram" />
                            <SocialIcon href="https://facebook.com" src="/images/icons/facebook.svg" label="Facebook" />
                            <SocialIcon href="https://wa.me/917737379292" src="/images/icons/whatsapp.svg" label="WhatsApp" />
                        </div>

                        {/* Contacts - Animated */}
                        <div className="contact-stack">
                            <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                                <a href="mailto:support@kasturimasale.in" className="contact-pill">
                                    <div className="icon-circle">
                                        <Mail size={16} />
                                    </div>
                                    <span className="pill-text">support@kasturimasale.in</span>
                                </a>
                            </motion.div>

                            <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                                <a href="tel:+917737379292" className="contact-pill">
                                    <div className="icon-circle">
                                        <Phone size={16} />
                                    </div>
                                    <span className="pill-text">+91 77373 79292</span>
                                </a>
                            </motion.div>

                            {/* Bulk Order Link (Direct WhatsApp) */}
                            <div
                                onClick={() => window.open("https://wa.me/917737379292", "_blank")}
                                style={{
                                    marginTop: 8,
                                    fontWeight: 700,
                                    color: '#475569',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    textDecoration: 'underline',
                                    textAlign: 'center'
                                }}
                            >
                                Hotel & Bulk Orders? WhatsApp Us
                            </div>
                        </div>

                        {/* Google Badge */}
                        <div className="badge-container">
                            <GoogleReviewBadge theme="light" />
                        </div>
                    </div>

                </div>

                {/* --- BOTTOM BAR (COMPLIANCE) --- */}
                <div className="bottom-bar">
                    <div className="copyright">
                        © {new Date().getFullYear()} Kasturi Masale. Crafted with ❤️ in Kolhapur.
                    </div>

                    <div className="compliance-badges">
                        <span className="compliance-item">FSSAI: 115240860001170</span>
                        <span className="dot">•</span>
                        <span className="compliance-item">GSTIN: 27DXFPP4385E1Z5</span>
                    </div>

                    {/* SENSORY TOGGLE */}
                    <div className="sensory-toggle-wrapper">
                        <SensoryToggle />
                    </div>
                </div>

            </div>

            <style jsx>{`
        /* 1. WRAPPER & SAFE ZONES */
        .footer-wrapper {
          width: 100%;
          background-color: #FFFBF7;
          border-top: 1px solid #F1E5D1;
          color: #475569;
          font-family: 'Inter', sans-serif;
          position: relative;
        }

        .footer-safe-area {
            width: 100%;
            max-width: 1280px; /* STRICT MAX WIDTH */
            margin: 0 auto;
            padding: 64px 24px 16px; /* Minimal bottom padding */
            box-sizing: border-box;
        }

        @media (min-width: 1024px) {
            .footer-safe-area {
                padding-bottom: 20px; /* Minimal desktop spacing */
            }
        }

        /* 2. GRID LAYOUT */
        .footer-grid {
            display: grid;
            /* Mobile: 2 Columns by default */
            grid-template-columns: 1fr 1fr;
            gap: 32px 16px; /* Vertical 32px, Horizontal 16px */
            margin-bottom: 64px;
            width: 100%;
        }

        /* 3. COLUMNS & CONTAINMENT */
        .col {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            min-width: 0; 
        }

        /* Mobile Specific Spans & Alignment */
        .brand-col {
            grid-column: 1 / -1; /* Full Width */
            align-items: flex-start; /* CHANGED: Force Left Align */
            text-align: left; /* CHANGED: Force Left Align */
        }
        .connect-col {
            grid-column: 1 / -1; /* Full Width */
            align-items: center;
        }

        @media (min-width: 768px) {
           .footer-grid {
                grid-template-columns: 1fr 1fr; /* Tablet: 2 equal columns */
                gap: 48px;
           }
            /* Reset Spans & Alignment for Tablet+ */
            .brand-col {
                grid-column: auto;
                align-items: flex-start;
                text-align: left;
            }
            .connect-col {
                grid-column: auto;
                align-items: flex-start;
            }
            /* Reset Inner Elements */
            .address-box, .social-row {
                justify-content: flex-start;
            }
            .contact-stack {
                align-items: flex-start;
            }
        }

        @media (min-width: 1024px) {
            .footer-grid {
                /* Desktop: Balanced Columns */
                grid-template-columns: 1.4fr 0.8fr 0.8fr 1.2fr;
                gap: 40px;
            }
        }

        .col-heading {
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #94A3B8;
            margin-bottom: 24px;
        }

        /* 4. BRAND CONTENT (STRICT WRAPPING) */
        .brand-header {
            margin-bottom: 24px;
            cursor: pointer;
            /* Mobile: Centered Logo */
            display: flex;
            justify-content: center;
            width: 100%;
        }
        .brand-logo {
            height: 120px; /* Mobile: Balanced Size */
            width: auto;
            display: block;
            object-fit: contain;
        }

        @media (min-width: 768px) {
            .brand-header {
                justify-content: flex-start; /* Desktop: Left Align */
            }
            .brand-logo {
                height: 180px; /* Desktop: Original Size */
            }
        }

        .text-content {
            width: 100%;
            max-width: 100%; /* Force containment */
        }

        .brand-desc {
            font-size: 15px;
            line-height: 1.6;
            color: #334155;
            margin-bottom: 24px;
            /* FORCE WRAP */
            width: 100%;
            overflow-wrap: break-word;
            word-break: break-word;
            hyphens: auto;
        }

        .address-box {
            display: flex;
            gap: 10px; /* CHANGED: 10px spacing */
            align-items: flex-start;
            width: 100%;
            justify-content: flex-start; /* CHANGED: Force Left Align */
        }
        .icon-shrink {
            flex-shrink: 0; /* Icon never shrinks */
            color: #DC2626;
            margin-top: 2px;
        }
        .address-text {
            font-size: 14px;
            line-height: 1.5;
            font-style: normal;
            color: #475569;
            /* FORCE WRAP */
            flex: 1;
            min-width: 0;
            overflow-wrap: break-word;
        }

        /* 5. LINKS */
        .nav-stack {
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        /* 6. SOCIAL & CONNECT */
        .social-row {
            display: flex;
            gap: 12px;
            margin-bottom: 32px;
            justify-content: center; /* Mobile: Center */
        }

        /* Note: Styles for motion components are inline-styles or scoped inside the component func */

        .contact-stack {
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: 100%;
            margin-bottom: 32px;
            align-items: center; /* Mobile: Center */
        }

        .badge-container {
            width: 100%;
            overflow: hidden; /* Prevent iframe blowout */
        }

        /* ----------------------- */
        /* COMPONENT STYLES (MOVED) */
        /* ----------------------- */
        .contact-pill {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 16px;
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(226, 232, 240, 0.8);
            border-radius: 12px;
            color: #475569 !important; /* Force override blue */
            text-decoration: none !important; /* Force override underline */
            width: fit-content;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            backdrop-filter: blur(4px);
        }
        .contact-pill:hover {
            border-color: #DC2626;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
            background: #fff;
        }
        .contact-pill:hover .icon-circle {
            background: #FEF2F2;
            color: #DC2626;
        }
        .contact-pill:hover .pill-text {
            color: #0F172A;
        }

        .icon-circle {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #F1F5F9;
            color: #64748B;
            transition: all 0.3s ease;
        }
        .pill-text {
            font-weight: 500;
            letter-spacing: 0.01em;
            transition: color 0.2s;
        }

        /* 7. BOTTOM BAR */
        .bottom-bar {
            padding-top: 32px;
            border-top: 1px solid #E5E7EB;
            display: flex;
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
            font-size: 13px;
            color: #94A3B8;
        }

        .compliance-badges {
            display: flex;
            flex-wrap: wrap; /* Safety wrap for small screens */
            gap: 12px;
            align-items: center;
            background: #F1F5F9;
            padding: 6px 12px;
            border-radius: 6px;
            font-family: 'Geist Mono', monospace;
            color: #475569;
        }

        @media (min-width: 1024px) {
           .bottom-bar {
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
           }
        }
      `}</style>
        </footer>
    )
}

function FooterLink({ href, label }) {
    return (
        <Link href={href} legacyBehavior>
            <a className="footer-link">
                <span className="link-text">{label}</span>
                <div className="link-line" />
                <style jsx>{`
                    .footer-link {
                        color: #64748B;
                        text-decoration: none;
                        font-size: 15px;
                        position: relative;
                        display: inline-flex;
                        flex-direction: column;
                        width: fit-content;
                    }
                    .footer-link:hover .link-text {
                        color: #A61B1E;
                    }
                    
                    /* GO-THROUGH ANIMATION */
                    .link-line {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        height: 1px;
                        background: #A61B1E;
                        width: 100%;
                        transform: scaleX(0);
                        transform-origin: bottom right;
                        transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    }
                    
                    .footer-link:hover .link-line {
                        transform: scaleX(1);
                        transform-origin: bottom left;
                    }
                `}</style>
            </a>
        </Link>
    )
}

function SocialIcon({ href, src, label }) {
    return (
        <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
        >
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                aria-label={label}
            >
                <img src={src} alt={label} className="icon-img" />
            </a>
            <style jsx>{`
                .social-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: #fff;
                    border: 1px solid #E2E8F0;
                    text-decoration: none !important;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                .social-btn:hover {
                   border-color: #DC2626;
                   box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
                }
                .icon-img {
                    width: 44px;
                    height: 44px;
                    object-fit: contain;
                }
            `}</style>
        </motion.div>
    )
}

function SensoryToggle() {
    const [muted, setMuted] = React.useState(false)

    React.useEffect(() => {
        const isMuted = localStorage.getItem("kasturi_mute") === "true"
        setMuted(isMuted)
    }, [])

    const toggle = () => {
        const newState = !muted
        setMuted(newState)
        import('../lib/feedback').then(({ feedback }) => {
            feedback.setMuted(newState)
            if (!newState) feedback.trigger('tap')
        })
    }

    return (
        <button onClick={toggle} className="sensory-btn" aria-label="Toggle Sound">
            {muted ? (
                <>
                    <span style={{ opacity: 0.5 }}>🔇</span> <span className="st-label">Sound Off</span>
                </>
            ) : (
                <>
                    <span>🔊</span> <span className="st-label">Sound On</span>
                </>
            )}
            <style jsx>{`
                .sensory-btn {
                    background: none;
                    border: 1px solid #E2E8F0;
                    border-radius: 20px;
                    padding: 6px 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    color: #64748B;
                    transition: all 0.2s;
                }
                .sensory-btn:hover {
                    background: #fff;
                    border-color: #CBD5E1;
                    color: #0F172A;
                }
                .st-label {
                    font-weight: 500;
                }
            `}</style>
        </button>
    )
}
