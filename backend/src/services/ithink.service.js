const axios = require('axios');

const BASE_URL = "https://manage.ithinklogistics.com/api_v3/order/add.json";

/**
 * Create a shipment in iThink Logistics
 * @param {Object} orderData - The order data to send (Flat object from formatOrderPayload)
 * @returns {Promise<Object>} - The API response
 */
exports.createOrder = async (orderData) => {
    try {
        // 1. Construct V3 Payload
        // V3 expects: data: { shipments: [...], access_token, secret_key }
        const payload = {
            data: {
                shipments: [orderData],
                access_token: process.env.ITHINK_ACCESS_TOKEN,
                secret_key: process.env.ITHINK_SECRET_KEY,
            }
        };

        // 2. HARD Validation
        const isValid = Array.isArray(payload.data.shipments)
            && payload.data.shipments[0].pickup_address_id;

        if (!isValid) throw new Error("INVALID PAYLOAD STRUCTURE: Missing pickup_address_id in shipment");

        // 3. Log Final Payload for Debugging
        console.log("iThink FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

        const response = await axios.post(BASE_URL, payload);

        // 4. Log Response
        console.log("iThink API RESPONSE:", JSON.stringify(response.data, null, 2));

        if (response.data && response.data.status === "success") {
            return response.data;
        } else {
            // iThink might return status: error with remarks
            throw new Error(JSON.stringify(response.data));
        }
    } catch (error) {
        console.error("iThink Logistics Create Order Error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Cancel a shipment in iThink Logistics
 * @param {String} awbNumber - The AWB Number to cancel
 * @returns {Promise<Object>} - The API response
 */
exports.cancelShipment = async (awbNumber) => {
    try {
        const payload = {
            data: {
                awb_numbers: [awbNumber],
                access_token: process.env.ITHINK_ACCESS_TOKEN,
                secret_key: process.env.ITHINK_SECRET_KEY,
            }
        };

        const response = await axios.post("https://manage.ithinklogistics.com/api_v3/order/cancel.json", payload);

        // iThink V3 returns { status: "success", ... } or { status: "error", ... }
        // Even if status is success, we should check if the specific AWB was cancelled?
        // Usually if it fails it returns status: error.

        if (response.data && response.data.status === "success") {
            return response.data;
        } else {
            // If iThink says error, we THROW so controller aborts
            throw new Error(JSON.stringify(response.data));
        }
    } catch (error) {
        console.error("iThink Logistics Cancel Error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Track a shipment in iThink Logistics
 * @param {String} awbNumber - The AWB Number to track
 * @returns {Promise<Object>} - The standardized tracking data
 */
exports.trackShipment = async (awbNumber) => {
    try {
        const payload = {
            data: {
                awb_number_list: awbNumber, // Comma separated string or single AWB
                access_token: process.env.ITHINK_ACCESS_TOKEN,
                secret_key: process.env.ITHINK_SECRET_KEY,
            }
        };

        const response = await axios.post("https://manage.ithinklogistics.com/api_v3/order/track.json", payload);

        if (response.data && response.data.status === "success" && response.data.data[awbNumber]) {
            // Standardize Response
            return response.data.data[awbNumber];
        } else {
            // Fallback or Error
            console.warn(`Tracking Info Not Found for AWB: ${awbNumber}`);
            return null;
        }
    } catch (error) {
        console.error("iThink Logistics Track Error:", error.response?.data || error.message);
        // Don't throw, just return null so UI handles "Info Unavailable" gracefully
        return null;
    }
};

/**
 * Fetch and Log Pickup Addresses (For Configuration Debugging)
 */
exports.getPickupAddresses = async () => {
    try {
        console.log("📍 iThink: Fetching Pickup Addresses...");
        const payload = {
            data: {
                access_token: process.env.ITHINK_ACCESS_TOKEN,
                secret_key: process.env.ITHINK_SECRET_KEY,
            }
        };

        // Correct Endpoint for V3: https://manage.ithinklogistics.com/api_v3/pickup-address/list.json
        const response = await axios.post("https://manage.ithinklogistics.com/api_v3/pickup-address/list.json", payload);

        console.log("RAW iThink response:", response.data);
        console.log("TYPE:", typeof response.data);

        // Return the actual list or full object
        return response.data?.data || response.data;
    } catch (error) {
        console.error("❌ iThink Pickup Address Fetch Failed:", error.response?.data || error.message);
        return { error: error.message };
    }
};

/**
 * Format Order Data for iThink Logistics Payload
 * @param {Object} order - The Order Mongoose Document
 * @returns {Object} - Formatted payload for iThink (Single Shipment Object)
 */
exports.formatOrderPayload = (order) => {
    // Helper: Format Date as DD-MM-YYYY
    const formattedDate = (() => {
        const d = order.createdAt ? new Date(order.createdAt) : new Date();
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    })();

    // Helper: Sanitize Phone
    const sanitizedPhone = String(order.customer.phone).replace(/\D/g, "").slice(-10);

    return {
        waybill: "",
        order: order.orderId,
        sub_order: "",
        order_date: formattedDate,
        total_amount: order.pricing.total,
        name: order.customer.name,
        add: order.customer.address,
        pin: order.customer.pincode,
        city: order.customer.city || "Kolhapur",
        state: order.customer.state || "Maharashtra",
        country: "India",
        phone: sanitizedPhone,
        email: order.customer.email || "",

        products: order.items.map(item => ({
            product_name: item.nameHtml || item.name || "Spice Pack",
            product_sku: item.productId || "SKU-DEFAULT",
            product_quantity: item.quantity,
            product_price: item.price,
            product_tax_rate: 0,
            product_hsn_code: "",
            product_discount: 0
        })),

        shipment_length: 10,
        shipment_width: 10,
        shipment_height: 10,
        shipment_weight: 0.5,

        cod_amount: order.paymentMethod === "COD" ? order.pricing.total : 0,
        payment_mode: order.paymentMethod === "COD" ? "COD" : "Prepaid",

        return_address_id: process.env.ITHINK_PICKUP_ADDRESS_ID,
        pickup_address_id: process.env.ITHINK_PICKUP_ADDRESS_ID
    };
};
