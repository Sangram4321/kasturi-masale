const axios = require('axios');

const BASE_URL = "https://manage.ithinklogistics.com/api_v3/order/add.json";

/**
 * Create a shipment in iThink Logistics
 * @param {Object} order - The order data to send (Flat object from formatOrderPayload)
 * @returns {Promise<Object>} - The API response
 */
exports.createOrder = async (order) => {
    try {
        // ---------------------------------------------------------
        // 1. Validation & sanitization (Step 1 & 2)
        // ---------------------------------------------------------
        let cleanOrder;
        try {
            const raw = order.toObject ? order.toObject() : order;

            // Strict Object Builder - No dynamic merging
            cleanOrder = {
                customer: raw.customer,
                pricing: raw.pricing,
                shipping: raw.shipping,
                items: raw.items,
                status: raw.status,
                paymentMethod: raw.paymentMethod,
                orderId: raw.orderId,
                createdAt: raw.createdAt,
                // Include other necessary top-level fields if needed
                _id: raw._id
            };

            // Validation Step: Check for Circular Refs or Invalid JSON
            JSON.stringify(cleanOrder);
            console.log("✅ ORDER JSON VALID");
        } catch (err) {
            console.error("❌ INVALID ORDER JSON:", err);
            throw new Error("Order object processing failed: " + err.message);
        }

        console.log("DEBUG CLEAN ORDER:", JSON.stringify(cleanOrder, null, 2));

        // 2. Prepare Single Shipment Object
        // Using strict literal construction to avoid polluted objects
        const shipmentData = exports.formatOrderPayload(cleanOrder);

        // 2. Construct V3 Payload
        // V3 expects: data: { shipments: [...], access_token, secret_key }
        const payload = {
            data: {
                shipments: [shipmentData],
                access_token: process.env.ITHINK_ACCESS_TOKEN,
                secret_key: process.env.ITHINK_SECRET_KEY,
            }
        };

        // 3. Validation
        if (!process.env.ITHINK_PICKUP_ADDRESS_ID) {
            throw new Error("Missing Env Var: ITHINK_PICKUP_ADDRESS_ID");
        }

        // 4. Log Final Payload for Debugging
        console.log("iThink FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

        const response = await axios.post(BASE_URL, payload);

        // 5. Log Response
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
    // ---------------------------------------------------------
    // 1. Helper for Clean Extraction
    // ---------------------------------------------------------
    const get = (paths, fallback = "") => {
        for (const path of paths) {
            const keys = path.split('.');
            let val = order;
            for (const key of keys) {
                val = val?.[key];
            }
            if (val !== undefined && val !== null && val !== "") return val;
        }
        return fallback;
    };

    // ---------------------------------------------------------
    // 2. Extract & Sanitize Customer Data
    // ---------------------------------------------------------
    const rawPhone = get(['customer.phone', 'shippingAddress.phone', 'phone', 'user.phone'], "");
    const phone = String(rawPhone).replace(/\D/g, "").slice(-10); // Last 10 digits only

    const name = get(['customer.name', 'shippingAddress.name', 'name'], "Valued Customer");
    const address = get(['customer.address', 'shippingAddress.address', 'address'], "Address Not Provided");
    const pincode = get(['customer.pincode', 'shippingAddress.pincode', 'pincode'], "416001"); // Default Kolhapur
    const city = get(['customer.city', 'shippingAddress.city', 'city'], "Kolhapur");
    const state = get(['customer.state', 'shippingAddress.state', 'state'], "Maharashtra");
    const email = get(['customer.email', 'email', 'user.email'], "");

    // Date formatting DD-MM-YYYY
    const orderDate = new Date(order.createdAt || Date.now());
    const formattedDate = `${String(orderDate.getDate()).padStart(2, '0')}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${orderDate.getFullYear()}`;

    // ---------------------------------------------------------
    // 3. Construct Products Array (Strict V3 Keys)
    // ---------------------------------------------------------
    const products = (order.items || []).map(item => ({
        product_name: item.name || item.nameHtml || "Spice Pack",
        product_sku: item.productId || item._id || "SKU-DEFAULT",
        product_quantity: String(item.quantity || 1), // V3 often expects strings for numbers in some fields, but numbers usually ok. Keeping as per previous but safe. Actually API usually takes numbers. Let's send numbers to be safe, but robust.
        product_price: String(item.price || 0),
        product_tax_rate: "0",
        product_hsn_code: "",
        product_discount: "0"
    }));

    // Guarantee at least one product if empty
    if (products.length === 0) {
        products.push({
            product_name: "Custom Order",
            product_sku: "CUSTOM",
            product_quantity: "1",
            product_price: String(order.pricing?.total || 100),
            product_tax_rate: "0",
            product_hsn_code: "",
            product_discount: "0"
        });
    }

    // ---------------------------------------------------------
    // 4. Return Strict V3 Shipment Object
    // ---------------------------------------------------------
    return {
        // Order Details

        waybill: "", // Leave empty for creation
        order: String(order.orderId || order._id || `ORD-${Date.now()}`),
        sub_order: "",
        order_date: formattedDate,
        total_amount: String(order.pricing?.total || 0),
        name: name,
        company_name: "",
        add: address,
        add2: "",
        add3: "",
        pin: pincode,
        city: city,
        state: state,
        country: "India",
        phone: phone,
        alt_phone: "",
        email: email,
        is_billing_same_as_shipping: "yes",

        // Product Details
        products: products,

        // Shipment Details
        shipment_length: "10",
        shipment_width: "10",
        shipment_height: "10",
        shipment_weight: "0.5", // kg

        // Payment Details
        cod_amount: order.paymentMethod === "COD" ? String(order.pricing?.total || 0) : "0",
        payment_mode: order.paymentMethod === "COD" ? "COD" : "Prepaid",

        // Warehouse / Pickup
        pickup_address_id: process.env.ITHINK_PICKUP_ADDRESS_ID || "",
        return_address_id: process.env.ITHINK_PICKUP_ADDRESS_ID || ""
    };
};
