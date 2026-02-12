require("dotenv").config({ path: ".env" }); // Support local .env if present
const axios = require("axios");
const readline = require("readline");

/* ==========================================================
   CONFIG
   ========================================================== */
const PRE_ALPHA_URL = "https://pre-alpha.ithinklogistics.com/api/order/add.json";
const PROD_URL = "https://manage.ithinklogistics.com/api_v3/order/add.json"; // V3 for PROD
const WAREHOUSE_URL = "https://manage.ithinklogistics.com/api_v3/warehouse/get.json";

// Config from Env
const ACCESS_TOKEN = process.env.ITHINK_ACCESS_TOKEN;
const SECRET_KEY = process.env.ITHINK_SECRET_KEY;
const PICKUP_ID = process.env.ITHINK_PICKUP_ADDRESS_ID;

if (!ACCESS_TOKEN || !SECRET_KEY || !PICKUP_ID) {
    console.error("❌ MISSING ENV VARS: ITHINK_ACCESS_TOKEN, ITHINK_SECRET_KEY, ITHINK_PICKUP_ADDRESS_ID");
    process.exit(1);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

/* ==========================================================
   MOCK DATA (STRICT STRUCTURE)
   ========================================================== */
const getMockPayload = () => {
    const orderId = `TEST-${Date.now()}`;
    const dateStr = new Date().toLocaleDateString('en-GB').split('/').join('-'); // DD-MM-YYYY

    // STRICT PAYLOAD STRUCTURE - ATTEMPT 5 (No Data Wrapper)
    return {
        pickup_address_id: Number(PICKUP_ID), // Root level 
        access_token: ACCESS_TOKEN,   // Root level
        secret_key: SECRET_KEY,       // Root level
        shipments: [
            {
                // return_address_id removed for test
                waybill: "",
                order: orderId,
                sub_order: "",
                order_date: dateStr,
                total_amount: "1.00",
                name: "Test Customer",
                company_name: "",
                add: "123 Test Street, Near Landmark",
                add2: "",
                add3: "",
                pin: "416001", // Valid Kolhapur Pin
                city: "Kolhapur",
                state: "Maharashtra",
                country: "India",
                phone: "9999999999", // 10 digit
                alt_phone: "",
                email: "test@example.com",
                is_billing_same_as_shipping: "yes",
                billing_name: "Test Customer",
                billing_address: "123 Test Street, Near Landmark",
                billing_address2: "",
                billing_city: "Kolhapur",
                billing_pincode: "416001",
                billing_state: "Maharashtra",
                billing_country: "India",
                billing_phone: "9999999999",
                products: [
                    {
                        product_name: "Test Spice Pack",
                        product_sku: "TEST-SKU-001",
                        product_quantity: "1",
                        product_price: "1.00",
                        product_tax_rate: "0",
                        product_hsn_code: "",
                        product_discount: "0"
                    }
                ],
                shipment_weight: "0.1",
                shipment_length: "10",
                shipment_width: "10",
                shipment_height: "10",
                cod_amount: "0",
                payment_mode: "Prepaid"
            }
        ]
    }
};
};

/* ==========================================================
   STEPS
   ========================================================== */

// 1. Verify Warehouse
async function verifyWarehouse() {
    console.log("\n🔍 Checking Warehouse Configuration...");
    try {
        const payload = {
            data: {
                access_token: ACCESS_TOKEN,
                secret_key: SECRET_KEY
            }
        };
        const res = await axios.post(WAREHOUSE_URL, payload);

        if (res.data?.data) {
            const warehouseData = res.data.data;
            console.log("Warehouse Data Type:", Array.isArray(warehouseData) ? "Array" : typeof warehouseData);

            let found = false;
            let foundName = "";

            // Handle Array of Objects (Common in some versions)
            if (Array.isArray(warehouseData)) {
                const match = warehouseData.find(w => String(w.warehouse_id) === String(PICKUP_ID) || String(w.id) === String(PICKUP_ID));
                if (match) {
                    found = true;
                    foundName = match.warehouse_name || match.name || "Unknown";
                } else {
                    console.log("Available Warehouse IDs:", warehouseData.map(w => w.warehouse_id || w.id).join(", "));
                }
            }
            // Handle Object Map (ID -> Name or ID -> Object)
            else if (typeof warehouseData === 'object') {
                const keys = Object.keys(warehouseData);
                if (keys.includes(String(PICKUP_ID))) {
                    found = true;
                    const val = warehouseData[PICKUP_ID];
                    foundName = (typeof val === 'string') ? val : (val.name || val.warehouse_name || "Unknown");
                } else {
                    console.log("Available Warehouse IDs:", keys.join(", "));
                }
            }

            if (found) {
                console.log(`✅ Warehouse ID ${PICKUP_ID} FOUND: "${foundName}"`);
                return true;
            } else {
                console.error(`❌ Warehouse ID ${PICKUP_ID} NOT FOUND in account.`);
                console.log("DEBUG: Available Warehouses:");
                if (Array.isArray(warehouseData)) {
                    warehouseData.forEach(w => console.log(` - ID: ${w.warehouse_id || w.id}, Name: ${w.warehouse_name || w.name}`));
                } else {
                    const keys = Object.keys(warehouseData);
                    keys.forEach(k => {
                        const val = warehouseData[k];
                        const name = (typeof val === 'string') ? val : (val.name || val.warehouse_name || "Unknown");
                        console.log(` - ID: ${k}, Name: ${name}`);
                    });
                }
                return false;
            }
        } else {
            console.error("❌ Failed to fetch warehouses (No data field):", JSON.stringify(res.data));
            return false;
        }
    } catch (err) {
        console.error("❌ Warehouse Check Logic Error:", err.message);
        if (err.response) console.error("Response:", err.response.data);
        return false;
    }
}

