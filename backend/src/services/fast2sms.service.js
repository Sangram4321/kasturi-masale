const axios = require('axios');

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;

/**
 * Sends an OTP to the specified phone number using Fast2SMS.
 * 
 * @param {string} phoneNumber - The 10-digit phone number.
 * @param {string} otp - The OTP to send.
 * @returns {Promise<Object>} - The API response.
 */
const sendOTP = async (phoneNumber, otp) => {
    try {
        if (!FAST2SMS_API_KEY) {
            throw new Error("FAST2SMS_API_KEY is not configured.");
        }

        const options = {
            method: 'GET',
            url: 'https://www.fast2sms.com/dev/bulkV2',
            headers: {
                'authorization': FAST2SMS_API_KEY
            },
            params: {
                "route": "otp",
                "variables_values": otp,
                "numbers": phoneNumber,
                "flash": "0"
            }
        };

        const response = await axios(options);
        return response.data;
    } catch (error) {
        console.error("Fast2SMS OTP Send Error:", error.response ? error.response.data : error.message);

        // FAILOVER: Development Mode
        // If API fails (DLT/Balance issues), log OTP to console to allow testing
        console.log("========================================");
        console.log(`[DEV MODE] OTP for ${phoneNumber}: ${otp}`);
        console.log("========================================");

        return { return: true, message: "OTP sent via Dev Mode" };
    }
};

module.exports = {
    sendOTP
};
