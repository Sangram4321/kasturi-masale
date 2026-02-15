import Link from 'next/link';
import { useState } from 'react';
import { ShieldCheck, Sun, Truck, Award, ChefHat, Leaf } from 'lucide-react';

export default function SEOContent() {
  const [isExpanded, setIsExpanded] = useState(true); // Default expanded for improved UX/SEO

  const features = [
    {
      icon: <ChefHat size={32} color="#B1121B" />,
      title: "Traditional Kandap Method",
      text: "We use the age-old pounding method (Kandap) instead of high-speed grinders. This low-heat process preserves the essential oils and authentic aroma."
    },
    {
      icon: <Sun size={32} color="#E0A106" />,
      title: "Sun-Dried to Perfection",
      text: "No industrial dryers. We naturally sun-dry our chillies and spices to retain their vibrant color and nutritional value."
    },
    {
      icon: <ShieldCheck size={32} color="#B1121B" />,
      title: "Zero Compromise",
      text: "No artificial colors, no preservatives, and absolutely no fillers. Just 100% pure spice blends loved by families for decades."
    },
    {
      icon: <Leaf size={32} color="#2E7D32" />,
      title: "Premium Ingredients",
      text: "A blend of 25+ whole spices including Dagad Phool, Nagkesar, and Teppal, sourced directly from trusted farmers."
    }
  ];

  return (
    <section className="seo-content-section">
      <div className="pattern-overlay"></div>
      <div className="container">
        <div className="header">
          <span className="subtitle">The Kasturi Promise</span>
          <h2>Why We Are Maharashtra's Choice</h2>
          <div className="separator"></div>
          <p className="intro">
            For decades, the unparalleled taste of Kolhapur has been a secret shared between families.
            As a premier <strong>Kolhapuri spice brand</strong>, we have taken a vow to keep this secret pure.
          </p>
        </div>

        <div className="grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="icon-wrapper">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>

        <div className="buying-guide-box">
          <div className="box-content">
            <h3>Authentic Taste, Delivered to Your Doorstep</h3>
            <p>
              Whether you are in Pune, Mumbai, or anywhere in India, you don't have to settle for mass-produced masala.
              <strong> Buy Authentic Kolhapuri Masala Online</strong> directly from our production unit.
            </p>
            <div className="links-row">
              <Link href="/product" legacyBehavior><a className="text-link">Shop Now</a></Link>
              <span className="dot">•</span>
              <Link href="/about" legacyBehavior><a className="text-link">Our Story</a></Link>
              <span className="dot">•</span>
              <Link href="/wholesale" legacyBehavior><a className="text-link">Bulk Orders</a></Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .seo-content-section {
          padding: 80px 24px;
          background-color: #fff;
          position: relative;
          color: #333;
          border-top: 1px solid #f0f0f0;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .header {
          text-align: center;
          margin-bottom: 60px;
        }

        .subtitle {
            font-family: 'Inter', sans-serif;
            font-size: 0.85rem;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 600;
            display: block;
            margin-bottom: 12px;
        }

        h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.8rem;
          color: #1a1a1a;
          margin-bottom: 20px;
          line-height: 1.1;
        }

        .separator {
            width: 60px;
            height: 2px;
            background: #B1121B;
            margin: 0 auto 24px;
        }

        .intro {
          font-family: 'Inter', sans-serif;
          font-size: 1.1rem;
          color: #555;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
          margin-bottom: 60px;
        }

        .feature-card {
            background: #F9F6F1;
            padding: 32px;
            border-radius: 12px;
            border: 1px solid #eee;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.05);
            border-color: #E0A106;
            border: 1px solid #E0A106;
        }

        .icon-wrapper {
            background: #fff;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #2D2A26;
          margin-bottom: 12px;
        }

        p {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          line-height: 1.6;
          color: #666;
          margin: 0;
        }

        .buying-guide-box {
            background: linear-gradient(135deg, #2D2A26, #453F39);
            color: #fff;
            padding: 40px;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .buying-guide-box h3 {
            color: #fff;
            font-size: 1.8rem;
            margin-bottom: 16px;
            font-family: 'Cormorant Garamond', serif;
        }

        .buying-guide-box p {
            color: #ccc;
            font-size: 1.05rem;
            max-width: 600px;
            margin: 0 auto 24px;
            font-family: 'Inter', sans-serif;
        }

        .buying-guide-box strong {
            color: #E0A106;
        }

        .links-row {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .text-link {
            color: #fff;
            text-decoration: none;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            font-size: 0.95rem;
            border-bottom: 1px solid rgba(255,255,255,0.3);
            transition: all 0.2s;
            cursor: pointer;
        }

        .text-link:hover {
            color: #E0A106;
            border-bottom-color: #E0A106;
        }

        .dot {
            color: #666;
        }

        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .seo-content-section {
            padding: 50px 20px;
          }
          h2 {
            font-size: 2.2rem;
          }
          .buying-guide-box {
              padding: 30px 20px;
          }
        }
      `}</style>
    </section>
  );
}
