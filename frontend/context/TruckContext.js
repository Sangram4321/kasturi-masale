import { createContext, useContext, useState } from "react"

const TruckContext = createContext()

export const TRUCK_STATES = {
    IDLE: 'IDLE', // Hidden or waiting off-screen
    PRODUCT_PAGE: 'PRODUCT_PAGE', // Parked on Product Page
    ITEM_LOADING: 'ITEM_LOADING', // Loading animation
    CART_PAGE: 'CART_PAGE', // Parked on Cart
    MOVING_TO_CHECKOUT: 'MOVING_TO_CHECKOUT', // Driving off
    AT_CHECKOUT: 'AT_CHECKOUT', // Parked at Checkout
    PAYMENT_PROCESSING: 'PAYMENT_PROCESSING',
    PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY'
}

export const TruckProvider = ({ children }) => {
    const [truckState, setTruckState] = useState(TRUCK_STATES.IDLE)
    const [cargoCount, setCargoCount] = useState(0)

    // Helper to trigger specific animations
    const triggerLoading = () => {
        setTruckState(TRUCK_STATES.ITEM_LOADING)
        setTimeout(() => {
            setCargoCount(prev => prev + 1)
            setTimeout(() => setTruckState(TRUCK_STATES.PRODUCT_PAGE), 1000)
        }, 500)
    }

    return (
        <TruckContext.Provider value={{ truckState, setTruckState, cargoCount, setCargoCount, triggerLoading, TRUCK_STATES }}>
            {children}
        </TruckContext.Provider>
    )
}

export const useTruck = () => useContext(TruckContext)
