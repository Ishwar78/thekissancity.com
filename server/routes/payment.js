// routes/payment.js
const path = require('path');
// Load .env here as well, so even if index.js didn't load it (or cwd differs), keys are present.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const SiteSetting = require('../models/SiteSetting');
const User = require('../models/User');
const { authOptional, requireAuth } = require('../middleware/auth');
const { sendOrderConfirmationEmail } = require('../utils/emailService');
const { createOrder: createShiprocketOrder } = require('../utils/shiprocketService');

/* ------------------------------- Helpers -------------------------------- */

async function getSettingsDoc() {
  let settings = await SiteSetting.findOne();
  if (!settings) settings = await SiteSetting.create({});
  return settings;
}

// Helper to create order in ShipRocket
async function createShiprocketShipment(order) {
  try {
    const settings = await getSettingsDoc();
    const shiprocketSettings = settings?.shipping?.shiprocket;

    if (!shiprocketSettings || !shiprocketSettings.enabled) {
      console.log('ShipRocket integration is disabled, skipping shipment creation');
      return null;
    }

    // Set environment variables for ShipRocket auth
    process.env.SHIPROCKET_API_EMAIL = shiprocketSettings.email;
    process.env.SHIPROCKET_API_PASSWORD = shiprocketSettings.password;
    process.env.SHIPROCKET_PICKUP_PINCODE = shiprocketSettings.pickupPincode || '110001';

    // Construct order data for ShipRocket
    const orderItems = order.items.map(item => ({
      name: item.title,
      sku: item.id || item.productId,
      units: item.qty,
      selling_price: Number(item.price),
      discount: Number(item.discountAmount || 0),
      tax: 0,
      hsn: '',
    }));

    const shiprocketOrderData = {
      order_id: String(order._id),
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: 'Primary',
      channel_id: shiprocketSettings.channelId || '',
      comment: '',
      billing_customer_name: order.name,
      billing_last_name: '',
      billing_address: order.address,
      billing_address_2: order.streetAddress || '',
      billing_city: order.city,
      billing_pincode: order.pincode,
      billing_state: order.state,
      billing_country: 'India',
      billing_email: '',
      billing_phone: order.phone,
      shipping_is_billing: true,
      shipping_customer_name: order.name,
      shipping_last_name: '',
      shipping_address: order.address,
      shipping_address_2: order.streetAddress || '',
      shipping_city: order.city,
      shipping_pincode: order.pincode,
      shipping_state: order.state,
      shipping_country: 'India',
      shipping_email: '',
      shipping_phone: order.phone,
      order_type: 'ESSENTIALS',
      payment_method: order.paymentMethod === 'COD' ? 'cod' : 'prepaid',
      sub_total: Number(order.total),
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
      order_items: orderItems,
    };

    const response = await createShiprocketOrder(shiprocketOrderData);

    if (response && response.order_id) {
      console.log(`ShipRocket order created successfully. Order ID: ${response.order_id}`);
      
      // Update order with tracking number if available
      if (response.shipment_id) {
        await Order.findByIdAndUpdate(order._id, {
          trackingNumber: response.shipment_id,
          trackingId: response.shipment_id,
        });
        console.log(`Updated order ${order._id} with tracking number: ${response.shipment_id}`);
      }

      return response;
    }

    return null;
  } catch (error) {
    console.error('Error creating ShipRocket shipment:', error.message);
    // Don't throw error - we don't want to fail the order if ShipRocket fails
    return null;
  }
}

