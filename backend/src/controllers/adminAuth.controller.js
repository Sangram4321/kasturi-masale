const adminLogin = (req, res) => {
  const { pin } = req.body;

  if (!pin) {
    return res.status(400).json({
      success: false,
      message: "PIN is required",
    });
  }

  if (pin === process.env.ADMIN_PIN) {
    return res.json({ success: true });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid PIN",
  });
};

module.exports = { adminLogin };
