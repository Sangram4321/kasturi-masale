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
