import Link from 'next/link';

export default function HeritageTeaser() {
  return (
    <section className="heritage-teaser">
      <div className="container">
        <div className="royal-border">
          <div className="content-wrapper">
            <div className="text-content">
              <div className="decoration-icon">⚜️</div>
              <span className="subtitle">Authentic Kolhapuri Taste</span>
              <h2>Pounded to Perfection,<br />Preserved for You</h2>
              <div className="separator"></div>
              <p>
                For over <strong>25 years</strong>, Kasturi Masale has crafted spices that define the true taste of Kolhapur.
                Made in small batches using the traditional <strong>Kandap (pounding) method</strong>, our Kanda Lasun
                Masala retains its natural oils and fiery flavor.
              </p>
              <p className="highlight-text">
                No artificial colors. No preservatives.<br />Just pure, homemade goodness.
              </p>

              <div className="cta-wrapper">
                <Link href="/product" className="primary-btn">
                  Shop Authentic Masala
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .heritage-teaser {
          padding: 80px 24px;
          background-color: #FAF9F6; /* Warm off-white */
          position: relative;
          overflow: hidden;
        }
        
        /* Subtle texture overlay */
        .heritage-teaser::before {
            content: "";
            position: absolute;
            inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            opacity: 0.03;
            pointer-events: none;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .royal-border {
            border: 1px solid #E0A106; /* Gold Border */
            padding: 10px;
            position: relative;
        }
        
        /* Corner Accents */
        .royal-border::after {
            content: "";
            position: absolute;
            inset: 4px;
            border: 1px solid #B1121B; /* Brand Red Inner Border */
        }

        .content-wrapper {
          padding: 60px 40px;
          background: #fff;
          display: flex;
          justify-content: center;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
        }

        .text-content {
          max-width: 700px;
        }

        .decoration-icon {
            font-size: 24px;
            margin-bottom: 16px;
            color: #E0A106;
        }

        .subtitle {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: #B1121B;
          font-weight: 600;
          letter-spacing: 2px;
          margin-bottom: 16px;
          text-transform: uppercase;
        }

        h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          color: #1a1a1a;
          margin-bottom: 24px;
          line-height: 1.1;
          font-weight: 700;
        }

        .separator {
            width: 80px;
            height: 2px;
            background: #E0A106;
            margin: 0 auto 32px;
        }

        p {
          font-family: 'Inter', sans-serif;
          font-size: 1.1rem;
          color: #444;
          line-height: 1.7;
          margin-bottom: 24px;
        }
        
        .highlight-text {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.4rem;
            color: #2D2A26;
            font-style: italic;
            margin-bottom: 40px;
        }

        strong {
          color: #B1121B;
          font-weight: 600;
        }

        .primary-btn {
          display: inline-block;
          background-color: #B1121B;
          color: #fff;
          padding: 16px 48px;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          transition: all 0.3s ease;
          border: 1px solid #B1121B;
        }

        .primary-btn:hover {
          background-color: transparent;
          color: #B1121B;
        }

        @media (max-width: 768px) {
          .heritage-teaser {
            padding: 40px 16px;
          }
          .content-wrapper {
              padding: 40px 20px;
          }
          h2 {
            font-size: 2.2rem;
          }
          p {
            font-size: 1rem;
          }
          .highlight-text {
              font-size: 1.2rem;
          }
        }
      `}</style>
    </section>
  );
}
