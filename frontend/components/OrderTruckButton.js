import { useState } from "react"

export default function OrderTruckButton({ onAnimationCommit, isLoading, isValid, label }) {
    const [animate, setAnimate] = useState(false)

    const handleClick = async () => {
        if (!isValid || isLoading || animate) return

        // 1. Start Animation
        setAnimate(true)

        // 2. Run Animation Timer (3s) AND Action in Parallel
        const minAnimationTime = new Promise(resolve => setTimeout(resolve, 3000))

        try {
            // Wait for BOTH the minimum animation time AND the actual action to finish
            await Promise.all([
                minAnimationTime,
                onAnimationCommit() // This should now be a Promise returning function
            ])
        } catch (error) {
            // If action fails, stop animation (optional, or let parent handle error)
            setAnimate(false)
            console.error("Order action failed:", error)
        }

        // Note: If success, the parent typically unmounts this component or redirects,
        // so we might not even reach here. If we do, it means we're done.
    }

    return (
        <button
            className={`order-truck-button ${animate ? 'animate' : ''}`}
            onClick={handleClick}
            disabled={!isValid || isLoading || animate}
            style={{ opacity: isValid ? 1 : 0.6, pointerEvents: (isValid && !animate) ? 'all' : 'none' }}
        >
            <span className="default">{animate ? "Processing..." : label}</span>
            <span className="success">
                {/* Success state is now handled by the parent's UI (Success Card) */}
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
