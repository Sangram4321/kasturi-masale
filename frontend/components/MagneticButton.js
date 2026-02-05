import { useRef } from 'react'
import { motion } from 'framer-motion'

export default function MagneticButton({ children, onClick, style = {} }) {
  const ref = useRef(null)

  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    const x = e.clientX - (r.left + r.width / 2)
    const y = e.clientY - (r.top + r.height / 2)
    ref.current.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`
  }

  const reset = () => {
    ref.current.style.transform = 'translate(0,0)'
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={reset}
      onClick={(e) => {
        if (onClick) onClick(e)
        import('../lib/feedback').then(({ feedback }) => feedback.trigger('cta'))
      }}
      style={{ ...styles.btn, ...style }}
      whileHover="hover"
    >
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>

      {/* Glass Shine Effect */}
      <motion.div
        variants={{
          hover: { x: ['100%', '-100%'] }
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={styles.shine}
      />
    </motion.div>
  )
}

const styles = {
  btn: {
    padding: '16px 38px',
    display: 'inline-block',
    background: 'linear-gradient(135deg, #a63821 0%, #8b2f1c 100%)', // Brighter base
    color: '#fff',
    cursor: 'pointer',
    transition: 'all .3s cubic-bezier(.22,1,.36,1)',
    textAlign: 'center',
    fontWeight: 600,
    position: 'relative',
    overflow: 'hidden',
    // Juicy Shadow + Inner Bevel
    boxShadow: '0 10px 40px rgba(166, 56, 33, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
    transform: 'skewX(-25deg) translateX(200%)', // Start off-screen
    pointerEvents: 'none'
  }
}
