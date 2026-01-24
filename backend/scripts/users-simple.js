const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const User = require("../src/models/User");

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log("CONNECTED");
    const users = await User.find({}, "name uid phone");
    console.log(JSON.stringify(users, null, 2));
    process.exit();
}).catch(err => console.error(err));
