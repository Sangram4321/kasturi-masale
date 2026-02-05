import { useState, useEffect } from "react"
import HeaderDesktop from "./HeaderDesktop"
import HeaderMobile from "./HeaderMobile"

export default function Header(props) {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  if (!mounted) {
    // Return empty or a safe default (e.g. desktop) to prevent hydration mismatch
    // Or return logic compliant with desktop first
    return null
  }

  return isMobile ? <HeaderMobile {...props} /> : <HeaderDesktop {...props} />
}
