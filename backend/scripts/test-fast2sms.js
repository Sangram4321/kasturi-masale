const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');

const API_KEY = process.env.FAST2SMS_API_KEY;

console.log("--- Fast2SMS Test Script ---");
console.log("API Key present:", !!API_KEY);
if (API_KEY) {
    console.log("API Key (first 5 chars):", API_KEY.substring(0, 5) + "...");
}

const sendTestOTP = async () => {
    try {
        const TEST_PHONE = "9999999999"; // Invalid number, but should trigger API response (likely invalid number error, which confirms connectivity)
        // OR ask user? I'll stick to a dummy number or just check if API rejects auth.
        // Actually, Fast2SMS might catch invalid numbers. 

        console.log("Attempting to send OTP (GET - Query Param Auth)...");
        const options = {
            method: 'GET',
            url: 'https://www.fast2sms.com/dev/bulkV2',
            headers: {},
            params: {
                "authorization": API_KEY,
                "route": "q",
                "message": "Your OTP is 123456",
                "numbers": "9999999999",
                "flash": "0"
            }
        };

        const response = await axios(options);
        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(response.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.log("STATUS:", error.response.status);
            console.log("MSG:", JSON.stringify(error.response.data));
        } else {
            console.log("ERR:", error.message);
        }
    }
};

sendTestOTP();
