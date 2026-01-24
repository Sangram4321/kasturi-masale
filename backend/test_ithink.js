const dotenv = require('dotenv');
dotenv.config(); // Defaults to .env in current dir

// Debug
console.log("ITHINK_PICKUP_ADDRESS_ID:", process.env.ITHINK_PICKUP_ADDRESS_ID || "MISSING");

const axios = require('axios');

const BASE_URL = "https://manage.ithinklogistics.com/api_v3/order/add.json";

const testOrder = async (courierName) => {
    console.log(`Testing with courier: '${courierName}'`);

    // Random Order ID
    const orderId = "TEST-" + Math.floor(Math.random() * 10000);
    const date = new Date().toISOString().split('T')[0];

    const payload = {
        data: {
            shipments: [{
                order: orderId,
                order_date: date,
                total_amount: 100,
                payment_method: "Prepaid",
                logistics: courierName, // Testing this field

                name: "Test User",
                add: "Test Address",
                pin: "400001",
                city: "Mumbai",
                state: "Maharashtra",
                country: "India",
                phone: "9876543210",

                payment_mode: "Prepaid",
                cod_amount: 0,

                products: [{
                    product_name: "Test Product",
                    product_quantity: 1,
                    product_price: 100
                }]
            }],
            pickup_address_id: process.env.ITHINK_PICKUP_ADDRESS_ID,
            access_token: process.env.ITHINK_ACCESS_TOKEN,
            secret_key: process.env.ITHINK_SECRET_KEY,
        }
    };

    try {
        const response = await axios.post(BASE_URL, payload);
        console.log(`✅ Success for '${courierName}':`, response.data);
    } catch (error) {
        if (error.response) {
            console.log(`❌ Failed for '${courierName}':`, JSON.stringify(error.response.data));
        } else {
            console.error(`❌ Error for '${courierName}':`, error.message);
        }
    }
};

(async () => {
    // console.log("Keys:", process.env.ITHINK_ACCESS_TOKEN ? "Found" : "Missing");
    // console.log("PickupID:", process.env.ITHINK_PICKUP_ADDRESS_ID);

    await testOrder("Delhivery");
    await testOrder("delhivery");
    await testOrder("Blue Dart");
    await testOrder("Bluedart");
    await testOrder("Expressbees");
    await testOrder("Xpressbees");
})();
