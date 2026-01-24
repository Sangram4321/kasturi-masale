// MOTION GUIDELINES:
// - Duration: 0.2s - 0.3s
// - Ease: easeOut (No bounce/elastic)
// - Distance: 4-8px slide
// - Scale: 0.96 -> 1.0 (Modals)

export const PAGE_VARIANTS = {
    initial: { opacity: 0, y: 4 }, // Very subtle slide up
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: {
        opacity: 0,
        y: -4,
        transition: { duration: 0.2, ease: "easeIn" }
    }
};

export const FADE_IN_UP = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: "easeOut" }
    }
};

export const STAGGER_CONTAINER = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
};

export const MODAL_VARIANTS = {
    initial: { opacity: 0, scale: 0.96 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: {
        opacity: 0,
        scale: 0.96,
        transition: { duration: 0.15, ease: "easeIn" }
    }
};

export const OVERLAY_VARIANTS = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
};
