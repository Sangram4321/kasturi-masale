import Hero from "../components/Hero"
// import BenefitBadges from "../components/BenefitBadges" // Replaced by Premium Section
import TrustComparisonSection from '../components/TrustComparisonSection'
import ComparisonGrid from '../components/ComparisonGrid'
import PremiumJustificationBar from '../components/PremiumJustificationBar'
import GuaranteeBox from '../components/GuaranteeBox'
import dynamic from 'next/dynamic'

const ProductShowcase = dynamic(() => import('../components/ProductShowcase'), { ssr: false })
import BrandStory from "../components/BrandStory"
import SocialProofStrip from "../components/SocialProofStrip"
// Footer is imported in _app.js

/* 
  HOMEPAGE COMPOSITION
  Constraint: Max 5 Sections (Hero + Benefits + Product + Trust + Story)
*/

export default function Home({ lang = "en" }) {
  return (
    <main className="page">

      {/* 1. HERO */}
      <Hero />

      {/* 2. WHY KASTURI IS PREMIUM (The new "Trust" Block) */}
      <section style={{ position: 'relative', zIndex: 10, background: '#F9F6F1' }}>
        <TrustComparisonSection />
        <div style={{ marginTop: 60 }}>
          <ComparisonGrid />
        </div>
        <PremiumJustificationBar />
        <GuaranteeBox />
      </section>

      {/* 2. BENEFITS (Moved/Hidden) */}
      {/* <BenefitBadges /> */}

      {/* 3. PRODUCT SHOWCASE (Moved Up) */}
      <ProductShowcase />

      {/* 4. SOCIAL PROOF / TRUST */}
      <SocialProofStrip />

      {/* 5. BRAND STORY (Moved Down) */}
      <BrandStory lang="en" />

      <style jsx>{`
        .page {
          background: #F9F6F1;
          min-height: 100vh;
        }
      `}</style>
    </main>
  )
}

