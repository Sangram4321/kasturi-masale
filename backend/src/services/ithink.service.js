const axios = require('axios');

const BASE_URL = "https://manage.ithinklogistics.com/api_v3/order/add.json";

/**
 * Create a shipment in iThink Logistics
 * @param {Object} orderData - The order data to send (Flat object from formatOrderPayload)
 * @returns {Promise<Object>} - The API response
 */
exports.createOrder = async (orderData) => {
    try {
        // 1. Validate Mandatory Config
        if (!process.env.ITHINK_PICKUP_ADDRESS_ID) {
            throw new Error("Missing Mandatory Env Var: ITHINK_PICKUP_ADDRESS_ID");
        }

        // 2. Construct V3 Payload
        // V3 expects: data: { shipments: [...], access_token, secret_key }
        const payload = {
            data: {
                shipments: [orderData],
                access_token: process.env.ITHINK_ACCESS_TOKEN,
                secret_key: process.env.ITHINK_SECRET_KEY,
            }
        };

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
 * Format Order Data for iThink Logistics Payload
 * @param {Object} order - The Order Mongoose Document
 * @returns {Object} - Formatted payload for iThink (Single Shipment Object)
 */
exports.formatOrderPayload = (order) => {
    // 1. Determine Payment Mode (COD / Prepaid)
    const paymentMode = order.paymentMethod === "COD" ? "COD" : "Prepaid";

    // 2. Format Date (YYYY-MM-DD or DD-MM-YYYY depending on API)
    // iThink V3 usually accepts YYYY-MM-DD HH:mm:ss or similar.
    let orderDate = new Date().toISOString().split('T')[0]; // Default to today
    if (order.createdAt) orderDate = new Date(order.createdAt).toISOString().split('T')[0];

    // 3. Construct Payload (Flat Object for 'shipments' array)
    return {
        // API V3 Spec Mappings
        waybill: "", // Leave empty for auto-generation
        order: order.orderId,
        sub_order: "",
        order_date: orderDate,
        total_amount: order.pricing.total,
        name: order.customer.name,
        company_name: "",
        add: order.customer.address,
        add2: "",
        add3: "",
        pin: order.customer.pincode,
        city: order.customer.city || "",
        state: order.customer.state || "",
        country: "India",
        phone: order.customer.phone,
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

        // Dimensions & Weight (Per Shipment)
        // Assuming standard box for spices: 0.5kg
        shipment_length: 10,
        shipment_width: 10,
        shipment_height: 10,
        shipment_weight: 0.5,

        cod_amount: paymentMode === "COD" ? order.pricing.total : 0,
        payment_mode: paymentMode,

        return_address_id: process.env.ITHINK_PICKUP_ADDRESS_ID, // Return to same as pickup usually
        pickup_address_id: process.env.ITHINK_PICKUP_ADDRESS_ID, // MANDATORY
    };
};
