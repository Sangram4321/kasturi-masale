const { Resend } = require('resend');

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send Admin Order Notification Email
 */
const sendAdminOrderNotification = async (order) => {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B4513; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .section { margin-bottom: 20px; }
        .section h3 { color: #8B4513; margin-bottom: 10px; }
        .info-row { margin: 5px 0; }
        .label { font-weight: bold; display: inline-block; width: 120px; }
        .items { background: white; padding: 15px; border-radius: 5px; }
        .item { padding: 10px; border-bottom: 1px solid #eee; }
        .item:last-child { border-bottom: none; }
        .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🎉 New Order Received</h2>
        </div>
        
        <div class="content">
          <div class="section">
            <div class="info-row"><span class="label">Order ID:</span> <strong>${order.orderId}</strong></div>
            <div class="info-row"><span class="label">Payment ID:</span> ${order.transactionId || 'COD'}</div>
            <div class="info-row"><span class="label">Amount Paid:</span> <strong>₹${order.pricing.total}</strong></div>
            <div class="info-row"><span class="label">Payment Method:</span> ${order.paymentMethod}</div>
            <div class="info-row"><span class="label">Order Time:</span> ${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
          </div>
          
          <div class="section">
            <h3>Customer Details</h3>
            <div class="info-row"><span class="label">Name:</span> ${order.customer.name}</div>
            <div class="info-row"><span class="label">Phone:</span> ${order.customer.phone}</div>
            <div class="info-row"><span class="label">Address:</span> ${order.customer.address}</div>
            <div class="info-row"><span class="label">City:</span> ${order.customer.city || 'N/A'}</div>
            <div class="info-row"><span class="label">State:</span> ${order.customer.state || 'N/A'}</div>
            <div class="info-row"><span class="label">Pincode:</span> ${order.customer.pincode}</div>
          </div>
          
          <div class="section">
            <h3>Order Items</h3>
            <div class="items">
              ${order.items.map(item => `
                <div class="item">
                  <strong>${item.name || item.variant}</strong><br>
                  Quantity: ${item.quantity} | Price: ₹${item.price}
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="section">
            <h3>Pricing Breakdown</h3>
            <div class="info-row"><span class="label">Subtotal:</span> ₹${order.pricing.subtotal}</div>
            ${order.pricing.codFee > 0 ? `<div class="info-row"><span class="label">COD Fee:</span> ₹${order.pricing.codFee}</div>` : ''}
            ${order.pricing.discount > 0 ? `<div class="info-row"><span class="label">Discount:</span> -₹${order.pricing.discount}</div>` : ''}
            ${order.pricing.coinsRedeemed > 0 ? `<div class="info-row"><span class="label">Coins Redeemed:</span> ${order.pricing.coinsRedeemed}</div>` : ''}
            <div class="info-row"><span class="label">Total:</span> <strong>₹${order.pricing.total}</strong></div>
          </div>
        </div>
        
        <div class="footer">
          <p>Kasturi Masale - Admin Notification System</p>
          <p>Login to admin panel to process this order</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Kasturi Masale <orders@kasturimasale.in>',
      to: process.env.ADMIN_EMAIL,
      subject: `🛒 New Order: ${order.orderId} - ₹${order.pricing.total}`,
      html: emailHtml
    });

    if (error) {
      throw new Error(error.message || 'Resend API error');
    }

    console.log(`✅ EMAIL: Admin notification sent for order ${order.orderId} (Resend ID: ${data.id})`);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error(`❌ EMAIL: Failed to send admin notification for order ${order.orderId}:`, error.message);
    throw error;
  }
};

/**
 * Send Critical Alert Email
 */
const sendAlertEmail = async ({ subject, message }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Kasturi Alerts <alerts@kasturimasale.in>',
      to: process.env.ADMIN_EMAIL,
      subject: `[Kasturi Masale] ${subject}`,
      html: `<pre style="font-family: monospace; background: #f5f5f5; padding: 15px; border-left: 4px solid #ff6b6b;">${message}</pre>`
    });

    if (error) {
      throw new Error(error.message || 'Resend API error');
    }

    console.log(`🚨 ALERT EMAIL: Sent - ${subject} (Resend ID: ${data.id})`);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error(`❌ ALERT EMAIL: Failed to send - ${subject}:`, error.message);
    throw error;
  }
};

/**
 * Verify Resend API Connection
 */
const verifyConnection = async () => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND: API key not configured");
      return false;
    }
    console.log("✅ RESEND: API key configured");
    return true;
  } catch (error) {
    console.error("❌ RESEND: Configuration check failed:", error.message);
    return false;
  }
};

module.exports = {
  sendAdminOrderNotification,
  sendAlertEmail,
  verifyConnection
};
