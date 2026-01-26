/**
 * 🔊 KASTURI SONIC BRANDING
 * Procedural Audio Generation using Web Audio API
 * No external assets required.
 */

let audioCtx = null

const initAudio = () => {
    if (typeof window !== "undefined" && !audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (AudioContext) {
            audioCtx = new AudioContext()
        }
    }
}

/**
 * Play a subtle "Pop" / "Tick" sound for UI interactions
 * Usage: onClick or onMouseEnter (debounced)
 */
export const playHoverSound = () => {
    try {
        initAudio()
        if (!audioCtx) return

        // Create oscillator
        const osc = audioCtx.createOscillator()
        const gainNode = audioCtx.createGain()

        osc.connect(gainNode)
        gainNode.connect(audioCtx.destination)

        // Config: Very short, high frequency "tick"
        osc.type = "sine"
        osc.frequency.setValueAtTime(800, audioCtx.currentTime) // Start Hz
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05) // Pitch shift up

        // Envelope: Short attack, short decay
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.02, audioCtx.currentTime + 0.01) // Very quiet (2%)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05)

        osc.start()
        osc.stop(audioCtx.currentTime + 0.05)
    } catch (e) {
        // Silent fail
    }
}

/**
 * Play a satisfying "Click" / "Thud" for primary actions
 */
export const playClickSound = () => {
    try {
        initAudio()
        if (!audioCtx) return

        const osc = audioCtx.createOscillator()
        const gainNode = audioCtx.createGain()

        osc.connect(gainNode)
        gainNode.connect(audioCtx.destination)

        // Config: Lower frequency "thud"
        osc.type = "triangle"
        osc.frequency.setValueAtTime(150, audioCtx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1) // Pitch drop

        // Envelope
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01) // 10% volume
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15)

        osc.start()
        osc.stop(audioCtx.currentTime + 0.15)
    } catch (e) {
        // Silent fail
    }
}
