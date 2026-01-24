export default function NoiseOverlay() {
    return (
        <div style={styles.overlay}>
            <svg className="noise-svg">
                <filter id="noiseFilter">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.80"
                        numOctaves="3"
                        stitchTiles="stitch"
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="0.05" /> {/* Extremely subtle 5% opacity */}
            </svg>
            <style jsx>{`
        .noise-svg {
            width: 100%;
            height: 100%;
        }
      `}</style>
        </div>
    )
}

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 50, // Above content, below Header (100) and Modal (200)
        mixBlendMode: "overlay",
        opacity: 0.4
    }
}
