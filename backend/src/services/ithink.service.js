const axios = require("axios");

const BASE_URL =
    "https://manage.ithinklogistics.com/api_v3/order/add.json";

/* =====================================================
   CREATE SHIPMENT (FIXED + STABLE)
===================================================== */
exports.createOrder = async (order) => {
    try {
        const raw = order.toObject ? order.toObject() : order;

        const cleanOrder = {
            customer: raw.customer,
            pricing: raw.pricing,
            items: raw.items,
            paymentMethod: raw.paymentMethod,
            orderId: raw.orderId,
            createdAt: raw.createdAt,
            _id: raw._id,
        };

        console.log("✅ ORDER JSON VALID");

        const shipmentData = exports.formatOrderPayload(cleanOrder);

        const pickupId = Number(process.env.ITHINK_PICKUP_ADDRESS_ID);
        if (!pickupId) throw new Error("Invalid ITHINK_PICKUP_ADDRESS_ID");

        const payload = {
            data: {
                pickup_address_id: pickupId,
                return_address_id: pickupId,
                shipments: [shipmentData],
                access_token: process.env.ITHINK_ACCESS_TOKEN,
                secret_key: process.env.ITHINK_SECRET_KEY,
            },
        };

        console.log("📦 iThink FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

        const response = await axios.post(BASE_URL, payload, {
            headers: { "Content-Type": "application/json" },
            timeout: 20000,
        });

        console.log("📦 iThink RAW RESPONSE:", JSON.stringify(response.data, null, 2));

        // ✅ SUCCESS
        if (response.data?.status === "success") {
            console.log("✅ SHIPMENT CREATED SUCCESSFULLY");
            return response.data;
        }

        // ❌ STRUCTURED ERROR FROM API
        console.error("❌ iThink API ERROR RESPONSE:", response.data);
        return null;
    } catch (error) {
        console.error("❌ iThink CREATE EXCEPTION:");
        console.error("status:", error.response?.status);
        console.error("data:", error.response?.data);
        console.error("message:", error.message);
        return null;
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
            payload,
            { headers: { "Content-Type": "application/json" } }
        );

        if (response.data?.status === "success") return response.data;

        console.error("❌ iThink Cancel API Error:", response.data);
        return null;
    } catch (error) {
        console.error("❌ iThink Cancel Exception:", error.response?.data || error.message);
        return null;
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
            payload,
            { headers: { "Content-Type": "application/json" } }
        );

        return response.data?.data?.[awbNumber] || null;
    } catch (error) {
        console.error("❌ iThink Track Error:", error.response?.data || error.message);
        return null;
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

    const phone = String(get(["customer.phone", "phone"], ""))
        .replace(/\D/g, "")
        .slice(-10);

    const orderDate = new Date(order.createdAt || Date.now());
    const formattedDate = `${String(orderDate.getDate()).padStart(2, "0")}-${String(
        orderDate.getMonth() + 1
    ).padStart(2, "0")}-${orderDate.getFullYear()}`;

    /* ⚖️ WEIGHT CALCULATION */
    let totalWeight = 0;

    const products = (order.items || []).map((i) => {
        const itemWeight = Number(i.weight) || 0.5;
        const qty = Number(i.quantity) || 1;

        totalWeight += itemWeight * qty;

        return {
            product_name: i.name || "Spice Pack",
            product_sku: i.productId || i._id || "SKU",
            product_quantity: String(qty),
            product_price: String(i.price || 0),
            product_tax_rate: "0",
            product_hsn_code: "",
            product_discount: "0",
        };
    });

    if (products.length === 0) {
        totalWeight = 0.5;

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

    /* Add packaging weight + ensure minimum */
    const finalWeight = Math.max(totalWeight + 0.08, 0.1).toFixed(2);

    return {
        waybill: "",
        order: String(order.orderId || order._id || `ORD-${Date.now()}`),
        sub_order: "",
        order_date: formattedDate,
        total_amount: String(order.pricing?.total || 0),

        name: get(["customer.name"], "Customer"),
        add: get(["customer.address"], "Address Missing"),
        add2: "",
        pin: get(["customer.pincode"], "416001"),
        city: get(["customer.city"], "Kolhapur"),
        state: get(["customer.state"], "Maharashtra"),
        country: "India",
        phone,

        email: get(["customer.email"], "test@test.com"),

        billing_name: get(["customer.name"], "Customer"),
        billing_address: get(["customer.address"], "Address Missing"),
        billing_city: get(["customer.city"], "Kolhapur"),
        billing_pincode: get(["customer.pincode"], "416001"),
        billing_state: get(["customer.state"], "Maharashtra"),
        billing_country: "India",
        billing_phone: phone,

        products,

        shipment_weight: String(finalWeight),

        cod_amount:
            order.paymentMethod === "COD"
                ? String(order.pricing?.total || 0)
                : "0",

        payment_mode: order.paymentMethod === "COD" ? "COD" : "Prepaid",
    };

};
