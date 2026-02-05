try {
    require("../src/controllers/order.controller");
    console.log("✅ Syntax OK");
} catch (err) {
    console.error("❌ Syntax Error Details:");
    console.error(err);
}