// 2. Test Shipment
async function testShipment(url, label) {
    console.log(`\n🚀 Testing ${label} API... [${url}]`);
    const payload = getMockPayload();

    // Log minimal payload for sanity
    console.log(`📦 Payload Preview (Order: ${payload.data.shipments[0].order}, Pickup: ${payload.data.pickup_address_id})`);

    try {
        const res = await axios.post(url, payload);
        console.log(`\n📥 ${label} Response:`, JSON.stringify(res.data, null, 2));

        if (res.data?.status === "success" || res.data?.status === "Success") {
            // Check for AWB
            const shipmentKey = Object.keys(res.data).find(k => k === "data" || k === "1"); // Sometimes response structure varies
            // Standard success: { status: "success", data: { "REF123": { waybill: "AWB...", ... } } } ?
            // Or { status: "success", ... }
            // Let's look for known success markers

            console.log(`✅ ${label} SUCCESS!`);
            return true;
        } else {
            console.error(`❌ ${label} FAILED:`, JSON.stringify(res.data, null, 2));
            return false;
        }

    } catch (err) {
        console.error(`❌ ${label} CONNECTION ERROR:`, err.message);
        if (err.response) console.error("Response:", err.response.data);
        return false;
    }
}

/* ==========================================================
   MAIN FLOW
   ========================================================== */
async function main() {
    console.log("🛠️  iThink Logistics Strict Integration Verification");
    console.log("==================================================");

    // STEP 1: Warehouse
    const warehouseOk = await verifyWarehouse();
    if (!warehouseOk) {
        console.error("⛔ STOPPING: Invalid Warehouse Configuration.");
        process.exit(1);
    }

    // STEP 2: Pre-Alpha
    console.log("\n--- PHASE 1: PRE-ALPHA TEST ---");
    const preAlphaOk = await testShipment(PRE_ALPHA_URL, "PRE-ALPHA");

    let skipPreAlpha = false;
    if (!preAlphaOk) {
        console.warn("⚠️  Pre-Alpha Test Failed.");
        // If auth failed, we might still want to try prod if user insists
        console.warn("NOTE: If failure is 'Access Token Not Match', your credentials might be Production-only.");

        // Check force flag
        const forceProd = process.argv.includes('--force-prod');
        let proceed = "";

        if (forceProd) {
            console.log("👉 Force flag detected. Bypassing Pre-Alpha check...");
            proceed = "FORCE";
        } else {
            proceed = await askQuestion("👉 Pre-Alpha failed. Do you want to try Production anyway? (Type 'FORCE' to proceed): ");
        }

        if (proceed !== "FORCE") {
            console.error("⛔ STOPPING: User aborted.");
            process.exit(1);
        }
        skipPreAlpha = true;
    }

    const fs = require('fs');

    // STEP 3: Production Safeguard
    console.log("\n--- PHASE 2: PRODUCTION TEST ---");
    console.log("⚠️  WARNING: You are about to create a REAL LIVE SHIPMENT in PRODUCTION.");
    console.log("⚠️  This will generate a chargeable AWB.");
    if (skipPreAlpha) {
        console.log("🧨 RISKY: Pre-Alpha verification was skipped/failed. Payload structure is UNVERIFIED.");
    }

    // Log raw string payload (masked)
    const payload = getMockPayload(); // Get payload for logging
    const rawPayload = JSON.stringify(payload);
    console.log(`📦 Raw Payload Structure: ${rawPayload.replace(ACCESS_TOKEN, "***").replace(SECRET_KEY, "***")}`);

    // STEP 4: Production Execution directly
    console.log("👉 Executing Production Request...");
    const prodOk = await testShipment(PROD_URL, "PRODUCTION");

    const resultLog = prodOk
        ? "SUCCESS: Production AWB Generated."
        : "FAILURE: Production Shipment Failed.";

    fs.writeFileSync('verification_result.txt', resultLog);

    if (prodOk) {
        console.log("\n✅✅✅ VERIFICATION COMPLETE: Production AWB Generated.");
        console.log("👉 ACTION: Log in to iThink Dashboard and verify AWB visibility.");
    } else {
        console.error("\n❌❌❌ PRODUCTION FAILED. Do not deploy.");
    }

    rl.close();
}

main();
