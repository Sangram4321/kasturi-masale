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
import { CartProvider } from "../context/CartContext"
import { TruckProvider } from "../context/TruckContext"
import "locomotive-scroll/dist/locomotive-scroll.css" /* Import Library CSS First */
import "../styles/globals.css" /* Import Custom Overrides Last */
import "../styles/design-tokens.css"

export default function App({ Component, pageProps }) {
  const [lang, setLang] = useState("en")
  const router = useRouter()
  const scrollRef = useRef(null)

  /* 🔹 LOCOMOTIVE SCROLL + SKEW EFFECT */
  useEffect(() => {
    // Only run on desktop/larger screens (Tablet Landscape + Desktop)
    if (typeof window !== "undefined" && window.innerWidth < 1024) return

    let scroll

    const initScroll = async () => {
      try {
        const locomotiveModule = await import("locomotive-scroll")
        const LocomotiveScroll = locomotiveModule.default

        scroll = new LocomotiveScroll({
          el: scrollRef.current,
          smooth: true,
          smoothMobile: false,
          multiplier: 1,
          class: "is-reveal",
        })

      } catch (error) {
        console.warn("Locomotive Scroll failed to load:", error)
      }
    }

    initScroll()

    // Handle Route Changes
    const handleRouteChange = () => {
      if (scroll) {
        setTimeout(() => {
          scroll.update()
          scroll.scrollTo(0, { duration: 0, disableLerp: true })
        }, 500) // Increase delay slightly to account for exit transition
      }
    }
    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      if (scroll) scroll.destroy()
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

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
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Jost:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Locomotive CSS removed from here to prevent duplicate/override issues */}
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      <TruckProvider>
        <CartProvider>
          {/* HEADER (Fixed) - Placed OUTSIDE scroll container for stability */}
          <Header lang={lang} setLang={setLang} />

          {/* MAIN SCROLL CONTAINER */}
          <main data-scroll-container ref={scrollRef} style={{ minHeight: '100vh', width: '100%' }}>

            {/* PAGE TRANSITIONS */}
            <AnimatePresence mode="wait">
              <motion.div
                key={router.asPath}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ minHeight: '100vh' }}
              >
                <Component {...pageProps} lang={lang} setLang={setLang} />
              </motion.div>
            </AnimatePresence>

            <Footer />
          </main>
        </CartProvider>
      </TruckProvider>
    </>
  )
}
