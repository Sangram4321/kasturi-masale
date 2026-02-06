import emailjs from "emailjs-com"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/router"
import { useCart } from "../context/CartContext"
import OrderTruckButton from "../components/OrderTruckButton"

/* ================= CONFIG ================= */
// API Configuration: Relative paths via Next.js Proxy
const API = process.env.NEXT_PUBLIC_API_URL || ""; // Using absolute paths from env
const COD_FEE = 40

const haptic = (pattern = 10) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

/* ================= ICONS ================= */
const NoteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
)

const UpiIcon = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#F8FAFC" />
    {/* Green "U" Shape / Arrow */}
    <path d="M25 35 V55 C25 65 35 70 50 70 C65 70 75 65 75 55 V35" stroke="#16a34a" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M40 50 L50 60 L60 50" stroke="#16a34a" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <text x="50" y="25" fontSize="14" textAnchor="middle" fill="#64748B" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1">UPI</text>
  </svg>
)

const CodIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#F0FDF4" />
    <path d="M17 9V7C17 5.89543 16.1046 5 15 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H15C16.1046 19 17 18.1046 17 17V15M17 15H19C20.1046 15 21 14.1046 21 13V11C21 9.89543 20.1046 9 19 9H17M17 15V9" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="10" cy="12" r="2" fill="#15803d" fillOpacity="0.2" stroke="#15803d" strokeWidth="1.5" />
  </svg>
)

