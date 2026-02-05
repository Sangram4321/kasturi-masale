import { motion } from "framer-motion"

const variants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.99
    },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 1, 0.5, 1], // Cubic bezier for "premium" feel (Quart/Quint out)
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        // scale: 1.01, // Subtle zoom out on exit? Maybe keep it simple
        transition: {
            duration: 0.3,
            ease: "easeIn",
        }
    }
}

const PageTransition = ({ children, ...props }) => {
    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate="enter"
            exit="exit"
            {...props}
            style={{ width: '100%', flex: 1 }} // Ensure full width/flex
        >
            {children}
        </motion.div>
    )
}

export default PageTransition
