// SLA Thresholds for Operational Alerts
// These control the "Red/Yellow" status indicators on the Admin Dashboard

module.exports = {
    // 1. Delivery Delays
    OFD_DELAY_HOURS: 24,       // Warning if Out For Delivery > 24h
    IN_TRANSIT_DAYS: 5,        // Warning if In Transit > 5 days

    // 2. Data Freshness
    TRACKING_STALE_MINUTES: 30, // Warning if Last Sync > 30 mins ago

    // 3. Risk Thresholds
    RTO_MAX_PERCENT_7D: 10,     // Alert if RTO rate (Last 7 Days) > 10%
};