// Return a live Razorpay instance (env first, DB fallback)
async function getRazorpayInstance() {
  const settings = await getSettingsDoc();
  const rz = settings?.razorpay || {};

  const keyId = process.env.RAZORPAY_KEY_ID || rz.keyId;
  const keySecret = process.env.RAZORPAY_KEY_SECRET || rz.keySecret;

  // helpful visibility in logs (no secrets printed)
  console.log('[RZP] hasKeyId:', !!keyId, 'hasKeySecret:', !!keySecret);

  if (!keyId || !keySecret) {
    throw new Error('Razorpay is not configured. Please contact support.');
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// Public key for frontend (env-first, DB fallback)
async function getPublicKeyId() {
  if (process.env.RAZORPAY_KEY_ID) return process.env.RAZORPAY_KEY_ID;
  const settings = await getSettingsDoc();
  const rz = settings.razorpay || {};
  return rz.keyId || '';
}

// Resolve currency: request → .env → DB → INR
async function resolveCurrency(reqCurrency) {
  if (reqCurrency && typeof reqCurrency === 'string') {
    return String(reqCurrency).toUpperCase();
  }
  const envCur = (process.env.RAZORPAY_CURRENCY || '').trim().toUpperCase();
  if (envCur) return envCur;
  const settings = await getSettingsDoc();
  const rz = settings.razorpay || {};
  return (rz.currency || 'INR').toUpperCase();
}

const toPaise = (amount) => Math.round(Number(amount) * 100);

/* --------------------------- Create Razorpay order ---------------------- */
router.post('/create-order', authOptional, async (req, res) => {
  try {
    const { amount, currency, items, appliedCoupon } = req.body || {};

    // Validate amount (expect rupees)
    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid amount provided' });
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, message: 'No items in order' });
    }

    // Instance + currency
    let rzp;
    try {
      rzp = await getRazorpayInstance();
    } catch (credError) {
      console.error('Razorpay configuration error:', credError.message);
      return res.status(500).json({ ok: false, message: 'Razorpay keys not configured.' });
    }

    const cur = await resolveCurrency(currency);

    // Amount in paise
    const amountInPaise = toPaise(parsedAmount);
    if (amountInPaise <= 0) {
      return res.status(400).json({ ok: false, message: 'Amount must be greater than zero' });
    }

    // Create order
    let razorpayOrder;
    try {
      razorpayOrder = await rzp.orders.create({
        amount: amountInPaise,
        currency: cur,
        receipt: `order_${Date.now()}`,
        notes: {
          items: Array.isArray(items) ? items.map(i => `${i.title} x${i.qty}`).join(', ') : '',
          appliedCoupon: appliedCoupon?.code || 'none',
        },
      });
    } catch (orderError) {
      console.error('Failed to create Razorpay order:', orderError?.message || orderError);
      return res.status(502).json({ ok: false, message: 'Failed to create order with payment provider' });
    }

    if (!razorpayOrder || !razorpayOrder.id) {
      console.error('Invalid Razorpay order response:', razorpayOrder);
      return res.status(502).json({ ok: false, message: 'Invalid response from payment provider' });
    }

    // Public key for frontend
    const keyId = await getPublicKeyId();
    if (!keyId) {
      console.error('Public Key ID not available');
      return res.status(500).json({ ok: false, message: 'Razorpay keys not configured.' });
    }

    return res.json({
      ok: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount, // paise
        currency: cur,
        keyId: keyId,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ ok: false, message: error?.message || 'Failed to create order' });
  }
});

