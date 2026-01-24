import { Canvas } from "@react-three/fiber"
import { Environment, ContactShadows, OrbitControls } from "@react-three/drei"
import { useTruck, TRUCK_STATES } from "../context/TruckContext"
import { ThreeTruck } from "./ThreeTruck"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { motion } from "framer-motion"

export default function GlobalTruckWrapper() {
    const { truckState, cargoCount, setTruckState } = useTruck()
    const router = useRouter()
    const [windowWidth, setWindowWidth] = useState(1024)

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth)
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // 📍 3D CAMERA POSITION MAPPING
    // We move the HTML wrapper div, but for 3D parallax, we might also want to rotate the truck?
    // Let's keep the HTML wrapper for screen position, and use Canvas inside.

    const getPosition = () => {
        const isMobile = windowWidth < 768

        switch (truckState) {
            case TRUCK_STATES.IDLE:
                return { x: -300, y: "100%", scale: 1, opacity: 0 } // Hidden Left

            case TRUCK_STATES.PRODUCT_PAGE:
            case TRUCK_STATES.ITEM_LOADING:
                return {
                    x: isMobile ? 0 : 40,
                    y: isMobile ? "80vh" : "80vh",
                    scale: 1,
                    opacity: 1
                }

            case TRUCK_STATES.CART_PAGE:
                return {
                    x: isMobile ? 20 : 60,
                    y: "80vh",
                    scale: 1,
                    opacity: 1
                }

            case TRUCK_STATES.MOVING_TO_CHECKOUT:
                return { x: "120vw", y: "80vh", scale: 1, opacity: 1 }

            case TRUCK_STATES.AT_CHECKOUT:
            case TRUCK_STATES.PAYMENT_PROCESSING:
            case TRUCK_STATES.PAYMENT_SUCCESS:
                return {
                    x: isMobile ? 0 : "30vw",
                    y: "85vh",
                    scale: 1, // 3D truck is naturally larger, scale 1 is fine
                    opacity: 1
                }

            case TRUCK_STATES.OUT_FOR_DELIVERY:
                return { x: "50vw", y: "50vh", scale: 0, opacity: 0 }

            default:
                return { x: -300, y: "100%", opacity: 0 }
        }
    }

    const pos = getPosition()

    // ROUTE LISTENER
    useEffect(() => {
        if (router.pathname === '/') setTruckState(TRUCK_STATES.IDLE)
        if (router.pathname === '/product' && truckState === TRUCK_STATES.IDLE) setTruckState(TRUCK_STATES.PRODUCT_PAGE)
    }, [router.pathname])

    return (
        <motion.div
            initial={false}
            animate={pos}
            transition={{ type: "spring", stiffness: 60, damping: 15, mass: 1 }}
            style={{
                position: "fixed",
                left: 0, top: 0,
                zIndex: 9999,
                pointerEvents: "none",
                width: 300, height: 200, // Larger canvas for 3D
                marginLeft: -75, marginTop: -50 // Center offset
            }}
        >
            <Canvas shadows camera={{ position: [2, 1.5, 7], fov: 35 }} dpr={[1, 2]}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />
                <Environment preset="city" />

                {/* TRUCK GROUP: Rotated slightly for 3/4 depth, but mostly side view */}
                <group position={[0, -0.8, 0]} rotation={[0, 0.4, 0]}>
                    <ThreeTruck
                        status={
                            truckState === TRUCK_STATES.MOVING_TO_CHECKOUT ? 'departing' :
                                truckState === TRUCK_STATES.PAYMENT_PROCESSING ? 'starting' :
                                    truckState === TRUCK_STATES.OUT_FOR_DELIVERY ? 'departing' :
                                        'idle'
                        }
                        cargoCount={cargoCount}
                    />
                    <ContactShadows resolution={1024} scale={12} blur={2} opacity={0.6} far={4} color="#000000" />
                </group>
            </Canvas>
        </motion.div>
    )
}
