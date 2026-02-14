import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router"
import { useCart } from "../context/CartContext"
import { feedback } from "../lib/feedback"

/* Simple Cart Icon */
const CartIcon = ({ size = 22 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
)

export default function HeaderMobile() {
    const [open, setOpen] = useState(false)
    const [loggedIn, setLoggedIn] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // Check on mount
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const router = useRouter()
    const { cart } = useCart()
    const totalQty = cart.reduce((s, i) => s + i.qty, 0)

    /* Check Login Status & Fetch Wallet */
    const [walletBalance, setWalletBalance] = useState(0)

    useEffect(() => {
        const check = async () => {
            const auth = localStorage.getItem("auth")
            setLoggedIn(!!auth)

            if (auth) {
                const u = localStorage.getItem("user")
                if (u) {
                    const parsedUser = JSON.parse(u)
                    try {
                        const res = await fetch(`/api/user/wallet/${parsedUser.uid}`)
                        const data = await res.json()
                        if (data.success) {
                            setWalletBalance(data.balance)
                        }
                    } catch (e) {
                        console.error("Failed to fetch wallet", e)
                    }
                }
            } else {
                setWalletBalance(0)
            }
        }

        check() // Initial Check

        window.addEventListener("auth-change", check)
        window.addEventListener("storage", check)
        // Listen for wallet-change events if you implement them elsewhere, or rely on page refreshes.
        // For now basics.

        return () => {
            window.removeEventListener("auth-change", check)
            window.removeEventListener("storage", check)
        }
    }, [])

    /* Logout Handler */
    const handleLogout = () => {
        feedback.trigger('cta')
        localStorage.removeItem("auth")
        localStorage.removeItem("user")
        localStorage.removeItem("token")

        // Dispatch event to update other components
        window.dispatchEvent(new Event("auth-change"))

        setLoggedIn(false)
        setWalletBalance(0)
        setOpen(false)
        router.push("/")
    }



    /* Lock body scroll when menu open */
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "auto"
        return () => {
            document.body.style.overflow = "auto"
        }
    }, [open])

    const isAuthPage = router.pathname.startsWith('/login') || router.pathname.startsWith('/signup')

    return (
        <>
            {/* MOBILE HEADER */}
            <header className="mh-header">
                <div className="mh-container">
                    <Link href="/" legacyBehavior>
                        <a className="mh-logo">
                            <Image
                                src="/images/brand/kasturi-logo-red.png"
                                alt="Kasturi Masale"
                                width={160}
                                height={40}
                                priority
                            />
                        </a>
                    </Link>

                    <div className="mh-actions">
                        {!isAuthPage && (
                            <Link href="/cart" legacyBehavior>
                                <a className="mh-cart" aria-label="Cart" onClick={() => feedback.trigger('cta')}>
                                    <CartIcon size={32} />
                                    {totalQty > 0 && <span className="mh-badge">{totalQty}</span>}
                                </a>
                            </Link>
                        )}

                        <button
                            className="mh-burger"
                            onClick={() => {
                                feedback.trigger('cta')
                                setOpen(!open)
                            }}
                            aria-label="Menu"
                        >
                            {open ? "✕" : "☰"}
                        </button>
                    </div>
                </div>
            </header>

            {/* MOBILE MENU DRAWER */}
            {open && (
                <>
                    <div className="mh-backdrop" onClick={() => setOpen(false)} />
                    <nav className="mh-drawer">
                        {/* Header within drawer removed to be a pure popup, or kept minimal? 
                            User asked for "Utility panel". Usually doesn't need a close button inside if clicking outside works.
                            But keeping a header is safe. Let's simplify.
                        */}

                        {loggedIn && (
                            <Link href="/account/coins" legacyBehavior>
                                <a className="mh-coins" onClick={() => setOpen(false)}>
                                    <span>🪙 Kasturi Coins:</span>
                                    <strong>{walletBalance}</strong>
                                </a>
                            </Link>
                        )}

                        <Link href="/" legacyBehavior><a onClick={() => setOpen(false)}>Home</a></Link>
                        <Link href="/product" legacyBehavior><a onClick={() => setOpen(false)}>Shop</a></Link>

                        {/* Why Kasturi Group */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '8px 0', margin: '8px 0' }}>
                            <div style={{ padding: '8px 16px', color: '#aaa', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Why Kasturi?</div>
                            <Link href="/why-kasturi" legacyBehavior><a style={{ paddingLeft: 32 }} onClick={() => setOpen(false)}>Why Premium?</a></Link>
                            <Link href="/heritage" legacyBehavior><a style={{ paddingLeft: 32 }} onClick={() => setOpen(false)}>Our Heritage</a></Link>
                            <Link href="/process" legacyBehavior><a style={{ paddingLeft: 32 }} onClick={() => setOpen(false)}>Our Process</a></Link>
                            <Link href="/spices" legacyBehavior><a style={{ paddingLeft: 32 }} onClick={() => setOpen(false)}>Our Spices</a></Link>
                        </div>

                        <Link href="/wholesale" legacyBehavior><a onClick={() => setOpen(false)}>Bulk / Wholesale</a></Link>
                        <Link href="/cart" legacyBehavior><a onClick={() => setOpen(false)}>Cart</a></Link>

                        {loggedIn && (
                            <>
                                <Link href="/orders" legacyBehavior><a onClick={() => setOpen(false)}>My Orders</a></Link>
                                <Link href="/profile" legacyBehavior><a onClick={() => setOpen(false)}>My Account</a></Link>
                            </>
                        )}
                        <Link href="/contact" legacyBehavior><a onClick={() => setOpen(false)}>Help / Support</a></Link>



                        {loggedIn ? (
                            <button className="mh-logout-btn" onClick={handleLogout}>Logout</button>
                        ) : (
                            <Link href={`/login?redirect=${encodeURIComponent(router.asPath)}`} legacyBehavior>
                                <a className="mh-logout-btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => {
                                    feedback.trigger('cta')
                                    setOpen(false)
                                }}>
                                    Login / Register
                                </a>
                            </Link>
                        )}
                        <div className="mh-socials">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><img src="/images/icons/instagram.svg" alt="IG" /></a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><img src="/images/icons/facebook.svg" alt="FB" /></a>
                            <a href="https://wa.me/917737379292" target="_blank" rel="noopener noreferrer"><img src="/images/icons/whatsapp.svg" alt="WA" /></a>
                        </div>
                    </nav>
                </>
            )}

            {/* STYLES */}
            <style jsx>{`
        /* Kill horizontal scroll */
        :global(html, body) {
          overflow-x: hidden;
        }

        /* Header - Soft Premium (Mobile) */
        .mh-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 3000;
          height: 76px;
          
          /* Default: Transparent for Hero */
          background: ${scrolled ? 'rgba(255, 255, 255, 0.94)' : 'transparent'};
          backdrop-filter: ${scrolled ? 'blur(12px)' : 'none'};
          -webkit-backdrop-filter: ${scrolled ? 'blur(12px)' : 'none'};
          box-shadow: ${scrolled ? '0 4px 20px rgba(0,0,0,0.03)' : 'none'};
          border-bottom: ${scrolled ? '1px solid rgba(0,0,0,0.03)' : 'none'};
          
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; align-items: center;
        }

        .mh-container {
          width: 100%;
          height: 100%;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative; /* Anchor for drawer */
        }

        .mh-logo {
          display: flex;
          align-items: center;
        }

        .mh-logo :global(img) {
          height: 120px; 
          width: auto;
        }

        .mh-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mh-cart,
        .mh-burger {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          position: relative;
          font-size: 28px;
          /* Color change: White on hero (unscrolled), Dark on white header (scrolled) */
          color: ${scrolled ? '#2d2a26' : '#ffffff'};
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 50%;
        }

        .mh-cart:active,
        .mh-burger:active {
          background: rgba(0,0,0,0.05);
          transform: scale(0.92);
        }

        .mh-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #b1121b;
          color: #fff;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 10px;
          line-height: 1;
        }

        /* Backdrop - Transparent but clickable */
        .mh-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4); /* Dimmed background for better context */
          backdrop-filter: blur(2px);
          z-index: 2999;
          transition: background 0.3s ease;
        }

        /* Utility Panel Drawer - Glass Card Style */
        .mh-drawer {
          position: absolute; /* Relative to header container or fixed? Fixed is safer for scroll. */
          position: fixed;
          top: 80px; /* Below header */
          right: 16px; /* Floating right */
          width: 260px; /* Panel width */
          max-height: calc(100vh - 100px);
          overflow-y: auto;
          
          /* Glass Style */
          background: rgba(30, 30, 30, 0.85); /* Lighter dark glass than login */
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.2);
          z-index: 3000;
          
          /* Animation */
          animation: menuPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: top right;
          
          /* Smooth Scroll (Momentum) */
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          scrollbar-width: none;
        }
        
        .mh-drawer::-webkit-scrollbar {
            display: none;
        }

        @keyframes menuPop {
            from { opacity: 0; transform: scale(0.95) translateY(-10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .mh-coins {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: linear-gradient(90deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05));
            border: 1px solid rgba(255, 215, 0, 0.3);
            color: #ffd700;
            padding: 12px 16px;
            border-radius: 12px;
            margin-bottom: 8px;
            font-weight: 600;
            font-size: 15px;
        }

        .mh-drawer a {
          padding: 14px 16px;
          border-radius: 12px;
          background: transparent;
          text-decoration: none;
          color: rgba(255,255,255,0.9);
          font-weight: 500;
          font-size: 15px;
          transition: background 0.2s, color 0.2s;
          display: block;
        }

        .mh-drawer a:active {
            background: rgba(255,255,255,0.1);
            color: #fff;
        }
        
        .mh-logout-btn {
            width: 100%;
            padding: 14px;
            background: rgba(177, 18, 27, 0.15);
            color: #ff6b6b;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 15px;
            margin-top: 10px;
            cursor: pointer;
            text-align: center;
        }
        .mh-logout-btn:active {
            background: rgba(177, 18, 27, 0.25);
        }

        .mh-socials {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        .mh-socials a {
            padding: 8px !important;
            background: rgba(255,255,255,0.05) !important;
            border-radius: 50% !important;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .mh-socials a img {
            width: 28px;
            height: 28px;
            object-fit: contain;
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        .mh-socials a:hover img {
            opacity: 1;
        }

      `}</style>
        </>
    )
}
