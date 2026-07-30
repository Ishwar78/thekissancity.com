const dotenv = require('dotenv');
dotenv.config();

let cachedToken = null;
let tokenExpiry = null;

/**
 * Login to Shiprocket API and retrieve JWT token
 */
async function getShiprocketToken() {
  // If static SHIPROCKET_TOKEN is configured in .env, use it directly
  if (process.env.SHIPROCKET_TOKEN && process.env.SHIPROCKET_TOKEN.trim()) {
    console.log('[SHIPROCKET AUTH] Using configured SHIPROCKET_TOKEN from .env');
    return process.env.SHIPROCKET_TOKEN.trim();
  }

  const email = process.env.SHIPROCKET_EMAIL || 'nutnectar0@gmail.com';
  const password = process.env.SHIPROCKET_PASSWORD || '6703@Yadav';

  // Return cached token if valid (valid for 9 days)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    console.log(`[SHIPROCKET AUTH] Requesting API token for email: ${email}`);

    const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.token) {
      const errorMsg = data.message || (data.errors ? JSON.stringify(data.errors) : `HTTP ${res.status}`);
      console.error('[SHIPROCKET AUTH FAILED]', errorMsg);

      if (errorMsg.toLowerCase().includes('access forbidden') || res.status === 403) {
        console.error('--------------------------------------------------');
        console.error('💡 SHIPROCKET HELP / SOLUTION:');
        console.error('Shiprocket API returned "Access forbidden".');
        console.error('To fix this, please follow ONE of these 2 options:');
        console.error('OPTION 1: Go to Shiprocket Panel (app.shiprocket.in) -> Settings -> API -> Add API User.');
        console.error('          Create an API User email/password and set SHIPROCKET_EMAIL & SHIPROCKET_PASSWORD in server/.env.');
        console.error('OPTION 2: Copy your Bearer Token directly from Shiprocket Settings -> API and set');
        console.error('          SHIPROCKET_TOKEN=your_token_here in server/.env file.');
        console.error('--------------------------------------------------');
      }

      throw new Error(`Shiprocket Auth Failed: ${errorMsg}`);
    }

    cachedToken = data.token;
    // Expire cache in 8 days (token is valid for 10 days)
    tokenExpiry = Date.now() + (8 * 24 * 60 * 60 * 1000);
    console.log('[SHIPROCKET AUTH SUCCESS] Token obtained successfully');
    return cachedToken;
  } catch (err) {
    console.error('[SHIPROCKET AUTH EXCEPTION]', err.message);
    throw err;
  }
}

/**
 * Format and Push Order to Shiprocket
 */
async function pushOrderToShiprocket(orderDoc) {
  try {
    const token = await getShiprocketToken();

    const orderId = orderDoc.orderId || `KC${String(Date.now()).slice(-8)}`;
    const address = orderDoc.shippingAddress || {};

    // Format date as YYYY-MM-DD HH:mm
    const dateObj = orderDoc.createdAt ? new Date(orderDoc.createdAt) : new Date();
    const formattedDate = dateObj.toISOString().replace('T', ' ').slice(0, 16);

    // Pickup location defaults to 'Home'
    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'Home';

    // Prepare Items list
    const orderItems = Array.isArray(orderDoc.items) && orderDoc.items.length > 0
      ? orderDoc.items.map((item, idx) => ({
          name: item.name || item.title || `Product Item ${idx + 1}`,
          sku: item.sku || item.productId || item._id || `SKU-${idx + 1}`,
          units: Number(item.qty || item.quantity) || 1,
          selling_price: String(item.price || item.sellingPrice || 0),
          discount: "0",
          tax: "0",
          hsn: 0
        }))
      : [{
          name: "Organic Kissan Product",
          sku: "KC-PROD-1",
          units: 1,
          selling_price: String(orderDoc.totalAmount || 0),
          discount: "0",
          tax: "0",
          hsn: 0
        }];

    const paymentMethodLower = String(orderDoc.paymentMethod || 'cod').toLowerCase();
    const isCod = paymentMethodLower === 'cod' || paymentMethodLower === 'cash on delivery';

    const payload = {
      order_id: orderId,
      order_date: formattedDate,
      pickup_location: pickupLocation, // 'Home'
      channel_id: "",
      comment: "Kissan City Order",
      billing_customer_name: address.fullName || address.name || "Kissan Customer",
      billing_last_name: "",
      billing_address: address.address || address.street || "Address Not Specified",
      billing_address_2: address.landmark || "",
      billing_city: address.city || "Delhi",
      billing_pincode: String(address.pincode || address.zip || "110001"),
      billing_state: address.state || "Delhi",
      billing_country: "India",
      billing_email: address.email || "customer@thekissancity.com",
      billing_phone: String(address.phone || address.mobile || "9876543210").replace(/[^0-9]/g, "").slice(-10),
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: isCod ? "COD" : "Prepaid",
      shipping_charges: Number(orderDoc.deliveryCharge) || 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: Number(orderDoc.discountAmount) || 0,
      sub_total: Number(orderDoc.totalAmount) || 0,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5
    };

    console.log(`[SHIPROCKET SYNC ATTEMPT] Order ID: ${orderId}, Pickup Location: ${pickupLocation}...`);

    const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      body: JSON.stringify(payload)
    });

    const resData = await res.json().catch(() => ({}));

    // Check if Shiprocket actually returned order_id or shipment_id
    const hasOrder = resData && (resData.order_id || resData.shipment_id);
    const isStatusCodeOk = resData && (resData.status_code === 1 || resData.status_code === 200 || !resData.status_code);

    if (!res.ok || !hasOrder || !isStatusCodeOk) {
      const errorMsg = resData.message || (resData.errors ? JSON.stringify(resData.errors) : `HTTP ${res.status}`);
      console.error(`[SHIPROCKET SYNC FAILED] Order ${orderId}:`, errorMsg);
      return {
        success: false,
        error: errorMsg,
        rawResponse: resData
      };
    }

    console.log(`[SHIPROCKET SYNC SUCCESS] Order ${orderId} synced! Shiprocket Order ID: ${resData.order_id}, Shipment ID: ${resData.shipment_id}`);

    return {
      success: true,
      shiprocketOrderId: resData.order_id,
      shipmentId: resData.shipment_id,
      status: resData.status,
      rawResponse: resData
    };
  } catch (error) {
    console.error(`[SHIPROCKET SYNC ERROR]`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  getShiprocketToken,
  pushOrderToShiprocket
};
