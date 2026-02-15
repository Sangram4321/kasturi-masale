import Link from 'next/link';

export default function HeritageTeaser() {
  return (
    <section className="heritage-teaser">
      <div className="container">
        <div className="content-wrapper">
          <div className="text-content">
            <span className="subtitle">Authentic Kolhapuri Taste</span>
            <h2>Pounded to Perfection, Preserved for You</h2>
            <p>
              For over <strong>25 years</strong>, Kasturi Masale has crafted spices that define the true taste of Kolhapur.
              Made in small batches using the traditional <strong>Kandap (pounding) method</strong>, our Kanda Lasun Masala retains its natural oils and fiery flavor.
              Each packet blends <strong>25+ spices</strong> and <strong>premium sun-dried chillies</strong>—no artificial colors, no preservatives. Just pure, homemade goodness loved by <strong>thousands of families across Maharashtra</strong>.
            </p>
            <div className="cta-wrapper">
              <Link href="/product" className="primary-btn">
                Shop Authentic Kolhapuri Masale
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .heritage-teaser {
          padding: 60px 20px;
          background-color: #fff;
          border-bottom: 1px solid #e5e5e5;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .content-wrapper {
          display: flex;
          justify-content: center;
          text-align: center;
        }
        .text-content {
          max-width: 800px;
        }
        .subtitle {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem;
          color: #d32f2f; /* Brand Red */
          font-weight: 600;
          letter-spacing: 1px;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          color: #1a1a1a;
          margin-bottom: 20px;
          line-height: 1.2;
        }
        p {
          font-family: 'Inter', sans-serif;
          font-size: 1.1rem;
          color: #4a4a4a;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        strong {
          color: #000;
          font-weight: 600;
        }
        .primary-btn {
          display: inline-block;
          background-color: #d32f2f;
          color: #fff;
          padding: 12px 30px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          border-radius: 4px;
          text-decoration: none;
          transition: background-color 0.3s ease;
        }
        .primary-btn:hover {
          background-color: #b71c1c;
        }

        @media (max-width: 768px) {
          .heritage-teaser {
            padding: 40px 20px;
          }
          h2 {
            font-size: 2rem;
          }
          p {
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
}
