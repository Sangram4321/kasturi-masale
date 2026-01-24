const { v4: uuidv4 } = require("uuid");

module.exports = function generateOrderId() {
  return `KASTURI-${uuidv4().split("-")[0].toUpperCase()}`;
};
