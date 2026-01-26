import { useState } from "react"

export default function OrderTruckButton({ onAnimationCommit, isLoading, isValid, label }) {
    const [animate, setAnimate] = useState(false)

    const handleClick = () => {
        if (!isValid || isLoading || animate) return

        // 1. Start Animation
        setAnimate(true)

        // 2. Play for 10 seconds (duration of CSS animation)
        setTimeout(() => {
            // 3. Animation Done -> Trigger Confirm Flow
            setAnimate(false)
            if (onAnimationCommit) onAnimationCommit()
        }, 10000)
    }

    return (
        <button
            className={`order-truck-button ${animate ? 'animate' : ''}`}
            onClick={handleClick}
            disabled={!isValid || isLoading || animate}
            style={{ opacity: isValid ? 1 : 0.6, pointerEvents: (isValid && !animate) ? 'all' : 'none' }}
        >
            <span className="default">{animate ? "Sending..." : label}</span>
            <span className="success">
                Order Placed
                <svg viewBox="0 0 12 10">
                    <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                </svg>
            </span>
            <div className="box"></div>
            <div className="truck">
                <div className="back"></div>
                <div className="front">
                    <div className="window"></div>
                </div>
                <div className="light top"></div>
                <div className="light bottom"></div>
            </div>
            <div className="lines"></div>
        </button>
    )
}
