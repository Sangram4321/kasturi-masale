import Head from 'next/head'
import Hero from "../components/Hero"
import Hero2 from "../components/Hero2"
import HeritageTeaser from "../components/HeritageTeaser" // [NEW] SEO Teaser
// import BenefitBadges from "../components/BenefitBadges" // Replaced by Premium Section
import TrustComparisonSection from '../components/TrustComparisonSection'
import ComparisonGrid from '../components/ComparisonGrid'
import PremiumJustificationBar from '../components/PremiumJustificationBar'
import GuaranteeBox from '../components/GuaranteeBox'
import dynamic from 'next/dynamic'
import SEOContent from '../components/SEOContent' // [NEW] SEO Content

const ProductShowcase = dynamic(() => import('../components/ProductShowcase'), { ssr: false })
import BrandStory from "../components/BrandStory"
import SocialProofStrip from "../components/SocialProofStrip"
// Footer is imported in _app.js

/* 
  HOMEPAGE COMPOSITION
  Constraint: Max 5 Sections (Hero + Teaser + Trust + Product + Story + SEO)
*/

export default function Home({ lang = "en" }) {
  return (
    <main className="page">
      <Head>
        <title>Best Kolhapuri Masale Online | Authentic Kanda Lasun Masala Manufacturer - Kasturi Masale</title>
        <meta name="description" content="Buy authentic Kolhapuri masale online directly from Kolhapur. We are a premium spice manufacturer offering famous Kanda Lasun Masala, pounded to perfection. Taste the tradition." />
        <meta name="keywords" content="Kolhapuri masale, Kanda lasun masala, Masale in Kolhapur, Kolhapuri spice manufacturer, Buy Kolhapuri masala online, Authentic Kolhapuri spices" />
        <link rel="canonical" href="https://kasturimasale.in/" />
      </Head>

      {/* 1. HERO */}
      <Hero />

      {/* 2. HERO 2 (Marquee) */}
      <Hero2 />

      {/* 3. HERITAGE TEASER (SEO Top) */}
      <HeritageTeaser />

      {/* 3. WHY KASTURI IS PREMIUM (The new "Trust" Block) */}
      <section style={{ position: 'relative', zIndex: 10, background: '#F9F6F1' }}>
        <TrustComparisonSection />
        <div style={{ marginTop: 60 }}>
          <ComparisonGrid />
        </div>
        <PremiumJustificationBar />
        <GuaranteeBox />
      </section>

      {/* 4. PRODUCT SHOWCASE (Moved Up) */}
      <ProductShowcase />

      {/* 5. SOCIAL PROOF / TRUST */}
      <SocialProofStrip />

      {/* 6. BRAND STORY */}
      <BrandStory lang="en" />

      {/* 7. DETAILED SEO CONTENT (Bottom) */}
      <SEOContent />

      <style jsx>{`
        .page {
          background: #F9F6F1;
          min-height: 100vh;
        }
      `}</style>
    </main>
  )
}

