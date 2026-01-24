import React, { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { RoundedBox, Cylinder } from "@react-three/drei"
import * as THREE from "three"

// 🎨 BRAND COLORS
const RED = "#C02729"
const DARK_RED = "#991B1B"
const WHITE = "#FFFFFF"
const RUBBER = "#1F2937"
const METAL = "#E5E7EB"
const GOLD = "#D4AF37"
const GLASS = "#60A5FA"

export function ThreeTruck({ status, rotation, ...props }) {
    const group = useRef()
    const wheelsRef = useRef([])

    // ANIMATION LOOP
    useFrame((state, delta) => {
        if (!group.current) return

        const t = state.clock.getElapsedTime()
        const isMoving = status === 'departing' || status === 'go' || status === 'moving_to_checkout'

        // ⚙️ Wheel Rotation
        if (isMoving) {
            wheelsRef.current.forEach(w => {
                if (w) w.rotation.x -= 8 * delta // Slower, heavier roll
            })

            // 🏎️ Driving Physics (Bobbing)
            group.current.position.y = Math.sin(t * 15) * 0.02 + 0.1

        } else {
            // 🌿 Idle Atmosphere (Suspension breathing)
            // Heavier, slower sway
            group.current.position.y = Math.sin(t * 1.5) * 0.03 + 0.1
            group.current.rotation.z = Math.sin(t * 1) * 0.01 // Very subtle roll
            group.current.rotation.x = Math.cos(t * 1.2) * 0.005 // Subtle pitch
        }

        // 🔥 Revving Shake
        if (status === 'starting') {
            const shake = Math.sin(t * 50) * 0.02
            group.current.position.y = 0.1 + shake
            group.current.rotation.z = shake * 0.5
        }
    })

    return (
        <group ref={group} {...props} dispose={null}>

            {/* ================= CHASSIS ================= */}
            <group position={[0, 0.6, 0]}>
                {/* Main Frame (Hidden under) */}
                <RoundedBox args={[4.5, 0.2, 1.8]} radius={0.05} position={[0, -0.4, 0]}>
                    <meshStandardMaterial color="#2d2d2d" metalness={0.8} roughness={0.6} />
                </RoundedBox>

                {/* 📦 CARGO BOX (Rear) */}
                <RoundedBox args={[2.8, 2.2, 1.9]} radius={0.05} position={[-0.8, 0.8, 0]}>
                    <meshStandardMaterial color={WHITE} metalness={0.2} roughness={0.2} envMapIntensity={1.5} />
                </RoundedBox>
                {/* Red Stripe on Box */}
                <RoundedBox args={[2.85, 0.2, 1.95]} radius={0.05} position={[-0.8, 0.2, 0]}>
                    <meshStandardMaterial color={RED} metalness={0.5} roughness={0.4} />
                </RoundedBox>

                {/* 🚛 CABIN (Front) */}
                <group position={[1.4, 0.1, 0]}>
                    {/* Main Cab */}
                    <RoundedBox args={[1.4, 1.6, 1.8]} radius={0.15} position={[0, 0.6, 0]}>
                        {/* Car Paint Shader Effect */}
                        <meshPhysicalMaterial
                            color={RED}
                            metalness={0.6}
                            roughness={0.2}
                            clearcoat={1}
                            clearcoatRoughness={0.1}
                            envMapIntensity={2}
                        />
                    </RoundedBox>
                    {/* Windshield */}
                    <RoundedBox args={[0.05, 0.8, 1.6]} radius={0.02} position={[0.72, 0.8, 0]}>
                        <meshPhysicalMaterial
                            color="#skyblue"
                            metalness={0.9}
                            roughness={0}
                            transmission={0.2}
                            transparent
                            opacity={0.8}
                        />
                    </RoundedBox>

                    {/* Bumper */}
                    <RoundedBox args={[0.4, 0.5, 1.9]} radius={0.1} position={[0.6, -0.4, 0]}>
                        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.8} />
                    </RoundedBox>

                    {/* Headlights */}
                    <group position={[0.75, -0.2, 0.6]}>
                        <Cylinder args={[0.15, 0.15, 0.1, 32]} rotation={[0, 0, Math.PI / 2]}>
                            <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={5} toneMapped={false} />
                        </Cylinder>
                    </group>
                    <group position={[0.75, -0.2, -0.6]}>
                        <Cylinder args={[0.15, 0.15, 0.1, 32]} rotation={[0, 0, Math.PI / 2]}>
                            <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={5} toneMapped={false} />
                        </Cylinder>
                    </group>
                </group>
            </group>

            {/* ================= WHEELS ================= */}
            {/* Front Left */}
            <Wheel ref={el => wheelsRef.current[0] = el} position={[1.4, 0.4, 0.9]} />
            {/* Front Right */}
            <Wheel ref={el => wheelsRef.current[1] = el} position={[1.4, 0.4, -0.9]} />
            {/* Rear Left */}
            <Wheel ref={el => wheelsRef.current[2] = el} position={[-1.2, 0.4, 0.9]} />
            {/* Rear Right */}
            <Wheel ref={el => wheelsRef.current[3] = el} position={[-1.2, 0.4, -0.9]} />

        </group>
    )
}

// 🛞 WHEEL COMPONENT
const Wheel = React.forwardRef(({ position, ...props }, ref) => {
    return (
        <group ref={ref} position={position} {...props}>
            <Cylinder args={[0.4, 0.4, 0.35, 32]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </Cylinder>
            {/* Hubcap */}
            <Cylinder args={[0.2, 0.2, 0.36, 16]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color="#eee" metalness={0.9} roughness={0.1} />
            </Cylinder>
            {/* Lug Nuts Detail (Simple) */}
            <Cylinder args={[0.25, 0.25, 0.38, 5]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color="#666" metalness={0.5} roughness={0.5} />
            </Cylinder>
        </group>
    )
})
