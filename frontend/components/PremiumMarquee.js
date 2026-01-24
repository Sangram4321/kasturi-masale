import React from "react"

export default function PremiumMarquee() {
  const text = "AUTHENTIC KOLHAPURI  ◆  CAREFULLY ROASTED & FRESHLY GROUND  ◆  NO PRESERVATIVES  ◆  SMALL BATCH  ◆  "

  // Duplicate content to ensure seamless loop
  const content = Array(4).fill(text)

  return (
    <section className="marquee-section">
      <div className="track">
        {content.map((item, i) => (
          <span key={i} className="marquee-text">
            {item}
          </span>
        ))}
      </div>

      <style jsx>{`
        .marquee-section {
          width: 100%;
          padding: 36px 0;
          background: #FDFBF7;
          overflow: hidden;
          border-top: 1px solid rgba(0,0,0,0.03);
          border-bottom: 1px solid rgba(0,0,0,0.03);
          white-space: nowrap;
          position: relative;
          display: flex;
          align-items: center;
        }

        .track {
          display: flex;
          align-items: center;
          /* Slower, ultra-smooth linear scroll */
          animation: luxuryScroll 80s linear infinite;
        }

        /* PAUSE ON HOVER */
        .marquee-section:hover .track {
          animation-play-state: paused;
        }

        .marquee-text {
          font-family: "Playfair Display", serif;
          font-size: clamp(0.9rem, 2vw, 1.3rem); /* Refined size */
          font-weight: 400;
          color: rgba(44, 24, 16, 0.22); /* Ideally subtle */
          margin-right: 0; 
          padding-right: 0;
          display: inline-block;
          text-transform: uppercase;
          letter-spacing: 0.2em; /* Wider limit tracking for luxury */
          flex-shrink: 0;
        }

        @keyframes luxuryScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%); 
          }
        }

        @media (max-width: 768px) {
          .marquee-section {
            padding: 24px 0;
          }
          .marquee-text {
            font-size: 0.75rem; /* Smaller, elegant mobile type */
            letter-spacing: 0.15em;
          }
          .track {
            animation-duration: 50s; 
          }
        }
      `}</style>
    </section>
  )
}
