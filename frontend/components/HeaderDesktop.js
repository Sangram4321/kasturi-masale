import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useCart } from "../context/CartContext"
import { feedback } from "../lib/feedback" // Import Feedback

/* -----------------------------------------------------------
   ICONS
----------------------------------------------------------- */
const CartIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
)

const UserIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
)

/* -----------------------------------------------------------
   AUTH HELPERS
----------------------------------------------------------- */
const getUser = () => {
    if (typeof window === "undefined") return null
    const u = localStorage.getItem("user")
    return u ? JSON.parse(u) : null
}

const checkLogin = () => {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem("auth")
}

export default function HeaderDesktop() {
    const router = useRouter()
    const { cart } = useCart()
    const { scrollY } = useScroll()

    /* -----------------------------------------------------------
       STATE
    ----------------------------------------------------------- */
    const [hidden, setHidden] = useState(false)
    const [loggedIn, setLoggedIn] = useState(false)
    const [user, setUser] = useState(null)
    const [walletBalance, setWalletBalance] = useState(0)

    /* -----------------------------------------------------------
       SCROLL LOGIC (SMART HIDE)
    ----------------------------------------------------------- */
    /* -----------------------------------------------------------
       SCROLL LOGIC (SMART HIDE) - Compatible with Locomotive
    ----------------------------------------------------------- */
    /* -----------------------------------------------------------
       SCROLL LOGIC (HIDE WHILE SCROLLING, SHOW ON STOP)
    ----------------------------------------------------------- */
    useEffect(() => {
        let isScrollingTimer = null

        const updateHeader = (currentY) => {
            // Always show at the very top
            if (currentY < 50) {
                setHidden(false)
                clearTimeout(isScrollingTimer)
                return
            }

            // Hide while moving
            setHidden(true)

            // Show after stop (Debounce)
            if (isScrollingTimer) clearTimeout(isScrollingTimer)
            isScrollingTimer = setTimeout(() => {
                setHidden(false)
            }, 10) // Ultra fast reveal (10ms) after scroll stops
        }

        // 1. Native Scroll Listener
        const handleNativeScroll = () => {
            updateHeader(window.scrollY)
        }

        // 2. Locomotive Scroll Listener
        const handleLocoScroll = (args) => {
            if (typeof args.scroll.y === 'number') {
                updateHeader(args.scroll.y)
            }
        }

        // Bind Native
        window.addEventListener('scroll', handleNativeScroll)

        // Bind Locomotive
        const checkForLoco = setInterval(() => {
            if (window.locomotiveScrollInstance) {
                window.locomotiveScrollInstance.on('scroll', handleLocoScroll)
                clearInterval(checkForLoco)
            }
        }, 500)

        return () => {
            window.removeEventListener('scroll', handleNativeScroll)
            if (isScrollingTimer) clearTimeout(isScrollingTimer)
            if (window.locomotiveScrollInstance) {
                window.locomotiveScrollInstance.off('scroll', handleLocoScroll)
            }
            clearInterval(checkForLoco)
        }
    }, [])

    /* -----------------------------------------------------------
       AUTH & DATA SYNC
    ----------------------------------------------------------- */
    useEffect(() => {
        const sync = async () => {
            const isIn = checkLogin()
            setLoggedIn(isIn)
            setUser(isIn ? getUser() : null)

            if (isIn) {
                const u = getUser()
                if (u) {
                    try {
                        const res = await fetch(`/api/user/wallet/${u.uid}`)
                        const data = await res.json()
                        if (data.success) setWalletBalance(data.balance)
                    } catch (e) { console.error(e) }
                }
            } else {
                setWalletBalance(0)
            }
        }
        sync()
        const handleChange = () => sync()
        router.events.on("routeChangeComplete", handleChange)
        window.addEventListener("auth-change", handleChange)
        window.addEventListener("storage", handleChange)
        return () => {
            router.events.off("routeChangeComplete", handleChange)
            window.removeEventListener("auth-change", handleChange)
            window.removeEventListener("storage", handleChange)
        }
    }, [router.events])

    const totalQty = cart.reduce((s, i) => s + i.qty, 0)
    const isAuthPage = router.pathname.startsWith('/login') || router.pathname.startsWith('/signup')

    /* -----------------------------------------------------------
       RENDER
    ----------------------------------------------------------- */
    return (
        <>
            <motion.header
                className="smart-header"
                variants={{
                    visible: { y: 0 },
                    hidden: { y: "-100%" }
                }}
                animate={hidden ? "hidden" : "visible"}
                transition={{ type: "spring", stiffness: 600, damping: 20, mass: 0.8 }} // Super fast bouncy effect
                style={{ overflow: 'visible' }} // 🛑 CRITICAL: Prevents dropdown clipping
            >
                <div className="header-inner">

                    {/* 1. LOGO */}
                    <div className="logo-area">
                        <Link href="/" legacyBehavior>
                            <a className="logo-link">
                                <Image
                                    src="/images/brand/kasturi-logo-red.png"
                                    alt="Kasturi Masale"
                                    width={140}
                                    height={140}
                                    className="logo-img"
                                    priority
                                />
                            </a>
                        </Link>
                    </div>

                    {/* 2. CENTER NAVIGATION */}
                    <nav className="nav-center">
                        <NavLink href="/product" label="Shop" />

                        {/* WHY KASTURI DROPDOWN */}
                        <div className="nav-dropdown">
                            <div className="nav-item-wrapper">
                                <span className="nav-text">Why Kasturi?</span>
                                <div className="nav-line" />
                            </div>

                            <div className="dropdown-content">
                                <Link href="/why-kasturi" legacyBehavior><a className="dd-item">Why Kasturi Is Premium</a></Link>
                                <Link href="/process" legacyBehavior><a className="dd-item">Our Process</a></Link>
                                <Link href="/heritage" legacyBehavior><a className="dd-item">Our Heritage</a></Link>
                                <Link href="/spices" legacyBehavior><a className="dd-item">Our Spices</a></Link>
                            </div>
                        </div>

                        <NavLink href="/wholesale" label="Bulk / Wholesale" />
                    </nav>

                    {/* 3. RIGHT ACTIONS */}
                    <div className="actions-right">

                        {loggedIn ? (
                            <>
                                <Link href="/account/coins" legacyBehavior>
                                    <a className="wallet-badge" onClick={() => feedback.trigger('cta')}>
                                        🪙 {walletBalance}
                                    </a>
                                </Link>

                                <Link href="/orders" legacyBehavior>
                                    <a className="my-orders-link" onClick={() => feedback.trigger('cta')}>My Orders</a>
                                </Link>

                                <button
                                    className="logout-link-btn"
                                    onClick={() => {
                                        feedback.trigger('cta')
                                        localStorage.removeItem("auth")
                                        localStorage.removeItem("user")
                                        localStorage.removeItem("token")
                                        window.dispatchEvent(new Event("auth-change"))
                                        setLoggedIn(false)
                                        router.push("/")
                                    }}
                                >
                                    Logout
                                </button>

                                <div className="user-menu-trigger">
                                    <Link href="/profile" legacyBehavior>
                                        <a className="icon-btn" onClick={() => feedback.trigger('cta')}>
                                            <UserIcon size={22} />
                                        </a>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <Link href={`/login?redirect=${encodeURIComponent(router.asPath)}`} legacyBehavior>
                                <a className="login-pill" onClick={() => feedback.trigger('cta')}>
                                    Login / Register
                                </a>
                            </Link>
                        )}

                        {!isAuthPage && (
                            <Link href="/cart" legacyBehavior>
                                <a className="cart-btn" onClick={() => feedback.trigger('cta')}>
                                    <CartIcon size={22} />
                                    {totalQty > 0 && <span className="qty-dot" />}
                                </a>
                            </Link>
                        )}
                    </div>

                </div>
            </motion.header>

            <style jsx>{`
                .smart-header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 72px; /* Reduced from 90px */
                    background-color: #FDFBF7; /* Cream background matching design */
                    z-index: 9999; /* Force highest z-index */
                    isolation: isolate; /* Create new stacking context */
                    display: flex;
                    align-items: center;
                    box-shadow: 0 2px 20px rgba(0,0,0,0.02);
                    overflow: visible !important;
                }

                .header-inner {
                    width: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 40px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    overflow: visible !important;
                }

                /* LOGO */
                .logo-area {
                    flex: 1;
                    display: flex;
                    justify-content: flex-start;
                }
                .logo-link {
                    display: block;
                    width: 140px;
                    height: auto;
                }
                
                /* NAV CENTER */
                .nav-center {
                    flex: 2;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 40px;
                    overflow: visible !important;
                }

                /* DROPDOWN */
                .nav-dropdown {
                    position: relative;
                    height: 100%;
                    display: flex; 
                    align-items: center;
                    overflow: visible !important;
                    z-index: 2000;
                }
                .dropdown-content {
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%) translateY(10px);
                    background: #fff;
                    min-width: 240px;
                    padding: 12px;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.2s ease;
                    z-index: 9999;
                }
                .nav-dropdown:hover .dropdown-content {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(-50%) translateY(0);
                    pointer-events: auto;
                }
                .nav-item-wrapper {
                    position: relative;
                    padding: 8px 0;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-decoration: none;
                    color: #4B4B4B;
                }
                .nav-text {
                    font-family: var(--font-body, sans-serif);
                    font-size: 15px;
                    font-weight: 500;
                    color: #4B4B4B;
                    transition: color 0.3s ease;
                    white-space: nowrap; /* Prevent wrapping */
                }
                .nav-item-wrapper:hover .nav-text {
                    color: #A61B1E;
                }
                /* 
                   --------------------------------------------------
                   GO-THROUGH UNDERLINE ANIMATION (Red Maroon)
                   --------------------------------------------------
                */
                :global(.nav-line) {
                    position: absolute;
                    bottom: 0px;
                    left: 0;
                    height: 2px;
                    background: #A61B1E;
                    border-radius: 2px;
                    width: 100%;
                    transform: scaleX(0);
                    transform-origin: bottom right;
                    transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                .nav-item-wrapper:hover :global(.nav-line) {
                    transform: scaleX(1);
                    transform-origin: bottom left;
                }

                /* DROPDOWN ITEMS - Clean & Professional */
                .dd-item {
                    display: block;
                    padding: 12px 16px;
                    color: #4B4B4B;
                    text-decoration: none;
                    font-size: 14px;
                    border-radius: 6px;
                    transition: all 0.2s ease;
                    font-weight: 500;
                    border-left: 3px solid transparent;
                    white-space: nowrap;
                }
                .dd-item:hover {
                    background: #F9FAFB;
                    color: #111827;
                    border-left: 3px solid #A61B1E; /* Sharp indicator */
                    padding-left: 20px;
                }

                /* ACTIONS RIGHT */
                .actions-right {
                    flex: 1;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 24px;
                }

                /* LOGIN BUTTON */
                .login-pill {
                    border: 1px solid #2D2A26;
                    border-radius: 999px;
                    padding: 8px 24px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #2D2A26;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }
                .login-pill:hover {
                    background: #2D2A26;
                    color: #FFF;
                }

                /* ICONS */
                .cart-btn, .icon-btn {
                    color: #2D2A26;
                    position: relative;
                    display: flex;
                    align-items: center;
                    transition: transform 0.2s;
                    cursor: pointer;
                }
                .cart-btn:hover, .icon-btn:hover {
                    transform: scale(1.1);
                    color: #A61B1E;
                }

                .my-orders-link {
                    font-size: 14px;
                    font-weight: 600;
                    color: #4B4B4B;
                    text-decoration: none;
                    transition: color 0.2s;
                    margin-right: 8px;
                    white-space: nowrap;
                }
                .my-orders-link:hover {
                    color: #A61B1E;
                }

                .logout-link-btn {
                    background: none;
                    border: none;
                    font-size: 14px;
                    font-weight: 600;
                    color: #9CA3AF; /* Muted gray for logout */
                    cursor: pointer;
                    transition: color 0.2s;
                    margin-right: 12px;
                    padding: 0;
                    font-family: inherit;
                    white-space: nowrap;
                }
                .logout-link-btn:hover {
                    color: #A61B1E;
                    text-decoration: underline;
                }

                .qty-dot {
                    position: absolute;
                    top: 0;
                    right: -2px;
                    width: 8px;
                    height: 8px;
                    background: #A61B1E;
                    border-radius: 50%;
                    border: 1px solid #FDFBF7;
                }

                .wallet-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    white-space: nowrap;
                    font-size: 14px;
                    font-weight: 600;
                    color: #B8860B;
                    background: rgba(184, 134, 11, 0.1);
                    padding: 6px 12px;
                    border-radius: 12px;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                .wallet-badge:hover {
                    background: rgba(184, 134, 11, 0.2);
                    transform: translateY(-1px);
                }

                /* Responsive tweak */
                @media (max-width: 1024px) {
                    .header-inner { padding: 0 24px; }
                    .nav-center { gap: 20px; } /* Reduced gap */
                }
            `}</style>
        </>
    )
}

/* 🎨 PROFESSIONAL NAV LINK COMPONENT */
function NavLink({ href, label }) {
    return (
        <Link href={href} legacyBehavior>
            <a className="nav-item-wrapper custom-nav-link">
                <span className="nav-text">{label}</span>
                <div className="nav-line" />
                <style jsx>{`
                    .custom-nav-link {
                        text-decoration: none !important;
                        color: #4B4B4B !important;
                        position: relative;
                        padding: 8px 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .custom-nav-link:hover .nav-text {
                        color: #A61B1E !important;
                    }

                    /* ANIMATION STYLES COPIED HERE FOR SCOPE */
                    .nav-line {
                        position: absolute;
                        bottom: 0px;
                        left: 0;
                        height: 2px;
                        background: #A61B1E;
                        border-radius: 2px;
                        width: 100%;
                        transform: scaleX(0);
                        transform-origin: bottom right;
                        transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    }
    
                    .nav-item-wrapper:hover .nav-line {
                        transform: scaleX(1);
                        transform-origin: bottom left;
                    }
                `}</style>
            </a>
        </Link>
    )
}
