const emailService = require("./email.service");

/**
 * Send Critical Alerts to Admin
 */
const sendCriticalAlert = async ({ type, message, orderId, paymentId, error }) => {
    const alertMessages = {
        ORPHANED_PAYMENT: `🚨 CRITICAL: Payment captured but order not found

Payment ID: ${paymentId}

This means a customer paid but the order was not created in the database.
Possible causes:
- Frontend crashed after payment
- Network issue during order creation
- Database connection failure

ACTION REQUIRED:
1. Check Razorpay Dashboard for payment details
2. Contact customer to get order details
3. Manually create order in admin panel
4. Mark this payment as reconciled`,

        EMAIL_SEND_FAILED: `⚠️ WARNING: Admin notification email failed

Order ID: ${orderId}
Payment ID: ${paymentId}
Error: ${error}

The order was successfully created and payment captured, but the email notification failed.

ACTION REQUIRED:
1. Check order in admin panel: ${orderId}
2. Manually resend email via: POST /api/orders/admin/${orderId}/resend-email
3. Verify SMTP credentials in Railway environment variables`,

        WEBHOOK_FAILURE: `❌ ERROR: Webhook processing failed

Payment ID: ${paymentId}
Error: ${error}

The webhook received a payment event but failed to process it.

ACTION REQUIRED:
1. Check Railway logs for detailed error trace
2. Verify database connection
3. Check Razorpay Dashboard for payment status
4. Manually verify order creation`
    };

    const alertText = alertMessages[type] || message;

    try {
        // Send email alert
        await emailService.sendAlertEmail({
            subject: `[ALERT] ${type}`,
            message: alertText
        });

        console.log(`🚨 ALERT: Sent ${type} notification to admin`);
        return { success: true };
    } catch (err) {
        console.error(`❌ ALERT: Failed to send ${type} notification:`, err.message);
        // Don't throw - alert failure shouldn't break the main flow
        // At least it's logged in server console
        return { success: false, error: err.message };
    }
};

module.exports = {
    sendCriticalAlert
};
