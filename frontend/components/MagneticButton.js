import { useRef } from 'react'

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
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={reset}
      onClick={onClick}
      style={{ ...styles.btn, ...style }}
    >
      {children}
    </div>
  )
}

const styles = {
  btn: {
    padding: '14px 34px',
    borderRadius: 999,
    display: 'inline-block', // Behavior like a button
    background: '#8b2f1c',
    color: '#fff',
    cursor: 'pointer',
    transition: 'transform .25s cubic-bezier(.22,1,.36,1)',
    textAlign: 'center',
    fontWeight: 600
  }
}
