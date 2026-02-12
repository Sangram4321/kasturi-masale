const axios = require("axios");

const BASE_URL = process.env.ITHINK_BASE_URL;

/* =====================================================
   CREATE SHIPMENT — PRODUCTION SAFE
===================================================== */
exports.createOrder = async (order) => {
    try {
        const raw = order.toObject ? order.toObject() : order;

        const shipment = exports.formatOrderPayload(raw);

        const payload = {
            data: {
                shipments: [shipment],
                pickup_address_id: String(process.env.ITHINK_PICKUP_ADDRESS_ID),
                access_token: process.env.ITHINK_ACCESS_TOKEN,
                secret_key: process.env.ITHINK_SECRET_KEY,
                shipment_service_type: "surface",
            },
        };

        console.log("📦 iThink FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

        const res = await axios.post(BASE_URL, payload, {
            headers: { "Content-Type": "application/json" },
            timeout: 20000,
        });

        console.log("📦 iThink RAW RESPONSE:", JSON.stringify(res.data, null, 2));

        /* ===== STRICT SUCCESS CHECK ===== */
        if (res.data?.status !== "success") {
            throw new Error("iThink API FAILED → " + JSON.stringify(res.data));
        }

        console.log("✅ SHIPMENT CREATED SUCCESSFULLY");
        return res.data;

    } catch (err) {
        console.error("❌ iThink CREATE EXCEPTION:");
        console.error(err.response?.data || err.message);

        /* IMPORTANT: throw so controller knows failure */
        throw err;
    }
};


/* =====================================================
   FORMAT ORDER → DOCS PERFECT PAYLOAD
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
                product_quantity: String(qty),
                product_price: String(price),
                product_tax_rate: "0",
                product_hsn_code: "0910",
                product_discount: "0",
            };
        }) || [];

    /* ===== SAFETY FALLBACK ===== */
    if (products.length === 0) {
        const price = Number(order.pricing?.subtotal || 0);
        totalWeight = 0.5;

        products.push({
            product_name: "Custom Order",
            product_sku: "CUSTOM",
            product_quantity: "1",
            product_price: String(price),
            product_tax_rate: "0",
            product_hsn_code: "0910",
            product_discount: "0",
        });
    }

    /* =====================================================
       🔥 CRITICAL BUSINESS LOGIC (COURIER RULE)
       total_amount = PRODUCT VALUE ONLY
       cod_amount   = FINAL PAYABLE (incl COD fee)
    ===================================================== */

    // product value (sum of items)
    const productTotal = products.reduce(
        (sum, p) => sum + Number(p.product_price) * Number(p.product_quantity),
        0
    );

    // final payable from order pricing
    const finalPayable = Number(order.pricing?.total || productTotal);

    /* ===== BOX DIMENSIONS ===== */
    let length = 20,
        width = 7,
        height = 30,
        weight = totalWeight;

    if (totalWeight <= 0.2) {
        length = 13;
        width = 5;
        height = 21;
    } else if (totalWeight <= 0.5) {
        length = 16;
        width = 6;
        height = 23;
    }

    return {
        waybill: "",
        order: String(order.orderId || order._id || `ORD-${Date.now()}`),
        sub_order: "",
        order_date: orderDate,

        /* ✅ CORRECT */
        total_amount: String(productTotal),
        shipment_service_type: "surface",

        name: order.customer?.name || "Customer",
        add: order.customer?.address || "Address Missing",
        add2: "",
        pin: String(order.customer?.pincode || "416001"),
        city: order.customer?.city || "Kolhapur",
        state: order.customer?.state || "Maharashtra",
        country: "India",
        phone,

        email: order.customer?.email || "support@kasturimasale.in",

        billing_name: order.customer?.name || "Customer",
        billing_add: order.customer?.address || "Address Missing",
        billing_add2: "",
        billing_pin: String(order.customer?.pincode || "416001"),
        billing_city: order.customer?.city || "Kolhapur",
        billing_state: order.customer?.state || "Maharashtra",
        billing_country: "India",
        billing_phone: phone,

        products,

        shipment_length: String(length),
        shipment_width: String(width),
        shipment_height: String(height),
        weight: String(weight),

        /* ✅ CORRECT */
        cod_amount: order.paymentMethod === "COD" ? String(finalPayable) : "0",
        payment_mode: order.paymentMethod === "COD" ? "COD" : "Prepaid",

        return_address_id: String(process.env.ITHINK_PICKUP_ADDRESS_ID),
    };
};
