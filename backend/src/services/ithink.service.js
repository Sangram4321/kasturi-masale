const axios = require("axios");

const BASE_URL = "https://manage.ithinklogistics.com/api_v3/order/add.json";

/* =====================================================
   CREATE SHIPMENT
===================================================== */
exports.createOrder = async (order) => {
    try {
        /* ---------- 1. Clean Order ---------- */
        const raw = order.toObject ? order.toObject() : order;

        const cleanOrder = {
            customer: raw.customer,
            pricing: raw.pricing,
            shipping: raw.shipping,
            items: raw.items,
            status: raw.status,
            paymentMethod: raw.paymentMethod,
            orderId: raw.orderId,
            createdAt: raw.createdAt,
            _id: raw._id,
        };

        JSON.stringify(cleanOrder); // validation
        console.log("✅ ORDER JSON VALID");

        /* ---------- 2. Shipment Object ---------- */
        const shipmentData = exports.formatOrderPayload(cleanOrder);

        /* ---------- 3. ENV Validation ---------- */
        const pickupId = Number(process.env.ITHINK_PICKUP_ADDRESS_ID);
        if (!pickupId) throw new Error("Invalid or missing ITHINK_PICKUP_ADDRESS_ID");

        /* ---------- 4. FINAL PAYLOAD (CORRECT STRUCTURE) ---------- */
        const payload = {
            pickup_address_id: pickupId,
            return_address_id: pickupId,

            data: {
                shipments: [shipmentData],
                access_token: process.env.ITHINK_ACCESS_TOKEN,
                secret_key: process.env.ITHINK_SECRET_KEY,
            },
        };

        console.log("📦 iThink FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

        /* ---------- 5. API CALL ---------- */
        const response = await axios.post(BASE_URL, payload);

        console.log("📦 iThink API RESPONSE:", JSON.stringify(response.data, null, 2));

        if (response.data?.status === "success") {
            return response.data;
        }

        throw new Error(JSON.stringify(response.data));
    } catch (error) {
        console.error("❌ iThink Create Error:", error.response?.data || error.message);
        throw error;
    }
};

/* =====================================================
   CANCEL SHIPMENT
===================================================== */
exports.cancelShipment = async (awbNumber) => {
    try {
        const payload = {
            data: {
                awb_numbers: [awbNumber],
                access_token: process.env.ITHINK_ACCESS_TOKEN,
                secret_key: process.env.ITHINK_SECRET_KEY,
            },
        };

        const response = await axios.post(
            "https://manage.ithinklogistics.com/api_v3/order/cancel.json",
            payload
        );

        if (response.data?.status === "success") return response.data;

        throw new Error(JSON.stringify(response.data));
    } catch (error) {
        console.error("❌ iThink Cancel Error:", error.response?.data || error.message);
        throw error;
    }
};

/* =====================================================
   TRACK SHIPMENT
===================================================== */
exports.trackShipment = async (awbNumber) => {
    try {
        const payload = {
            data: {
                awb_number_list: awbNumber,
                access_token: process.env.ITHINK_ACCESS_TOKEN,
                secret_key: process.env.ITHINK_SECRET_KEY,
            },
        };

        const response = await axios.post(
            "https://manage.ithinklogistics.com/api_v3/order/track.json",
            payload
        );

        return response.data?.data?.[awbNumber] || null;
    } catch (error) {
        console.error("❌ iThink Track Error:", error.response?.data || error.message);
        return null;
    }
};

/* =====================================================
   GET PICKUP ADDRESSES (DEBUG TOOL)
===================================================== */
exports.getPickupAddresses = async () => {
    try {
        const payload = {
            data: {
                access_token: process.env.ITHINK_ACCESS_TOKEN,
                secret_key: process.env.ITHINK_SECRET_KEY,
            },
        };

        const response = await axios.post(
            "https://manage.ithinklogistics.com/api_v3/pickup-address/list.json",
            payload
        );

        console.log("📍 PICKUP LIST:", response.data);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("❌ Pickup Fetch Error:", error.response?.data || error.message);
        throw error;
    }
};

/* =====================================================
   FORMAT ORDER → SHIPMENT PAYLOAD
===================================================== */
exports.formatOrderPayload = (order) => {
    const get = (paths, fallback = "") => {
        for (const path of paths) {
            const keys = path.split(".");
            let val = order;
            for (const key of keys) val = val?.[key];
            if (val !== undefined && val !== null && val !== "") return val;
        }
        return fallback;
    };

    const phone = String(
        get(["customer.phone", "shippingAddress.phone", "phone"], "")
    )
        .replace(/\D/g, "")
        .slice(-10);

    const orderDate = new Date(order.createdAt || Date.now());
    const formattedDate = `${String(orderDate.getDate()).padStart(2, "0")}-${String(
        orderDate.getMonth() + 1
    ).padStart(2, "0")}-${orderDate.getFullYear()}`;

    const products =
        (order.items || []).map((i) => ({
            product_name: i.name || "Spice Pack",
            product_sku: i.productId || i._id || "SKU",
            product_quantity: String(i.quantity || 1),
            product_price: String(i.price || 0),
            product_tax_rate: "0",
            product_hsn_code: "",
            product_discount: "0",
        })) || [];

    if (products.length === 0) {
        products.push({
            product_name: "Custom Order",
            product_sku: "CUSTOM",
            product_quantity: "1",
            product_price: String(order.pricing?.total || 0),
            product_tax_rate: "0",
            product_hsn_code: "",
            product_discount: "0",
        });
    }

    return {
        waybill: "",
        order: String(order.orderId || order._id || `ORD-${Date.now()}`),
        sub_order: "",
        order_date: formattedDate,
        total_amount: String(order.pricing?.total || 0),

        name: get(["customer.name", "name"], "Customer"),
        company_name: "",
        add: get(["customer.address", "address"], "Address Missing"),
        add2: "",
        add3: "",
        pin: get(["customer.pincode", "pincode"], "416001"),
        city: get(["customer.city", "city"], "Kolhapur"),
        state: get(["customer.state", "state"], "Maharashtra"),
        country: "India",
        phone,
        alt_phone: "",
        email: get(["customer.email", "email"], ""),
        is_billing_same_as_shipping: "yes",

        products,

        shipment_length: "10",
        shipment_width: "10",
        shipment_height: "10",
        shipment_weight: "0.5",

        cod_amount:
            order.paymentMethod === "COD"
                ? String(order.pricing?.total || 0)
                : "0",

        payment_mode: order.paymentMethod === "COD" ? "COD" : "Prepaid",
    };
};
