require("dotenv").config();
const { formatOrderPayload } = require("../src/services/ithink.service");

// Mock Order with Weights
const mockOrder = {
    orderId: "TEST-WEIGHT-001",
    createdAt: new Date(),
    customer: {
        name: "Test User",
        phone: "9999999999",
        address: "Test Address",
        pincode: "416001"
    },
    items: [
        { name: "Item 1", quantity: 2, weight: 0.5 }, // 1.0 kg
        { name: "Item 2", quantity: 1, weight: 0.2 }, // 0.2 kg
    ],
    pricing: { total: 500 },
    paymentMethod: "COD"
};

console.log("Testing formatOrderPayload...");
const payload = formatOrderPayload(mockOrder);

console.log("Calculated Shipment Weight:", payload.shipment_weight);

// Expected: (0.5 * 2) + (0.2 * 1) + 0.08 (pkg) = 1.28
const expected = "1.28";

if (payload.shipment_weight === expected) {
    console.log("✅ SUCCESS: Weight calculation is correct!");
} else {
    console.error(`❌ FAILED: Expected ${expected}, got ${payload.shipment_weight}`);
}

console.log("Payload:", JSON.stringify(payload, null, 2));

// Test Minimum Weight
const smallOrder = { ...mockOrder, items: [{ name: "Small", quantity: 1, weight: 0.001 }] };
const smallPayload = formatOrderPayload(smallOrder);
console.log("Small Order Weight:", smallPayload.shipment_weight);
// Expected: 0.001 + 0.08 = 0.081 -> Max(0.081, 0.1) -> 0.10
if (smallPayload.shipment_weight === "0.10") {
    console.log("✅ SUCCESS: Minimum weight enforcement correct!");
} else {
    console.error(`❌ FAILED: Expected 0.10, got ${smallPayload.shipment_weight}`);
}
