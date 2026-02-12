const axios = require("axios");

const BASE_URL = "https://manage.ithinklogistics.com/api_v3/order/add.json";

/* =====================================================
   CREATE SHIPMENT — MINIMAL V3 SAFE
===================================================== */
exports.createOrder = async (order) => {
    try {
        const raw = order.toObject ? order.toObject() : order;

        const shipment = exports.formatOrderPayload(raw);

        const pickupId = Number(process.env.ITHINK_PICKUP_ADDRESS_ID);
        if (!pickupId) throw new Error("Invalid ITHINK_PICKUP_ADDRESS_ID");

        const payload = {
            pickup_address_id: pickupId,
            return_address_id: pickupId,
            shipments: [shipment],
            access_token: process.env.ITHINK_ACCESS_TOKEN,
            secret_key: process.env.ITHINK_SECRET_KEY,
        };

        console.log("📦 iThink FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

        const res = await axios.post(BASE_URL, payload, {
            headers: { "Content-Type": "application/json" },
            timeout: 20000,
        });

        console.log("📦 iThink RAW RESPONSE:", JSON.stringify(res.data, null, 2));

        if (res.data?.status === "success") {
            console.log("✅ SHIPMENT CREATED");
            return res.data;
        }

        console.error("❌ iThink API ERROR:", res.data);
        return null;
    } catch (err) {
        console.error("❌ iThink EXCEPTION:");
        console.error("status:", err.response?.status);
        console.error("data:", err.response?.data);
        console.error("message:", err.message);
        return null;
    }
};

/* =====================================================
   FORMAT ORDER → STRICT MINIMAL PAYLOAD
===================================================== */
exports.formatOrderPayload = (order) => {
    const phone = String(order.customer?.phone || "")
        .replace(/\D/g, "")
        .slice(-10);

    const created = new Date(order.createdAt || Date.now());
    const orderDate = `${String(created.getDate()).padStart(2, "0")}-${String(
        created.getMonth() + 1
    ).padStart(2, "0")}-${created.getFullYear()}`;

    /* ===== PRODUCTS ===== */
    let totalWeight = 0;

    const products =
        order.items?.map((i) => {
            const qty = Number(i.quantity) || 1;
            const price = Number(i.price) || 0;
            const weight = Number(i.weight) || 0.5;

            totalWeight += qty * weight;

            return {
                product_name: i.name || "Spice Pack",
                product_sku: String(i.productId || i._id || "SKU"),
                product_quantity: qty,
                product_price: price,
                product_tax_rate: 0,
                product_hsn_code: "0910",
                product_discount: 0,
            };
        }) || [];

    if (products.length === 0) {
        const price = Number(order.pricing?.total || 0);
        totalWeight = 0.5;

        products.push({
            product_name: "Custom Order",
            product_sku: "CUSTOM",
            product_quantity: 1,
            product_price: price,
            product_tax_rate: 0,
            product_hsn_code: "0910",
            product_discount: 0,
        });
    }

    /* ===== TOTAL STRICT ===== */
    const total = products.reduce(
        (sum, p) => sum + p.product_price * p.product_quantity,
        0
    );

    const finalWeight = Math.max(totalWeight + 0.08, 0.1).toFixed(2);

    return {
        waybill: "",
        order: String(order.orderId || order._id || `ORD-${Date.now()}`),
        sub_order: "",
        order_date: orderDate,
        total_amount: String(total),

        name: order.customer?.name || "Customer",
        add: order.customer?.address || "Address Missing",
        add2: "",
        pin: order.customer?.pincode || "416001",
        city: order.customer?.city || "Kolhapur",
        state: order.customer?.state || "Maharashtra",
        country: "India",
        phone,
        email: order.customer?.email || "test@test.com",

        billing_name: order.customer?.name || "Customer",
        billing_address: order.customer?.address || "Address Missing",
        billing_city: order.customer?.city || "Kolhapur",
        billing_pincode: order.customer?.pincode || "416001",
        billing_state: order.customer?.state || "Maharashtra",
        billing_country: "India",
        billing_phone: phone,

        products,

        shipment_weight: String(finalWeight),

        cod_amount: order.paymentMethod === "COD" ? String(total) : "0",
        payment_mode: order.paymentMethod === "COD" ? "COD" : "Prepaid",
    };
};
