const mongoose = require('mongoose');
const Order = require('../src/models/Order');
const User = require('../src/models/User');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed

const migrateOrderUserIds = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected.');

        console.log('🔍 Scanning for orders with ObjectId style userIds...');

        // Find orders where userId looks like a Mongo ObjectId (24 hex chars)
        // Note: This regex assumes standard ObjectIds. 
        // If your Firebase UIDs can also look like this (unlikely), valid UIDs might be caught, 
        // but the lookup against User collection by _id will filter them out (if no user found).
        const regex = /^[0-9a-fA-F]{24}$/;

        const orders = await Order.find({
            userId: { $regex: regex }
        });

        console.log(`📊 Found ${orders.length} orders to potentially migrate.`);

        let migrated = 0;
        let failed = 0;
        let skipped = 0;

        for (const order of orders) {
            if (!order.userId) continue;

            try {
                // Try to find user by this ID
                // We use mongoose.Types.ObjectId to ensure it's treated as an ID, though findById handles strings.
                const user = await User.findById(order.userId);

                if (user) {
                    // User found! Update order to use Firebase UID
                    if (user.uid) {
                        const oldId = order.userId;
                        order.userId = user.uid;
                        await order.save();
                        console.log(`✅ Migrated Order ${order.orderId}: ${oldId} -> ${user.uid}`);
                        migrated++;
                    } else {
                        console.warn(`⚠️ User found for Order ${order.orderId} but has no UID! User ID: ${order.userId}`);
                        skipped++;
                    }
                } else {
                    console.warn(`❌ No User found for ID ${order.userId} in Order ${order.orderId}. Leaving as is.`);
                    failed++;
                }
            } catch (err) {
                console.error(`💥 Error migrating order ${order.orderId}:`, err.message);
                failed++;
            }
        }

        console.log('------------------------------------------------');
        console.log('🎉 Migration Complete');
        console.log(`✅ Migrated: ${migrated}`);
        console.log(`⚠️ Skipped: ${skipped}`);
        console.log(`❌ Failed/Not Found: ${failed}`);
        console.log('------------------------------------------------');

        process.exit(0);

    } catch (error) {
        console.error('❌ Migration Failed:', error);
        process.exit(1);
    }
};

migrateOrderUserIds();
