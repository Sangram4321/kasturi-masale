export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false })
  }

  const { phone, total, payment } = req.body

  if (!phone) {
    return res.status(400).json({ success: false })
  }

  const message = `Kasturi Masale

Order Confirmed ✅
Amount: ₹${total}
Payment: ${payment}

Authentic Kolhapuri Masale
Support: 7737379292`

  try {
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        route: "q",
        language: "english",
        message: message,
        numbers: phone.replace("+91", "")
      })
    })

    const data = await response.json()
    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.log("SMS ERROR", error)
    return res.status(500).json({ success: false })
  }
}