/* -------------------------- Verify Razorpay payment --------------------- */
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      items,
      appliedCoupon,
      total,
      name,
      phone,
      address,
      streetAddress,
      city,
      state,
      pincode,
      landmark,
      shipping,
    } = req.body || {};

    if (!razorpayOrderId || !String(razorpayOrderId).trim()) {
      return res.status(400).json({ ok: false, message: 'Missing or invalid Razorpay order ID' });
    }
    if (!razorpayPaymentId || !String(razorpayPaymentId).trim()) {
      return res.status(400).json({ ok: false, message: 'Missing or invalid Razorpay payment ID' });
    }
    if (!razorpaySignature || !String(razorpaySignature).trim()) {
      return res.status(400).json({ ok: false, message: 'Missing or invalid payment signature' });
    }

    // Get secret (env-first)
    let keySecret;
    try {
      await getRazorpayInstance(); // ensures config exists
      const settings = await getSettingsDoc();
      keySecret = process.env.RAZORPAY_KEY_SECRET || settings?.razorpay?.keySecret;
      if (!keySecret) throw new Error('Key secret not found');
    } catch (e) {
      console.error('Razorpay configuration error:', e.message);
      return res.status(500).json({ ok: false, message: 'Payment verification system not configured' });
    }

    const expected = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expected !== razorpaySignature) {
      return res.status(400).json({ ok: false, message: 'Invalid payment signature' });
    }

    if (Array.isArray(items) && items.length > 0) {
      if (!city || !String(city).trim())  return res.status(400).json({ ok: false, message: 'City is required' });
      if (!state || !String(state).trim()) return res.status(400).json({ ok: false, message: 'State is required' });
      if (!String(pincode))                return res.status(400).json({ ok: false, message: 'Pincode is required' });
      if (!/^\d{4,8}$/.test(String(pincode).trim())) {
        return res.status(400).json({ ok: false, message: 'Pincode must be between 4-8 digits' });
      }

      // decrement inventory
      for (const item of items) {
        if (item?.id || item?.productId) {
          const productId = item.id || item.productId;
          const product = await Product.findById(productId);
          if (product) {
            if (product.trackInventoryBySize && item.size && Array.isArray(product.sizeInventory)) {
              const idx = product.sizeInventory.findIndex(s => s.code === item.size);
              if (idx !== -1) {
                const have = product.sizeInventory[idx].qty;
                const want = Number(item.qty || 1);
                if (have < want) {
                  return res.status(409).json({
                    ok: false,
                    message: `Insufficient stock for ${product.title} size ${item.size}`,
                    itemId: productId,
                    availableQty: have,
                  });
                }
                product.sizeInventory[idx].qty = have - want;
                await product.save();
              }
            } else if (!product.trackInventoryBySize) {
              const have = product.stock || 0;
              const want = Number(item.qty || 1);
              if (have < want) {
                return res.status(409).json({
                  ok: false,
                  message: `Insufficient stock for ${product.title}`,
                  itemId: productId,
                  availableQty: have,
                });
              }
              product.stock = have - want;
              await product.save();
            }
          }
        }
      }

      const order = new Order({
        userId: req.user._id,
        name: name || req.user.name,
        phone: phone || req.user.phone,
        address: address || req.user.address1,
        streetAddress: streetAddress || '',
        city: city || req.user.city,
        state: state || req.user.state,
        pincode: pincode || req.user.pincode,
        landmark: landmark || '',
        paymentMethod: 'Razorpay',
        items,
        shipping: Number(shipping || 0),
        total: total || 0,
        status: 'paid',
      });

      await order.save();

      // Send order confirmation email for Razorpay orders
      try {
        console.log('=== RAZORPAY ORDER EMAIL SENDING START ===');
        console.log('Order ID:', order._id);
        console.log('Request user:', req.user);
        console.log('Request user._id:', req.user._id);

        let recipientEmail = null;
        let customerName = name || req.user.name || 'Customer';

        if (req.user && req.user._id) {
          console.log('Fetching user from database...');
          const userObj = await User.findById(req.user._id);
          console.log('User object from DB:', userObj);
          if (userObj) {
            if (userObj.email) {
              recipientEmail = userObj.email;
              console.log('Found recipient email:', recipientEmail);
            } else {
              console.log('User object has no email field');
            }
            if (userObj.name || userObj.fullName) customerName = userObj.name || userObj.fullName;
          } else {
            console.log('User not found in database');
          }
        } else {
          console.log('No req.user or req.user._id');
        }

        if (recipientEmail) {
          console.log('Attempting to send order confirmation email to:', recipientEmail);
          console.log('Customer name:', customerName);
          const emailResult = await sendOrderConfirmationEmail(order, { email: recipientEmail, name: customerName });
          console.log('Email sending result:', emailResult);
          if (emailResult.ok) {
            console.log(`✅ Razorpay order confirmation email sent to ${recipientEmail}`);
          } else {
            console.log(`❌ Failed to send email. Error: ${emailResult.error}`);
          }
        } else {
          console.log('❌ No recipient email found for Razorpay order confirmation');
        }
        console.log('=== RAZORPAY ORDER EMAIL SENDING END ===');
      } catch (emailErr) {
        console.error('❌ Failed to send Razorpay order confirmation email:', emailErr);
      }

      // Create shipment in ShipRocket
      try {
        console.log('=== SHIPROCKET SHIPMENT CREATION START ===');
        const shiprocketResponse = await createShiprocketShipment(order);
        if (shiprocketResponse) {
          console.log('✅ ShipRocket shipment created successfully');
        } else {
          console.log('ℹ️ ShipRocket shipment creation skipped or failed');
        }
        console.log('=== SHIPROCKET SHIPMENT CREATION END ===');
      } catch (shiprocketErr) {
        console.error('❌ Failed to create ShipRocket shipment:', shiprocketErr);
      }

      return res.json({
        ok: true,
        message: 'Payment verified successfully',
        data: { order, razorpayPaymentId, razorpayOrderId },
      });
    }

    return res.json({
      ok: true,
      message: 'Payment verified successfully',
      data: { razorpayPaymentId, razorpayOrderId },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ ok: false, message: error?.message || 'Payment verification failed' });
  }
});

