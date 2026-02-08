const axios = require('axios');

const BASE_URL = "https://manage.ithinklogistics.com/api_v3/order/add.json";

/**
 * Create a shipment in iThink Logistics
 * @param {Object} orderData - The order data to send
 * @returns {Promise<Object>} - The API response
 */
exports.createOrder = async (orderData) => {
    try {
        const payload = {
            data: {
                ...orderData,
                access_token: process.env.ITHINK_ACCESS_TOKEN,
                secret_key: process.env.ITHINK_SECRET_KEY,
            }
        };

        const response = await axios.post(BASE_URL, payload);

        if (response.data && response.data.status === "success") {
            return response.data;
        } else {
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
 * @returns {Object} - Formatted payload for iThink
 */
exports.formatOrderPayload = (order) => {
    // 1. Determine Payment Mode (COD / Prepaid)
    const paymentMode = order.paymentMethod === "COD" ? "COD" : "Prepaid";

    // 2. Format Date (YYYY-MM-DD or DD-MM-YYYY depending on API)
    // iThink V3 usually accepts YYYY-MM-DD HH:mm:ss or similar.
    let orderDate = new Date().toISOString().split('T')[0]; // Default to today
    if (order.createdAt) orderDate = new Date(order.createdAt).toISOString().split('T')[0];

    // 3. Construct Payload
    return {
        data: {
            shipment_type: "Forward", // or "Reverse"
            order_type: paymentMode,

            // Pickup / Warehouse Details (Required)
            warehouse_name: process.env.ITHINK_WAREHOUSE_NAME || "Kasturi Masale", // Must match exactly with registered name in iThink panel

            // Customer Details
            name: order.customer.name,
            company_name: "",
            email: order.customer.email || "",
            mobile: order.customer.phone,
            address: order.customer.address,
            address_2: "",
            pincode: order.customer.pincode,
            city: order.customer.city || "",
            state: order.customer.state || "",
            country: "India",

            // Order Details
            order_id: order.orderId,
            order_date: orderDate,

            total_amount: order.pricing.total, // Incorrect field? V3 uses 'cod_amount' for COD and 'order_amount' generally?
            // Checking V3 docs structure: Typically follows standard logistics payload
            cod_amount: paymentMode === "COD" ? order.pricing.total : 0,
            order_amount: order.pricing.total,

            quantity: order.items.reduce((acc, item) => acc + item.quantity, 0),

            // Product Details (Array)
            products: order.items.map(item => ({
                product_name: item.nameHtml || item.name || "Spice Pack",
                product_sku: item.productId || "SKU-DEFAULT",
                quantity: item.quantity,
                product_price: item.price,
                product_tax_rate: 0,
                product_hsn_code: ""
            })),

            // Dimensions & Weight (Per Shipment)
            // Assuming standard box for spices: 0.5kg
            total_weight: 0.5,
            length: 10,
            breadth: 10,
            height: 10,

            // Other settings
            is_return: 0,
            return_address_id: "",
        }
    };
};
