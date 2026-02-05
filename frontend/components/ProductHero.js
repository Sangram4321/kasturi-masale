import { motion } from "framer-motion"
import { useState } from "react"

const variants = [
  { label: "200g", price: 380 },
  { label: "500g", price: 720 },
  { label: "1kg", price: 1350, best: true }
]

export default function ProductHero() {
  const [selected, setSelected] = useState(variants[0])

  return (
    <section style={styles.section}>
      <div style={styles.container}>

        {/* IMAGE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={styles.imageWrap}
        >
          <img
            src="/images/products/kanda-lasun.png"
            alt="Kasturi Kanda Lasun Masala"
            style={styles.image}
          />
        </motion.div>

        {/* INFO */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.9 }}
          style={styles.info}
        >
          <h1 style={styles.title}>
            Kasturi Kolhapuri<br />Kanda Lasun Masala
          </h1>

          <p style={styles.subtitle}>
            Kolhapur chi asli chav, gharatli parampara.
          </p>

          {/* VARIANTS */}
          <div style={styles.variantRow}>
            {variants.map(v => (
              <button
                key={v.label}
                onClick={() => setSelected(v)}
                style={{
                  ...styles.variantBtn,
                  borderColor:
                    selected.label === v.label ? "#C62828" : "#ddd"
                }}
              >
                {v.label}
                {v.best && (
                  <span style={styles.best}>Best Value</span>
                )}
              </button>
            ))}
          </div>

          {/* PRICE */}
          <div style={styles.priceRow}>
            <span style={styles.price}>₹{selected.price}</span>
            <span style={styles.inclusive}>Inclusive of delivery</span>
          </div>

          {/* CTA */}
          <div style={styles.ctaRow}>
            <button
              style={styles.primaryBtn}
              onClick={() => import('../lib/feedback').then(({ feedback }) => feedback.trigger('add_to_cart'))}
            >
              Add to Cart
            </button>
            <button
              style={styles.secondaryBtn}
              onClick={() => import('../lib/feedback').then(({ feedback }) => feedback.trigger('add_to_cart'))}
            >
              Buy Now
            </button>
          </div>

          <p style={styles.whatsapp}>
            WhatsApp order available
          </p>
        </motion.div>

      </div>
    </section>
  )
}

const styles = {
  section: {
    padding: "120px 20px 80px",
    background: "#F7EFDB"
  },

  container: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 80,
    alignItems: "center"
  },

  imageWrap: {
    display: "flex",
    justifyContent: "center"
  },

  image: {
    width: "100%",
    maxWidth: 420
  },

  info: {},

  title: {
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 16
  },

  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 28
  },

  variantRow: {
    display: "flex",
    gap: 12,
    marginBottom: 24,
    flexWrap: "wrap"
  },

  variantBtn: {
    padding: "10px 16px",
    borderRadius: 12,
    border: "2px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600
  },

  best: {
    display: "block",
    fontSize: 10,
    color: "#C62828"
  },

  priceRow: {
    marginBottom: 28
  },

  price: {
    fontSize: 32,
    fontWeight: 700
  },

  inclusive: {
    display: "block",
    fontSize: 13,
    opacity: 0.6
  },

  ctaRow: {
    display: "flex",
    gap: 16,
    marginBottom: 12
  },

  primaryBtn: {
    padding: "14px 28px",
    background: "#C62828",
    color: "#fff",
    borderRadius: 14,
    border: "none",
    fontWeight: 700,
    cursor: "pointer"
  },

  secondaryBtn: {
    padding: "14px 28px",
    borderRadius: 14,
    border: "1px solid #C62828",
    background: "transparent",
    fontWeight: 700,
    cursor: "pointer"
  },

  whatsapp: {
    fontSize: 13,
    opacity: 0.7
  }
}
