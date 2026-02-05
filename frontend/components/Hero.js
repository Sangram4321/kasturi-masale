import React, { useRef, useEffect } from "react"
import Link from "next/link"
import gsap from "gsap"

export default function Hero() {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const tlRef = useRef(null)

  // 🎥 VIDEO PERFORMANCE: Pause when tab is inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        videoRef.current?.pause()
      } else {
        videoRef.current?.play()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  // 🎬 GSAP ENTRANCE ANIMATION
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      tlRef.current = gsap.timeline({ defaults: { ease: "power2.out" } })
        .fromTo(".hero-text-element",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.0, stagger: 0.15, clearProps: "all" }
        )
        .fromTo(".visual-container",
          { scale: 0.95, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" },
          "<" // Start with text
        )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="hero-section" ref={containerRef}>
      <div className="safe-container">

        {/* TEXT CONTENT */}
        <div className="hero-text-col">
          <h1 className="hero-heading hero-text-element">
            Asli Kolhapuri <br />
            Kanda Lasun Masala
          </h1>

          <h2 className="hero-subline hero-text-element">
            Bina color. Bina chemical. <br />
            Roz use hone wala.
          </h2>

          <p className="emotional-line hero-text-element">
            <em>The taste of authentic tradition, preserved for your kitchen.</em>
          </p>

          <p className="micro-trust hero-text-element">
            Fresh batches • Limited quantity • Made in Kolhapur
          </p>

          <div className="btn-container hero-text-element">
            <Link href="/product" legacyBehavior>
              <a className="premium-cta" onClick={() => import('../lib/feedback').then(({ feedback }) => feedback.trigger('cta'))}>
                ORDER NOW
                <span className="arrow-icon">→</span>
              </a>
            </Link>
            <p className="cta-subtext">COD Available | Ships in 24 hrs</p>
          </div>
        </div>

        {/* VISUAL CONTENT */}
        <div className="hero-visual-col">
          <div className="visual-container">
            {/* Dark Gradient Overlay for Readability/Mood */}
            <div className="cinematic-overlay" />

            <video
              ref={videoRef}
              src="/images/making/masala-making.MP4"
              poster="/images/hero/hero-kasturi-silbatta.png"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="cinematic-video"
            />
          </div>
        </div>

      </div>

      <style jsx>{`
        .hero-section {
            width: 100%;
            min-height: 90vh;
            background: #F9F6F1;
            padding-top: 100px;
            display: flex;
            align-items: center;
            overflow: hidden;
            position: relative;
        }

        .safe-container {
            width: 100%;
            max-width: 1320px; /* Slightly wider for cinematic feel */
            margin: 0 auto;
            padding: 0 24px;
            display: grid;
            grid-template-columns: 0.9fr 1.1fr; /* Video dominant on desktop */
            gap: 60px;
            align-items: center;
        }

        /* --- TEXT COLUMN --- */
        .hero-text-col {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            z-index: 10;
        }

        .hero-heading {
            font-family: var(--font-heading, 'Cormorant Garamond', serif);
            font-size: clamp(2.6rem, 5vw, 5rem);
            line-height: 1.05;
            color: var(--color-text-dark, #1a1a1a);
            margin-bottom: 24px;
            font-weight: 700;
            letter-spacing: -0.02em;
        }
        
        .hero-subline {
            font-family: var(--font-body, 'Inter', sans-serif);
            font-size: clamp(1.2rem, 1.8vw, 1.6rem);
            font-weight: 500;
            line-height: 1.4;
            color: #4a4a4a;
            margin-bottom: 16px;
        }

        .emotional-line {
            font-family: var(--font-heading);
            font-size: 1.25rem;
            color: #8D7B6F;
            margin-bottom: 32px;
            border-left: 3px solid var(--color-brand-red, #B1121B);
            padding-left: 16px;
        }

        .micro-trust {
            font-size: 0.85rem;
            font-weight: 700;
            color: #64748B;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 32px;
        }

        /* --- PREMIUM CTA --- */
        .btn-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
        }

        .premium-cta {
            background: linear-gradient(135deg, #C62828 0%, #8E0E15 100%);
            color: #fff;
            padding: 20px 48px;
            border-radius: 50px;
            font-weight: 700;
            font-size: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 10px 25px rgba(177, 18, 27, 0.3);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .premium-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px rgba(177, 18, 27, 0.4);
        }
        .arrow-icon {
            font-size: 1.2em;
            transition: transform 0.3s ease;
        }
        .premium-cta:hover .arrow-icon {
            transform: translateX(4px);
        }

        .cta-subtext {
            font-size: 0.8rem;
            color: #888;
            font-weight: 500;
        }

        /* --- VISUAL COLUMN --- */
        .hero-visual-col {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
        }

        .visual-container {
            width: 100%;
            height: 75vh;
            max-height: 800px;
            border-radius: 24px;
            overflow: hidden;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            background: #1a1a1a;
        }

        .cinematic-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .cinematic-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%);
            z-index: 2;
            pointer-events: none;
        }

        /* --- MOBILE LAYOUT --- */
        @media (max-width: 1024px) {
            .hero-section {
                padding-top: 112px;
                min-height: auto;
                flex-direction: column;
                align-items: stretch;
                padding-bottom: 60px;
            }

            .safe-container {
                grid-template-columns: 1fr;
                gap: 32px;
                display: flex;
                flex-direction: column;
            }

            /* Visual First on Mobile */
            .hero-visual-col {
                order: -1;
                width: 100%;
            }

            .visual-container {
                width: 100%;
                height: 50vh; /* CONSTRAINT: 48-52vh */
                max-height: 500px;
                border-radius: 20px;
            }

            .hero-text-col {
                align-items: center;
                text-align: center;
                padding: 0 12px;
            }

            .emotional-line {
                margin: 0 auto 24px;
                border: none;
                padding: 0;
                font-size: 1.1rem;
            }

            .premium-cta {
                width: 100%;
                justify-content: center;
                padding: 18px 32px;
            }
        }
      `}</style>
    </section>
  )
}
