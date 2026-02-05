import { useState, useEffect, useRef } from "react"
import Head from "next/head"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/router"
import Script from "next/script"
import Header from "../components/Header"
import Footer from "../components/Footer"

import Preloader from "../components/Preloader"
import CustomCursor from "../components/CustomCursor"
import NoiseOverlay from "../components/NoiseOverlay"
import PageTransition from "../components/PageTransition"
import { CartProvider } from "../context/CartContext"
import { TruckProvider } from "../context/TruckContext"
import "../styles/globals.css" /* Import Custom Overrides Last */
import "../styles/design-tokens.css"
import "../styles/TruckAnimation.css"



import WhatsAppChat from "../components/WhatsAppChat"

// Force Rebuild
export default function App({ Component, pageProps }) {
  const [lang, setLang] = useState("en")
  const router = useRouter()
  const scrollRef = useRef(null)

  const isAdmin = router.pathname.startsWith("/admin");

  /* 🔹 LENIS SMOOTH SCROLL + GSAP */
  useEffect(() => {
    // Disable for Admin only. Mobile now ALLOWED but uses Native Scroll + GSAP.
    if (isAdmin) return;

    // Check device type
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

    let lenis;
    let gsapModule;
    let ScrollTrigger;

    const initScroll = async () => {
      try {
        // Dynamic imports for SSR safety
        // const Lenis = (await import("lenis")).default; // Moved inside if (!isMobile)
        gsapModule = (await import("gsap")).default;
        ScrollTrigger = (await import("gsap/ScrollTrigger")).default;

        gsapModule.registerPlugin(ScrollTrigger);

        // 1. Initialize Lenis (DESKTOP ONLY)
        if (!isMobile) {
          const Lenis = (await import("lenis")).default; // Import Lenis only if needed
          lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2,
          });

          window.lenis = lenis;

          // Sync Lenis with GSAP Ticker
          gsapModule.ticker.add((time) => {
            lenis.raf(time * 1000);
          });

          // Disable lag smoothing for smoother scroll sync
          gsapModule.ticker.lagSmoothing(0);

          // ⚡ SCROLL SKEW EFFECT (DESKTOP ONLY)
          lenis.on('scroll', (e) => {
            ScrollTrigger.update();
            if (e.velocity) {
              const skew = Math.min(Math.max(e.velocity * 0.15, -2), 2);
              document.documentElement.style.setProperty('--scroll-skew', `${skew}deg`);
            }
          });
        }
      } catch (error) {
        console.warn("Lenis/GSAP failed to load:", error);
      }
    };

    initScroll();

    // Handle Route Changes
    const handleRouteChange = () => {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        // Fallback for native scroll (Mobile)
        window.scrollTo(0, 0);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      if (lenis) {
        lenis.destroy();
        window.lenis = null;
      }
      if (gsapModule && lenis) { // Only remove ticker if lenis was initialized and added to ticker
        gsapModule.ticker.remove((time) => lenis.raf(time * 1000));
      }
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, isAdmin]);

  // ⚡ HANDLER: FLASHBACK SCROLL (Instant Top)
  useEffect(() => {
    const handleQuickScroll = () => {
      // 1. Lenis
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true })
      }
      // 2. Window (Fallback/Mobile)
      window.scrollTo(0, 0)
    }

    window.addEventListener('nav-to-top', handleQuickScroll)
    return () => window.removeEventListener('nav-to-top', handleQuickScroll)
  }, [])

  /* ------------------------------------------- */
  /* ⚡ ADMIN PANEL: LIGHTWEIGHT LAYOUT         */
  /* ------------------------------------------- */
  /* ------------------------------------------- */
  /* ⚡ ADMIN PANEL: LIGHTWEIGHT LAYOUT         */
  /* ------------------------------------------- */
  if (isAdmin) {
    return (
      <>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        </Head>

        {/* Render Page Directly (No Animations, No Header/Footer) */}
        <Component {...pageProps} />
      </>
    );
  }

  /* ------------------------------------------- */
  /* 🛍️ CUSTOMER APP: ANIMATED LAYOUT           */
  /* ------------------------------------------- */
  return (
    <>
      <Preloader />
      <CustomCursor />
      <NoiseOverlay />

      {/* 🔹 GOOGLE ANALYTICS */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=G-1VTFZJJTV6`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-1VTFZJJTV6');
        `}
      </Script>

      {/* 🔤 GOOGLE FONT – NOTO SANS DEVANAGARI */}
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" href="/images/brand/kasturi-logo-red.png" as="image" />
        {/* Locomotive CSS removed from here to prevent duplicate/override issues */}
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
      </Head>
      <TruckProvider>
        <CartProvider>
          {/* HEADER (Smart Scroll) - Placed OUTSIDE scroll container for correct fixed positioning */}
          <Header lang={lang} setLang={setLang} />

          {/* MAIN SCROLL CONTAINER */}
          <main
            ref={scrollRef}
            style={{
              minHeight: '100vh',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              transformOrigin: "center center",
              // With Smart Scroll/Headroom, we need initial padding so content isn't hidden behind header
              paddingTop: router.pathname === '/' ? 0 : 'calc(72px + env(safe-area-inset-top))',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* HEADER MOVED OUTSIDE */}

            {/* PAGE TRANSITIONS */}
            <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
              <PageTransition key={router.asPath}>
                <Component {...pageProps} lang={lang} setLang={setLang} />
              </PageTransition>
            </AnimatePresence>

            <div>
              <Footer />
            </div>

            {/* 🛑 GLOBAL SCROLL SPACER (Fix for Footer Cut-off) */}
            <div style={{ height: 200, width: '100%', pointerEvents: 'none' }} />

          </main>
        </CartProvider>
      </TruckProvider>
    </>
  )
}

