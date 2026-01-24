const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

exports.schedulePickup = async (shipmentId, token) => {
  const res = await fetch(`${BASE_URL}/courier/generate/pickup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      shipment_id: shipmentId
    })
  });

  const data = await res.json();

  if (!data.pickup_status) {
    console.error("Pickup scheduling failed:", data);
  }

  return data;
};
