import { useEffect } from 'react'

export default function Toast({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, 2200)
      return () => clearTimeout(t)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div style={styles.toast}>
      {message}
    </div>
  )
}

const styles = {
  toast: {
    position: 'fixed',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#111',
    color: '#fff',
    padding: '12px 18px',
    borderRadius: 999,
    boxShadow: '0 20px 40px rgba(0,0,0,.35)',
    animation: 'toastIn .35s cubic-bezier(.22,1,.36,1)'
  }
}
