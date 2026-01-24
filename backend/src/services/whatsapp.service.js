/* ================= WHATSAPP MESSAGE BUILDER ================= */

const STATUS_MESSAGES = {
  PACKED: ({ orderId }) => `
📦 Your order *${orderId}* has been PACKED.

We are preparing it for dispatch.
You will be notified once it is shipped.

– Kasturi Masale, Kolhapur
`,

  SHIPPED: ({ orderId }) => `
🚚 Your order *${orderId}* has been SHIPPED.

It will reach you in 3–5 days.
Thank you for choosing Kasturi Masale!

– Kasturi Masale, Kolhapur
`,

  DELIVERED: ({ orderId }) => `
✅ Your order *${orderId}* has been DELIVERED.

We hope you enjoy the authentic Kolhapuri taste!
Do share your feedback 🙏

– Kasturi Masale, Kolhapur
`,

  CANCELLED: ({ orderId }) => `
❌ Your order *${orderId}* has been CANCELLED.

If this was a mistake or you need help,
please contact us on WhatsApp.

– Kasturi Masale, Kolhapur
`
};

/* ================= LINK BUILDER ================= */
exports.buildStatusWhatsAppLink = ({ phone, orderId, status }) => {
  if (!phone || !STATUS_MESSAGES[status]) return null;

  let cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.length === 10) {
    cleanPhone = "91" + cleanPhone;
  }

  if (cleanPhone.length !== 12 || !cleanPhone.startsWith("91")) {
    console.error("Invalid phone for WhatsApp:", phone);
    return null;
  }

  const message = STATUS_MESSAGES[status]({ orderId }).trim();

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

/* ================= ORDER PLACED (UNCHANGED) ================= */
exports.buildOrderPlacedLink = ({ phone, orderId, amount, payment }) => {
  if (!phone) return null;

  let cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.length === 10) {
    cleanPhone = "91" + cleanPhone;
  }

  if (cleanPhone.length !== 12 || !cleanPhone.startsWith("91")) {
    console.error("Invalid phone for WhatsApp:", phone);
    return null;
  }

  const message = `
🙏 Thank you for your order at Kasturi Masale!

Order ID: ${orderId}
Amount: ₹${amount}
Payment: ${payment}

We will update you once your order is processed.

– Kasturi Masale, Kolhapur
`.trim();

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
