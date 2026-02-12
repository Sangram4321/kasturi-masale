require("dotenv").config({ path: ".env" });
const axios = require("axios");
const fs = require('fs');

const BASE_URL = process.env.ITHINK_BASE_URL; // Revert to env (my.ithinklogistics.com)
const ACCESS_TOKEN = process.env.ITHINK_ACCESS_TOKEN;
const SECRET_KEY = process.env.ITHINK_SECRET_KEY;
const PICKUP_ID = process.env.ITHINK_PICKUP_ADDRESS_ID;

function log(msg) {
    console.log(msg);
    fs.appendFileSync('debug-output.txt', msg + '\n');
}

const baseShipment = {
    waybill: "",
    order: `DEBUG-${Date.now()}`,
    sub_order: "",
    order_date: new Date().toLocaleDateString('en-GB').split('/').join('-'),
    total_amount: "100.00",
    name: "Debug User",
    add: "Debug Address",
    pin: "416001",
    city: "Kolhapur",
    state: "Maharashtra",
    country: "India",
    phone: "9999999999",
    email: "debug@example.com",

    // Some search results say these are mandatory?
    billing_name: "Debug User",
    billing_add: "Debug Address",
    billing_pin: "416001",
    billing_city: "Kolhapur",
    billing_state: "Maharashtra",
    billing_country: "India",
    billing_phone: "9999999999",

    products: [{
        product_name: "Debug Product",
        product_sku: "DBG-001",
        product_quantity: "1",
        product_price: "100",
        product_tax_rate: "0",
        product_hsn_code: "0910",
        product_discount: "0"
    }],
    shipment_length: "10",
    shipment_width: "10",
    shipment_height: "10",
    weight: "0.5",
    cod_amount: "0",
    payment_mode: "Prepaid",
    return_address_id: PICKUP_ID
};

const variations = [
    // The most promising candidate based on search results:
    { name: "s_type: surface", payloadMixin: {}, shipmentMixin: { s_type: "surface" } },
    { name: "s_type: Surface", payloadMixin: {}, shipmentMixin: { s_type: "Surface" } },

    // Combining s_type with logistics (required together?)
    { name: "logistics: Delhivery + s_type: Surface", payloadMixin: {}, shipmentMixin: { logistics: "Delhivery", s_type: "Surface" } },
    { name: "logistics: Delhivery + s_type: surface", payloadMixin: {}, shipmentMixin: { logistics: "Delhivery", s_type: "surface" } },

    // Just logistics?
    { name: "logistics: Delhivery", payloadMixin: {}, shipmentMixin: { logistics: "Delhivery" } },

    // Retry root data placement for s_type
    { name: "Root s_type: surface", payloadMixin: { s_type: "surface" }, shipmentMixin: {} },

    // Fallback attempts
    { name: "order_type: surface", payloadMixin: {}, shipmentMixin: { order_type: "surface" } },

    // Testing manage endpoint manually in one variation?
    // No, let's stick to env base url first.
];

async function testVariation(variation) {
    log(`\n🧪 Testing: ${variation.name}`);

    // Construct shipment object
    const shipment = { ...baseShipment, ...variation.shipmentMixin };

    // Construct full payload
    const payload = {
        data: {
            shipments: [shipment],
            pickup_address_id: String(PICKUP_ID),
            access_token: ACCESS_TOKEN,
            secret_key: SECRET_KEY,
            ...variation.payloadMixin
        }
    };

    try {
        const res = await axios.post(BASE_URL, payload, { timeout: 10000 });
        log(`Response Status: ${res.data.status}`);

        if (res.data.status === 'success') {
            log(`✅ SUCCESS! Payload structure matches.`);
            log(JSON.stringify(variation, null, 2));
            return true;
        } else {
            const msg = res.data.html_message || res.data.message || JSON.stringify(res.data);
            log(`❌ Failed: ${msg.substring(0, 200)}...`);
        }
    } catch (err) {
        log(`❌ Error: ${err.message}`);
        if (err.response) {
            log(`Response Data: ${JSON.stringify(err.response.data).substring(0, 200)}...`);
        }
    }
    return false;
}

async function run() {
    fs.writeFileSync('debug-output.txt', '');
    log("🔍 Starting Debug of iThink Payload...");
    log(`URL: ${BASE_URL}`);

    if (!ACCESS_TOKEN || !SECRET_KEY) {
        log("❌ Errors: Missing Keys");
        return;
    }

    for (const v of variations) {
        if (await testVariation(v)) break;
    }
    // Also try without any service type to confirm error message
    await testVariation({ name: "CONTROL: No service type", payloadMixin: {}, shipmentMixin: {} });
}

run();