export default function Checkout() {
  const router = useRouter()
  const { cart, clearCart, hydrated } = useCart()

  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [orderId, setOrderId] = useState(null)
  const [whatsappLink, setWhatsappLink] = useState(null)
  const [coupon, setCoupon] = useState("")
  const [showCoupon, setShowCoupon] = useState(false)

  const [customer, setCustomer] = useState({ name: "", phone: "+91", address: "", pincode: "" })
  const [hasMounted, setHasMounted] = useState(false)

  /* LOYALTY STATE */
  const [redeemCoins, setRedeemCoins] = useState(0)
  const [user, setUser] = useState(null)

  /* REFERRAL STATE */
  const [referralCode, setReferralCode] = useState("")
  const [referralDiscount, setReferralDiscount] = useState(0)
  const [referralStatus, setReferralStatus] = useState(null) // { success: boolean, message: string }

  useEffect(() => {
    setHasMounted(true)
    // Load Loyalty
    const storedCoins = localStorage.getItem('redeemCoins')
    if (storedCoins) setRedeemCoins(parseInt(storedCoins))

    const storedUser = localStorage.getItem('user')
    if (storedUser) setUser(JSON.parse(storedUser))

    // Redirect if empty - BUT WAIT FOR HYDRATION
    if (hydrated && cart.length === 0 && !confirmed) {
      router.replace("/cart")
    }
  }, [cart, confirmed, router, hydrated])

  const handleChange = e => setCustomer({ ...customer, [e.target.name]: e.target.value })

  /* CALCS */
  const baseTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const discount = Math.floor(redeemCoins * 0.8)

  const subTotalAfterDiscount = baseTotal - discount - referralDiscount
  const deliveryFee = baseTotal >= 500 ? 0 : 50
  const total = (paymentMethod === "cod" ? subTotalAfterDiscount + COD_FEE : subTotalAfterDiscount) + deliveryFee

  const isValid =
    cart.length > 0 &&
    customer.name.length > 2 &&
    customer.phone.length >= 10 &&
    customer.address.length > 5 &&
    customer.pincode.length >= 6



  /* ACTIONS */
  // 1. Called after Truck Animation Finishes
  const handleTruckAnimationComplete = () => {
    haptic(50)
    confirmOrder()
  }

  // 2. Called when User clicks "Confirm Order" in Modal
  const confirmOrder = async () => {
    // setShowConfirmation(false) // Removed
    setLoading(true)

    try {
      const payload = {
        customer,
        items: cart.map(i => ({ variant: i.variant, quantity: i.qty, price: i.price })),
        paymentMethod: paymentMethod === "cod" ? "COD" : "UPI",
        pricing: {
          subtotal: baseTotal,
          codFee: paymentMethod === "cod" ? COD_FEE : 0,
          shippingFee: deliveryFee,
          total
        },
        userId: user ? user.uid : null,
        redeemCoins: redeemCoins,
        referralCode: referralDiscount > 0 ? referralCode : null
      }

      /* 1. COD FLOW */
      if (paymentMethod === "cod") {
        const res = await fetch(`${API}/api/orders/create`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })

        const text = await res.text()
        let data
        try {
          data = JSON.parse(text)
        } catch (e) {
          console.error("JSON PARSE ERROR:", text)
          throw new Error("Server Error: " + (text.substring(0, 100) || "Unknown Error"))
        }

        if (!res.ok || !data.success) throw new Error(data?.message || "Order failed")

        handleSuccess(data)

        /* 2. ONLINE FLOW (RAZORPAY) */
      } else {
        // A. Init Payment on Backend
        const orderRes = await fetch(`${API}/api/orders/create-payment`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total }) // Amount in Rupees
        });

        const orderText = await orderRes.text();
        let orderData;
        try {
          orderData = JSON.parse(orderText);
        } catch (e) {
          throw new Error("Payment Init Failed: " + orderText.substring(0, 50));
        }

        if (!orderData.success) throw new Error("Payment initialization failed");

        // B. Open Razorpay
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Key from .env.local
          // Actually, key_id is public. Safe to be here or env.
          amount: orderData.order.amount,
          currency: "INR",
          name: "Kasturi Masale",
          description: "Authentic Kolhapuri Masale",
          image: "/images/logo.png",
          order_id: orderData.order.id, // RZP Order ID
          handler: async function (response) {
            // C. Verify & Place Order
            try {
              const verifyRes = await fetch(`${API}/api/orders/verify-payment`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderData: payload // Pass full order details to create it after payment
                })
              });

              const verifyText = await verifyRes.text();
              let verifyData;
              try {
                verifyData = JSON.parse(verifyText);
              } catch (e) {
                throw new Error("Verification Failed: " + verifyText.substring(0, 50));
              }

              if (verifyData.success) {
                handleSuccess(verifyData);
              } else {
                alert("Payment verification failed! Please contact support.");
                setLoading(false);
              }
            } catch (verErr) {
              console.error(verErr);
              alert("Payment verified but order creation failed. Contact support with Payment ID: " + response.razorpay_payment_id);
              setLoading(false);
            }
          },
          prefill: {
            name: customer.name,
            email: "", // collect email if needed
            contact: customer.phone
          },
          theme: {
            color: "#C02729"
          }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response) {
          alert(response.error.description);
          setLoading(false);
        });
        rzp1.open();
      }

    } catch (err) {
      console.error(err)
      alert(err.message || "Connection failed. Please try again.")
      setLoading(false)
    }
  }

  const handleSuccess = (data) => {
    setOrderId(data.orderId)
    setWhatsappLink(data.whatsappLink)

    // Cleanup Loyalty
    localStorage.removeItem('redeemCoins')

    // Send Email (Async)
    // ... (Email logic kept same or moved here)

    // GA4 Purchase Event
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'purchase', {
        transaction_id: data.orderId,
        value: total,
        currency: "INR",
        items: cart.map(item => ({
          item_id: item.variant,
          item_name: item.name || item.variant, // Fallback if name missing
          price: item.price,
          quantity: item.qty
        }))
      });
    }

    // Trigger Premium Success Feedback
    import('../lib/feedback').then(({ feedback }) => feedback.trigger('success'))

    clearCart()
    setConfirmed(true)
  }

  // Auto-redirects
  useEffect(() => {
    if (confirmed && whatsappLink) setTimeout(() => window.open(whatsappLink, "_blank"), 600)
    if (confirmed) setTimeout(() => router.push("/"), 4000)
  }, [confirmed, whatsappLink, router])

  if (!hasMounted) return null

  return (
    <main style={styles.page}>
      <AnimatePresence mode="wait">
        {!confirmed ? (
          <motion.div
            key="checkout-wrapper"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={styles.card}
          >
            {/* HEADER */}
            <header style={styles.header}>
              <div style={styles.headerTitleRow}>
                <div style={styles.iconBox}><NoteIcon /></div>
                <h1 style={styles.title}>Checkout</h1>
              </div>
            </header>

            <div style={styles.scrollContent}>
              {/* 1. SHIPPING FORM */}
              <section style={styles.section}>
                <h3 style={styles.sectionTitle}>1. Delivery Details</h3>
                <div style={styles.inputGrid}>
                  <Input name="name" placeholder="Full Name" value={customer.name} onChange={handleChange} autoFocus />
                  <Input name="phone" placeholder="Phone Number" type="tel" value={customer.phone} onChange={handleChange} />
                  <Input name="pincode" placeholder="Pincode" type="number" value={customer.pincode} onChange={handleChange} />
                  <textarea
                    name="address"
                    placeholder="Complete Address (House No, Street, Area)"
                    value={customer.address}
                    onChange={handleChange}
                    style={styles.textarea}
                  />
                </div>
              </section>

              {/* 2. SUMMARY & PAYMENT */}
              <section style={styles.section}>
                <h3 style={styles.sectionTitle}>2. Payment Method</h3>

                {/* TOTALS */}
                <div style={styles.receipt}>
                  <div style={styles.receiptRow}><span>Item Total</span> <b>₹{baseTotal}</b></div>
                  {discount > 0 && (
                    <div style={{ ...styles.receiptRow, color: '#166534', fontWeight: 600 }}>
                      <span>Loyalty Discount ({redeemCoins} coins)</span>
                      <span>- ₹{discount}</span>
                    </div>
                  )}

                  {referralDiscount > 0 && (
                    <div style={{ ...styles.receiptRow, color: '#166534', fontWeight: 600 }}>
                      <span>Referral Discount</span>
                      <span>- ₹{referralDiscount}</span>
                    </div>
                  )}
                  {paymentMethod === "cod" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={styles.receiptRow}>
                      <span style={{ color: "#D97706" }}>+ COD Handling</span> <b style={{ color: "#D97706" }}>₹{COD_FEE}</b>
                    </motion.div>
                  )}
                  {/* SHIPPING FEE */}
                  <div style={styles.receiptRow}>
                    <span>Delivery Charge</span>
                    <b style={{ color: deliveryFee === 0 ? '#166534' : 'inherit' }}>
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </b>
                  </div>
                  {/* SHIPPING EXPLANATION */}
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: -6, marginBottom: 8, textAlign: 'right' }}>
                    {deliveryFee > 0 ? `Shipping ₹${deliveryFee} applied (Free above ₹500)` : 'Free Shipping applied (Order above ₹500)'}
                  </div>

                  <div style={styles.divider} />
                  <div style={styles.totalRow}>
                    <span>Total Payable</span>
                    <span style={{ fontSize: 24, color: "#C02729" }}>₹{total}</span>
                  </div>
                </div>

                {/* CARDS */}
                <div style={styles.payGrid}>
                  <PaymentOption
                    selected={paymentMethod === "cod"}
                    onClick={() => setPaymentMethod("cod")}
                    icon={<CodIcon />}
                    title="Cash on Delivery"
                    desc={`Pay ₹${total} at your doorstep`}
                  />
                  <PaymentOption
                    selected={paymentMethod === "upi"}
                    onClick={() => setPaymentMethod("upi")}
                    icon={<UpiIcon />}
                    title="Pay Online / UPI"
                    desc="Save time, no cash hassle"
                  />
                </div>

                <div style={styles.divider} />

                <div style={{ marginTop: 24 }}>
                  {!showCoupon ? (
                    <button
                      onClick={() => setShowCoupon(true)}
                      style={{
                        background: 'none', border: 'none', color: '#6B7280',
                        fontSize: 13, textDecoration: 'underline', cursor: 'pointer', padding: 0
                      }}
                    >
                      Have a coupon or referral code?
                    </button>
                  ) : (
                    <div style={styles.couponBox}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>🎟️</span>
                        <input
                          type="text"
                          placeholder="Referral / Coupon Code"
                          style={styles.couponInput}
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                          disabled={referralDiscount > 0}
                        />
                      </div>
                      {referralDiscount > 0 ? (
                        <button
                          style={{ ...styles.applyBtn, background: '#166534' }}
                          onClick={() => { setReferralCode(""); setReferralDiscount(0); setReferralStatus(null); }}
                        >
                          Applied ✓
                        </button>
                      ) : (
                        <button
                          style={styles.applyBtn}
                          onClick={async () => {
                            if (referralCode.length < 3) return;
                            setReferralStatus({ loading: true, message: "Checking..." });

                            try {
                              const res = await fetch(`${API}/api/user/validate-referral`, {
                                method: "POST", headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  code: referralCode,
                                  uid: user ? user.uid : null,
                                  cartTotal: baseTotal,
                                  phone: customer.phone,
                                  address: customer.address
                                })
                              });
                              const data = await res.json();
                              if (data.success) {
                                setReferralDiscount(data.discount);
                                setReferralStatus({ success: true, message: `Referral Applied! saved ₹${data.discount}` });
                              } else {
                                setReferralStatus({ success: false, message: data.message });
                              }
                            } catch (e) {
                              setReferralStatus({ success: false, message: "Validation error" });
                            }
                          }}
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {referralStatus && (
                  <div style={{
                    fontSize: 12,
                    marginTop: 8,
                    color: referralStatus.success ? '#166534' : '#C02729',
                    padding: '0 4px',
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    {referralStatus.message}
                  </div>
                )}
              </section>
            </div>

            {/* FIXED FOOTER ACTION (TRUCK BUTTON) */}
            <div style={styles.footer}>
              <OrderTruckButton
                onAnimationCommit={handleTruckAnimationComplete}
                isLoading={loading}
                isValid={isValid}
                label={paymentMethod === "cod" ? `Place Order (Pay ₹${total} on Delivery)` : `Pay ₹${total} & Place Order`}
              />
              <div style={styles.trustBadge}>🔒 Secure Checkout</div>
            </div>



          </motion.div>
        ) : (

          /* SUCCESS SCREEN */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.successCard}
          >
            <div style={styles.confetti}>🎉</div>
            <h2 style={styles.successTitle}>Order Placed!</h2>
            <p style={{ color: "#4B5563", margin: "8px 0 24px" }}>
              Order ID: <strong>#{orderId}</strong>
            </p>

            {/* 🌟 COIN REWARD */}
            <div style={{
              background: "#FFFAEA", border: "1px dashed #FCD34D",
              borderRadius: 12, padding: "12px", marginBottom: 24,
              color: "#B45309", fontWeight: 600, fontSize: 14
            }}>
              <span style={{ fontSize: 18, marginRight: 8 }}>🪙</span>
              You earned <strong>{Math.floor(total * 0.05)} Kasturi Coins</strong>!
            </div>

            <div style={styles.whatsappBox}>
              Check WhatsApp for confirmation & tracking details.
            </div>

            <button
              onClick={() => router.push('/orders')}
              style={{
                marginTop: 24, background: 'none', border: 'none',
                color: '#4B5563', fontWeight: 600, cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              View My Orders
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

/* SUB-COMPONENTS */
const Input = (props) => (
  <input {...props} style={styles.input} />
)

const PaymentOption = ({ selected, onClick, icon, title, desc }) => (
  <motion.div
    onClick={onClick}
    animate={{
      borderColor: selected ? "#C02729" : "#E5E7EB",
      backgroundColor: selected ? "#FFF1F2" : "#FFFFFF",
      boxShadow: selected ? "0 4px 12px rgba(192, 39, 41, 0.1)" : "none"
    }}
    style={styles.payOption}
  >
    <div style={styles.radio}>{selected && <div style={styles.radioDot} />}</div>
    <div style={{ flex: 1 }}>
      <div style={styles.payHeader}>
        <span style={styles.payTitle}>{title}</span>
        {icon}
      </div>
      <div style={styles.payDesc}>{desc}</div>
    </div>
  </motion.div>
)

/* STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#F3F4F6",
    fontFamily: "'Inter', sans-serif",
    display: "flex", justifyContent: "center", alignItems: "flex-start",
    padding: "16px 12px"
  },
  card: {
    width: "100%", maxWidth: 500,
    background: "#fff", borderRadius: 24,
    boxShadow: "0 20px 60px -10px rgba(0,0,0,0.1)",
    overflow: "hidden",
    position: "relative",
    marginTop: 0, // Reduced top margin for mobile
    margin: "0 auto" // Center
  },
  header: {
    padding: "24px 24px 0",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 20
  },
  headerTitleRow: { display: "flex", alignItems: "center", gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" },
  title: { fontSize: 22, fontWeight: "800", margin: 0, color: "#111827" },
  badge: { fontSize: 11, fontWeight: "700", background: "#ECFDF5", color: "#059669", padding: "6px 10px", borderRadius: 100 },

  scrollContent: { padding: "0 24px 24px" },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 16, letterSpacing: "1px" },
  /* COUPON SECTION */
  couponBox: {
    background: "#fff",
    padding: 20,
    borderRadius: "var(--border-radius-md)",
    border: "1px dashed var(--color-brand-red)",
    marginTop: 24,
    display: "flex",
    gap: 12,
    alignItems: "center",
    backgroundColor: "var(--color-bg-cream)",
    flexWrap: "wrap" // Wrap elements on small screens
  },
  couponInput: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid rgba(0,0,0,0.1)",
    fontSize: 14,
    fontFamily: "var(--font-body)",
    outline: "none"
  },
  applyBtn: {
    padding: "12px 24px",
    background: "var(--color-text-dark)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14
  },

  // ... other styles ...
  summaryCard: {
    background: "#fff",
    padding: 32,
    borderRadius: "var(--border-radius-lg)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
    height: "fit-content"
  },

  inputGrid: { display: "flex", flexDirection: "column", gap: 12 },
  input: {
    width: "100%", padding: "16px", borderRadius: 16,
    border: "1px solid #E5E7EB", background: "#FFFFFF",
    fontSize: 15, fontWeight: "500", color: "#1F2937",
    outline: "none", transition: "border-color 0.2s"
  },
  textarea: {
    width: "100%", padding: "16px", borderRadius: 16,
    border: "1px solid #E5E7EB", background: "#FFFFFF",
    fontSize: 15, fontWeight: "500", color: "#1F2937",
    outline: "none", minHeight: 80, fontFamily: "inherit", resize: "none"
  },

  receipt: {
    padding: 20, borderRadius: 20, background: "#FAFAFA", border: "1px solid #F3F4F6",
    marginBottom: 20
  },
  receiptRow: { display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: "#4B5563" },
  divider: { height: 1, background: "#E5E7EB", margin: "12px 0" },
  totalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 16, fontWeight: "700", color: "#111827" },

  payGrid: { display: "flex", flexDirection: "column", gap: 12 },
  payOption: {
    display: "flex", alignItems: "center", gap: 16,
    padding: 16, borderRadius: 18, border: "2px solid #E5E7EB",
    cursor: "pointer", background: "#fff"
  },
  radio: { width: 20, height: 20, borderRadius: "50%", border: "2px solid #D1D5DB", display: "flex", alignItems: "center", justifyContent: "center" },
  radioDot: { width: 10, height: 10, borderRadius: "50%", background: "#C02729" },
  payHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  payTitle: { fontWeight: "700", fontSize: 15, color: "#1F2937" },
  payDesc: { fontSize: 12, color: "#6B7280" },

  footer: {
    padding: 24, borderTop: "1px solid #F3F4F6", background: "#fff",
    boxShadow: "0 -10px 40px rgba(0,0,0,0.03)",
    position: "relative", zIndex: 10
  },
  payBtn: {
    width: "100%", padding: 18, borderRadius: 16, border: "none",
    fontSize: 16, fontWeight: "700",
    display: "flex", justifyContent: "center", alignItems: "center",
    transition: "all 0.2s"
  },
  trustBadge: { textAlign: "center", fontSize: 11, color: "#9CA3AF", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },

  successCard: {
    background: "#fff", padding: 40, borderRadius: 32, textAlign: "center",
    maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.1)"
  },
  confetti: { fontSize: 40, marginBottom: 10 },
  successTitle: { fontSize: 28, fontWeight: "800", color: "#111827", margin: 0 },
  whatsappBox: { background: "#DCFCE7", color: "#166534", padding: 12, borderRadius: 12, fontSize: 13, fontWeight: "600" }
}
