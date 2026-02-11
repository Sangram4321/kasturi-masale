const axios = require("axios");

const BASE = "https://manage.ithinklogistics.com/api_v3";

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

function requireEnv(name) {
    if (!process.env[name]) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return process.env[name];
}

function cleanPhone(phone) {
    return String(phone || "")
        .replace(/\D/g, "")
        .slice(-10);
}

function formatDate(date) {
    const d = new Date(date || Date.now());
    return `${String(d.getDate()).padStart(2, "0")}-${String(
        d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
}

/* -------------------------------------------------------
   Payload Builder (STRICT & CLEAN)
------------------------------------------------------- */

function buildShipment(order) {
    const phone = cleanPhone(order?.customer?.phone);

    if (!phone) throw new Error("Invalid customer phone");

    const products =
        order.items?.map((i) => ({
            product_name: i.name || "Spice Pack",
            product_sku: i.productId || "SKU",
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

    const pickupId = requireEnv("ITHINK_PICKUP_ADDRESS_ID");

    return {
        waybill: "",
        order: String(order.orderId),
        sub_order: "",
        order_date: formatDate(order.createdAt),
        total_amount: String(order.pricing?.total || 0),

        name: order.customer?.name || "Customer",
        company_name: "",
        add: order.customer?.address || "Address Missing",
        add2: "",
        add3: "",
        pin: String(order.customer?.pincode || "416001"),
        city: order.customer?.city || "Kolhapur",
        state: order.customer?.state || "Maharashtra",
        country: "India",
        phone,
        alt_phone: "",
        email: order.customer?.email || "",
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

        pickup_address_id: pickupId,
        return_address_id: pickupId,
    };
}

/* -------------------------------------------------------
   Create Shipment
------------------------------------------------------- */

exports.createOrder = async (order) => {
    try {
        const payload = {
            data: {
                shipments: [buildShipment(order)],
                access_token: requireEnv("ITHINK_ACCESS_TOKEN"),
                secret_key: requireEnv("ITHINK_SECRET_KEY"),
            },
        };

        console.log("📦 iThink Payload:", JSON.stringify(payload, null, 2));

        const res = await axios.post(`${BASE}/order/add.json`, payload);

        console.log("📦 iThink Response:", JSON.stringify(res.data, null, 2));

        if (res.data?.status !== "success") {
            throw new Error(JSON.stringify(res.data));
        }

        return res.data;
    } catch (err) {
        console.error("❌ iThink Create Error:", err.response?.data || err.message);
        throw err;
    }
};

/* -------------------------------------------------------
   Cancel Shipment
------------------------------------------------------- */

exports.cancelShipment = async (awb) => {
    try {
        const res = await axios.post(`${BASE}/order/cancel.json`, {
            data: {
                awb_numbers: [awb],
                access_token: requireEnv("ITHINK_ACCESS_TOKEN"),
                secret_key: requireEnv("ITHINK_SECRET_KEY"),
            },
        });

        if (res.data?.status !== "success") {
            throw new Error(JSON.stringify(res.data));
        }

        return res.data;
    } catch (err) {
        console.error("❌ Cancel Error:", err.response?.data || err.message);
        throw err;
    }
};

/* -------------------------------------------------------
   Track Shipment
------------------------------------------------------- */

exports.trackShipment = async (awb) => {
    try {
        const res = await axios.post(`${BASE}/order/track.json`, {
            data: {
                awb_number_list: awb,
                access_token: requireEnv("ITHINK_ACCESS_TOKEN"),
                secret_key: requireEnv("ITHINK_SECRET_KEY"),
            },
        });

        return res.data?.data?.[awb] || null;
    } catch (err) {
        console.error("❌ Track Error:", err.response?.data || err.message);
        return null;
    }
};

/* -------------------------------------------------------
   Pickup Address List
------------------------------------------------------- */

exports.getPickupAddresses = async () => {
    try {
        const res = await axios.post(`${BASE}/pickup-address/list.json`, {
            data: {
                access_token: requireEnv("ITHINK_ACCESS_TOKEN"),
                secret_key: requireEnv("ITHINK_SECRET_KEY"),
            },
        });

        return res.data?.data || res.data;
    } catch (err) {
        console.error("❌ Pickup Fetch Error:", err.response?.data || err.message);
        throw err;
    }
};
