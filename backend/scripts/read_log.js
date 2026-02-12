const fs = require('fs');
const filename = process.argv[2] || 'debug_output.txt';
try {
    const data = fs.readFileSync(filename, 'utf8');
    // Print last 1000 chars
    console.log(data.slice(-1000));
} catch (err) {
    console.error(err);
}
