const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
try {
    let content = fs.readFileSync(envPath, 'utf8');
    const key = "ITHINK_PICKUP_ADDRESS_ID";
    const newVal = "112078";

    // Check if key exists
    if (content.includes(key)) {
        // Replace existing line
        const regex = new RegExp(`^${key}=.*`, 'gm');
        content = content.replace(regex, `${key}=${newVal}`);
        console.log(`✅ Updated ${key} to ${newVal}`);
    } else {
        // Append
        content += `\n${key}=${newVal}`;
        console.log(`✅ Added ${key}=${newVal}`);
    }

    fs.writeFileSync(envPath, content, 'utf8');

} catch (err) {
    console.error("Error updating .env:", err);
}