/* ---------------------------- Manual UPI submit ------------------------- */
router.post('/manual', requireAuth, async (req, res) => {
  try {
    const { transactionId, amount, paymentMethod, items, appliedCoupon, name, phone, address, streetAddress, city, state, pincode, landmark, shipping } = req.body || {};

    if (!transactionId || !String(transactionId).trim()) {
      return res.status(400).json({ ok: false, message: 'Valid transaction ID is required' });
    }

    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ ok: false, message: 'Valid amount is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, message: 'No items in order' });
    }

    if (!city || !String(city).trim())  return res.status(400).json({ ok: false, message: 'City is required' });
    if (!state || !String(state).trim()) return res.status(400).json({ ok: false, message: 'State is required' });
    if (!String(pincode))                return res.status(400).json({ ok: false, message: 'Pincode is required' });
    if (!/^\d{4,8}$/.test(String(pincode).trim())) {
      return res.status(400).json({ ok: false, message: 'Pincode must be between 4-8 digits' });
    }

    for (const item of items) {
      if (item?.id || item?.productId) {
        const productId = item.id || item.productId;
        const product = await Product.findById(productId);
        if (product) {
          if (product.trackInventoryBySize && item.size && Array.isArray(product.sizeInventory)) {
            const idx = product.sizeInventory.findIndex(s => s.code === item.size);
            if (idx !== -1) {
              const have = product.sizeInventory[idx].qty;
              const want = Number(item.qty || 1);
              if (have < want) {
                return res.status(409).json({
                  ok: false,
                  message: `Insufficient stock for ${product.title} size ${item.size}`,
                  itemId: productId,
                  availableQty: have,
                });
              }
              product.sizeInventory[idx].qty = have - want;
              await product.save();
            }
          } else if (!product.trackInventoryBySize) {
            const have = product.stock || 0;
            const want = Number(item.qty || 1);
            if (have < want) {
              return res.status(409).json({
                ok: false,
                message: `Insufficient stock for ${product.title}`,
                itemId: productId,
                availableQty: have,
              });
            }
            product.stock = have - want;
            await product.save();
          }
        }
      }
    }

    const order = new Order({
      userId: req.user._id,
      name: name || req.user.name,
      phone: phone || req.user.phone,
      address: address || req.user.address1,
      streetAddress: streetAddress || '',
      city: city || req.user.city,
      state: state || req.user.state,
      pincode: pincode || req.user.pincode,
      landmark: landmark || '',
      paymentMethod: paymentMethod || 'UPI',
      items,
      shipping: Number(shipping || 0),
      total: parsedAmount,
      status: 'pending',
      upi: {
        txnId: String(transactionId).trim(),
        payerName: req.user.name || '',
      },
    });

    await order.save();

    // Send order confirmation email for manual UPI orders
    try {
      let recipientEmail = null;
      let customerName = name || req.user.name || 'Customer';

      if (req.user && req.user._id) {
        const userObj = await User.findById(req.user._id);
        if (userObj) {
          if (userObj.email) recipientEmail = userObj.email;
          if (userObj.name || userObj.fullName) customerName = userObj.name || userObj.fullName;
        }
      }

      if (recipientEmail) {
        await sendOrderConfirmationEmail(order, { email: recipientEmail, name: customerName });
        console.log(`Manual UPI order confirmation email sent to ${recipientEmail}`);
      } else {
        console.log('No recipient email found for manual UPI order confirmation');
      }
    } catch (emailErr) {
      console.error('Failed to send manual UPI order confirmation email:', emailErr);
    }

    // Create shipment in ShipRocket for manual UPI orders
    try {
      console.log('=== SHIPROCKET SHIPMENT CREATION START (MANUAL UPI) ===');
      const shiprocketResponse = await createShiprocketShipment(order);
      if (shiprocketResponse) {
        console.log('✅ ShipRocket shipment created successfully for manual UPI order');
      } else {
        console.log('ℹ️ ShipRocket shipment creation skipped or failed for manual UPI order');
      }
      console.log('=== SHIPROCKET SHIPMENT CREATION END (MANUAL UPI) ===');
    } catch (shiprocketErr) {
      console.error('❌ Failed to create ShipRocket shipment for manual UPI order:', shiprocketErr);
    }

    return res.json({
      ok: true,
      data: order,
      message: 'Order created successfully. Your payment is pending verification.',
    });
  } catch (error) {
    console.error('Manual payment error:', error);
    return res.status(500).json({ ok: false, message: error?.message || 'Failed to process payment' });
  }
});

module.exports = router;
