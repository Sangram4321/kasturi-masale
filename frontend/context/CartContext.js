import { createContext, useContext, useEffect, useState } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("kasturi_cart")
    if (saved) setCart(JSON.parse(saved))
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("kasturi_cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (variant, price) => {
    setCart(prev => {
      const found = prev.find(i => i.variant === variant)
      if (found) {
        return prev.map(i =>
          i.variant === variant ? { ...i, qty: i.qty + 1 } : i
        )
      }
      return [...prev, { variant, price, qty: 1 }]
    })
  }

  const updateQty = (variant, qty) => {
    if (qty < 1) return
    setCart(prev =>
      prev.map(i => (i.variant === variant ? { ...i, qty } : i))
    )
  }

  const removeItem = variant => {
    setCart(prev => prev.filter(i => i.variant !== variant))
  }

  const clearCart = () => setCart([])

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQty, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
