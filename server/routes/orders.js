const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { authOptional, requireAuth, requireAdmin } = require('../middleware/auth');
const { sendOrderConfirmationEmail, sendStatusUpdateEmail, sendReturnApprovalEmail, sendCustomEmail } = require('../utils/emailService');
const { createOrder: createShiprocketOrder } = require('../utils/shiprocketService');
const SiteSetting = require('../models/SiteSetting');

const ALLOWED_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'returned', 'cancelled'];

// Helper to create order in ShipRocket
async function createShiprocketShipment(order) {
  try {
    const settings = await SiteSetting.findOne();
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

// ========== POST ROUTES (must come before GET /:id) ==========

// Create order
router.post('/', authOptional, async (req, res) => {
  try {
    const body = req.body || {};

    const name = body.name || body.customer?.name || '';
    const phone = body.phone || body.customer?.phone || '';
    const address = body.address || body.customer?.address || '';
    const streetAddress = body.streetAddress || body.customer?.streetAddress || '';
    const city = body.city || body.customer?.city || '';
    const state = body.state || body.customer?.state || '';
    const pincode = body.pincode || body.customer?.pincode || '';
    const landmark = body.landmark || body.customer?.landmark || '';
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) return res.status(400).json({ ok: false, message: 'No items' });

    if (!city || !state || !pincode) return res.status(400).json({ ok: false, message: 'City, state and pincode are required' });
    const pinOk = /^\d{4,8}$/.test(String(pincode));
    if (!pinOk) return res.status(400).json({ ok: false, message: 'Invalid pincode' });

    // compute total server-side if not supplied or invalid
    const computed = items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0), 0);
    const total = typeof body.total === 'number' && body.total > 0 ? body.total : computed;

    const paymentMethod = (body.paymentMethod || body.payment || 'COD').toString();

    let status = 'pending';
    if (typeof body.status === 'string' && ALLOWED_STATUSES.includes(body.status)) {
      status = body.status;
    }

    const upi = (paymentMethod === 'UPI' && body.upi && typeof body.upi === 'object')
      ? { payerName: body.upi.payerName || '', txnId: body.upi.txnId || '' }
      : undefined;

    // Decrement inventory for each item with per-size tracking and color inventory
    // Also include per-product discount in order items
    const Product = require('../models/Product');
    const enrichedItems = [];

    // Fetch all products in one query (optimization)
    const productIds = items.map(item => item.id || item.productId).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map();
    products.forEach(p => productMap.set(p._id.toString(), p));

    for (const item of items) {
      let enrichedItem = { ...item };
      const productId = item.id || item.productId;

      if (productId) {
        const product = productMap.get(productId.toString());

        if (product) {
          // Add product discount to order item
          if (product.discount && product.discount.value > 0) {
            enrichedItem.discount = product.discount;
            const itemPrice = Number(item.price || 0);
            if (product.discount.type === 'percentage') {
              enrichedItem.discountAmount = itemPrice * (product.discount.value / 100);
            } else {
              enrichedItem.discountAmount = product.discount.value;
            }
          }

          const requestedQty = Number(item.qty || 1);

          // Check color inventory if color is specified
          if (item.color && Array.isArray(product.colorInventory)) {
            const colorIdx = product.colorInventory.findIndex(c => c.color === item.color);
            if (colorIdx !== -1) {
              const currentQty = product.colorInventory[colorIdx].qty;
              if (currentQty < requestedQty) {
                return res.status(409).json({
                  ok: false,
                  message: `Insufficient stock for ${product.title} in color ${item.color}`,
                  itemId: item.id || item.productId,
                  availableQty: currentQty
                });
              }
              product.colorInventory[colorIdx].qty -= requestedQty;
            }
          }

          // If the product has per-size inventory and the item has a size
          if (product.trackInventoryBySize && item.size && Array.isArray(product.sizeInventory)) {
            const sizeIdx = product.sizeInventory.findIndex(s => s.code === item.size);
            if (sizeIdx !== -1) {
              const currentQty = product.sizeInventory[sizeIdx].qty;

              // Check if enough stock
              if (currentQty < requestedQty) {
                return res.status(409).json({
                  ok: false,
                  message: `Insufficient stock for ${product.title} size ${item.size}`,
                  itemId: item.id || item.productId,
                  availableQty: currentQty
                });
              }

              // Decrement the size inventory
              product.sizeInventory[sizeIdx].qty -= requestedQty;
            }
          } else if (!product.trackInventoryBySize) {
            // Decrement general stock
            const currentStock = product.stock || 0;
            if (currentStock < requestedQty) {
              return res.status(409).json({
                ok: false,
                message: `Insufficient stock for ${product.title}`,
                itemId: item.id || item.productId,
                availableQty: currentStock
              });
            }
            product.stock -= requestedQty;
          }
        }
      }

      enrichedItems.push(enrichedItem);
    }

    // Save all products in bulk (optimization)
    await Product.bulkSave(products);

    const doc = new Order({
      userId: req.user ? req.user._id : undefined,
      name,
      phone,
      address,
      streetAddress,
      paymentMethod,
      city,
      state,
      pincode,
      landmark,
      items: enrichedItems,
      total,
      status,
      upi,
    });

    await doc.save();

    // Send order confirmation email for COD orders (async, don't block)
    if (paymentMethod === 'COD') {
      (async () => {
        try {
          let recipientEmail = null;
          let customerName = name || 'Customer';

          if (body.email) {
            recipientEmail = body.email;
          } else if (req.user && req.user._id) {
            const userObj = await User.findById(req.user._id);
            if (userObj) {
              if (userObj.email) recipientEmail = userObj.email;
              if (userObj.name || userObj.fullName) customerName = userObj.name || userObj.fullName;
            }
          }

          if (recipientEmail) {
            await sendOrderConfirmationEmail(doc, { email: recipientEmail, name: customerName });
            console.log(`COD order confirmation email sent to ${recipientEmail}`);
          }
        } catch (emailErr) {
          console.error('Failed to send COD order confirmation email:', emailErr);
        }
      })();
    }

    // Create shipment in ShipRocket for COD orders (async, don't block response)
    if (paymentMethod === 'COD') {
      (async () => {
        try {
          console.log('=== SHIPROCKET SHIPMENT CREATION START (COD) ===');
          const shiprocketResponse = await createShiprocketShipment(doc);
          if (shiprocketResponse) {
            console.log('✅ ShipRocket shipment created successfully for COD order');
          } else {
            console.log('ℹ️ ShipRocket shipment creation skipped or failed for COD order');
          }
          console.log('=== SHIPROCKET SHIPMENT CREATION END (COD) ===');
        } catch (shiprocketErr) {
          console.error('❌ Failed to create ShipRocket shipment for COD order:', shiprocketErr);
        }
      })();
    }

    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Send custom email
router.post('/send-mail', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { to, subject, html } = req.body || {};

    if (!to || !subject || !html) {
      return res.status(400).json({ ok: false, message: 'Missing required fields: to, subject, html' });
    }

    const result = await sendCustomEmail(to, subject, html);

    if (result.ok) {
      return res.json({ ok: true, message: 'Email sent', messageId: result.messageId });
    } else {
      return res.status(500).json({ ok: false, message: result.error });
    }
  } catch (e) {
    console.error('Send mail error:', e);
    return res.status(500).json({ ok: false, message: 'Failed to send email' });
  }
});

// Request return (by body)
router.post('/request-return', requireAuth, async (req, res) => {
  try {
    const { orderId, reason, refundMethod, refundUpiId, refundBankDetails, photoUrl } = req.body || {};
    if (!orderId) return res.status(400).json({ ok: false, message: 'Missing orderId' });
    if (!reason || !reason.trim()) return res.status(400).json({ ok: false, message: 'Return reason is required' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ ok: false, message: 'Order not found' });

    if (String(order.userId) !== String(req.user._id)) return res.status(403).json({ ok: false, message: 'Forbidden' });

    const deliveredAt = order.deliveredAt || (order.status === 'delivered' ? order.updatedAt : null);
    if (!deliveredAt || order.status !== 'delivered') {
      return res.status(400).json({ ok: false, message: 'Return can only be requested for delivered orders' });
    }
    const ms7d = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - new Date(deliveredAt).getTime() > ms7d) {
      return res.status(400).json({ ok: false, message: 'Return period expired.' });
    }

    order.returnReason = reason.trim();
    order.returnPhoto = typeof photoUrl === 'string' ? photoUrl.trim() : '';
    order.returnRequestedAt = new Date();
    order.returnStatus = 'Pending';
    order.refundMethod = refundMethod === 'bank' ? 'bank' : 'upi';
    order.refundAmount = order.total || 0;

    if (refundMethod === 'bank' && typeof refundBankDetails === 'object') {
      order.refundBankDetails = {
        accountHolderName: refundBankDetails.accountHolderName || '',
        bankName: refundBankDetails.bankName || '',
        accountNumber: refundBankDetails.accountNumber || '',
        ifscCode: refundBankDetails.ifscCode || '',
        branch: refundBankDetails.branch || '',
      };
    } else {
      order.refundUpiId = typeof refundUpiId === 'string' ? refundUpiId.trim() : '';
    }

    await order.save();

    return res.json({ ok: true, data: order, message: 'Return request submitted' });
  } catch (e) {
    console.error('Request return (body) error:', e);
    return res.status(500).json({ ok: false, message: 'Failed to submit return request' });
  }
});

// ========== GET ROUTES WITH SPECIFIC PATHS (must come before GET /:id) ==========

// Public tracking route - no auth required, returns limited info
router.get('/:id/track', async (req, res) => {
  try {
    const doc = await Order.findById(req.params.id).lean();
    if (!doc) {
      return res.status(404).json({ ok: false, message: 'Order not found' });
    }

    // Return limited public info (privacy protection)
    const publicOrderInfo = {
      _id: doc._id,
      status: doc.status,
      trackingId: doc.trackingId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      phone: doc.phone ? doc.phone.substring(doc.phone.length - 4) : '****', // Last 4 digits only
      city: doc.city,
      state: doc.state,
      items: doc.items?.map(item => ({
        title: item.title,
        qty: item.qty,
        image: item.image,
        // No price, specific address details, or full phone number shown for privacy
      }))
    };

    return res.json({ ok: true, data: publicOrderInfo });
  } catch (e) {
    console.error('Public track order error:', e);
    return res.status(500).json({ ok: false, message: 'Failed to find tracking information' });
  }
});

// List orders for current user (mine=1) or admin all
router.get('/', authOptional, async (req, res) => {
  try {
    const { mine, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(200, Number(limit));

    if (mine && String(mine) === '1') {
      if (!req.user) return res.status(401).json({ ok: false, message: 'Unauthorized' });
      const docs = await Order.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean();
      return res.json({ ok: true, data: docs });
    }

    // admin list
    if (!req.user) return res.status(401).json({ ok: false, message: 'Unauthorized' });
    if (req.user.role !== 'admin') return res.status(403).json({ ok: false, message: 'Forbidden' });
    const docs = await Order.find()
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();
    return res.json({ ok: true, data: docs });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Get user's orders
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(200, Number(limit));

    const docs = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();
    return res.json({ ok: true, data: docs });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Admin: list return requests
router.get('/returns', requireAuth, requireAdmin, async (req, res) => {
  try {
    const docs = await Order.find({ returnStatus: { $in: ['Pending', 'Approved', 'Rejected'] } })
      .populate('userId')
      .sort({ createdAt: -1 })
      .lean();
    console.log('📡 [OrderList] Returning return requests count:', docs.length);
    if (docs.length > 0) {
      console.log('📡 [OrderList] First row ID:', docs[0]._id, 'Status:', docs[0].returnStatus);
    }
    return res.json({ ok: true, data: docs });
  } catch (e) {
    console.error('List returns error:', e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// User: list my return requests
router.get('/mine-returns', requireAuth, async (req, res) => {
  try {
    const docs = await Order.find({ userId: req.user._id, returnStatus: { $in: ['Pending', 'Approved', 'Rejected'] } })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ ok: true, data: docs });
  } catch (e) {
    console.error('List my returns error:', e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Get best sellers (latest bought products)
router.get('/bestsellers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;

    // Get recent orders (any status except cancelled) sorted by creation date
    // This includes pending, paid, shipped, and delivered orders
    const recentOrders = await Order.find({
      status: { $nin: ['cancelled'] }
    })
      .sort({ createdAt: -1 })
      .limit(100) // Get more orders to have enough products
      .lean();

    // Extract unique products from order items
    const productMap = new Map();

    recentOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const productId = item.productId || item.id;
          if (productId) {
            if (!productMap.has(productId)) {
              productMap.set(productId, {
                productId: productId,
                title: item.title,
                price: item.price,
                image: item.image,
                lastOrderedAt: order.createdAt,
                orderCount: 0
              });
            }
            const product = productMap.get(productId);
            product.orderCount += (item.qty || 1);
            // Update to most recent order date
            if (new Date(order.createdAt) > new Date(product.lastOrderedAt)) {
              product.lastOrderedAt = order.createdAt;
            }
          }
        });
      }
    });

    // Convert to array and sort by most recent order date
    const bestSellers = Array.from(productMap.values())
      .sort((a, b) => new Date(b.lastOrderedAt) - new Date(a.lastOrderedAt))
      .slice(0, limit);

    // Fetch full product details
    const Product = require('../models/Product');
    const Review = require('../models/Review');
    const productIds = bestSellers.map(p => p.productId).filter(id => id);

    if (productIds.length === 0) {
      return res.json({ ok: true, data: [] });
    }

    const products = await Product.find({ _id: { $in: productIds } }).lean();

    // Fetch average ratings for all products
    const mongoose = require('mongoose');
    const ObjectId = mongoose.Types.ObjectId;

    // Convert productIds to ObjectIds, filtering out invalid ones
    const validProductIds = productIds
      .filter(id => id && mongoose.Types.ObjectId.isValid(id))
      .map(id => new ObjectId(id));

    let ratingAggregation = [];
    if (validProductIds.length > 0) {
      ratingAggregation = await Review.aggregate([
        {
          $match: {
            productId: { $in: validProductIds },
            status: 'published',
            approved: true
          }
        },
        {
          $group: {
            _id: '$productId',
            averageRating: { $avg: '$rating' },
            reviewCount: { $sum: 1 }
          }
        }
      ]);
    }

    // Create a map of productId to rating
    const ratingMap = new Map();
    ratingAggregation.forEach(item => {
      ratingMap.set(String(item._id), {
        rating: Math.round(item.averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: item.reviewCount
      });
    });

    // Map products with order info and ratings
    const enrichedProducts = bestSellers.map(bs => {
      const product = products.find(p => String(p._id) === String(bs.productId));
      const ratingInfo = ratingMap.get(String(bs.productId));

      if (product) {
        return {
          ...product,
          orderCount: bs.orderCount,
          lastOrderedAt: bs.lastOrderedAt,
          rating: ratingInfo?.rating,
          reviewCount: ratingInfo?.reviewCount || 0
        };
      }
      // If product not found in DB, return the item data we have
      return {
        _id: bs.productId,
        title: bs.title,
        price: bs.price,
        images: bs.image ? [bs.image] : [],
        image_url: bs.image,
        orderCount: bs.orderCount,
        lastOrderedAt: bs.lastOrderedAt,
        rating: ratingInfo?.rating,
        reviewCount: ratingInfo?.reviewCount || 0
      };
    }).filter(p => p !== null);

    return res.json({ ok: true, data: enrichedProducts });
  } catch (e) {
    console.error('Get best sellers error:', e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// ========== GET/PUT/POST ROUTES WITH /:id (can come before generic GET /:id) ==========

// Get one order (owner or admin)
router.get('/:id', authOptional, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Order.findById(id).lean();
    if (!doc) return res.status(404).json({ ok: false, message: 'Not found' });
    if (req.user && (String(req.user._id) === String(doc.userId) || req.user.role === 'admin')) {
      return res.json({ ok: true, data: doc });
    }
    return res.status(403).json({ ok: false, message: 'Forbidden' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Update status (admin only)
router.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ ok: false, message: 'Missing status' });
    if (!ALLOWED_STATUSES.includes(status)) return res.status(400).json({ ok: false, message: 'Invalid status' });
    const doc = await Order.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!doc) return res.status(404).json({ ok: false, message: 'Not found' });
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Alternate update route to support Admin UI (PUT /api/orders/:id { status })
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body || {};
    if (!status) return res.status(400).json({ ok: false, message: 'Missing status' });
    // Map common aliases from UI
    const map = { processing: 'paid', completed: 'delivered' };
    status = map[status] || status;
    if (!ALLOWED_STATUSES.includes(status)) return res.status(400).json({ ok: false, message: 'Invalid status' });
    const doc = await Order.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!doc) return res.status(404).json({ ok: false, message: 'Not found' });
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Cancel order (user or admin)
router.post('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ ok: false, message: 'Order not found' });
    }

    // Check authorization: user can cancel their own order, admin can cancel any
    if (String(order.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ ok: false, message: 'Forbidden' });
    }

    // Can only cancel if status is pending, cod_pending, or pending_verification
    const cancellableStatuses = ['pending', 'cod_pending', 'pending_verification'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({ ok: false, message: 'Order cannot be cancelled in current status' });
    }

    order.status = 'cancelled';
    if (reason) order.cancellationReason = reason;
    await order.save();

    return res.json({ ok: true, data: order });
  } catch (e) {
    console.error('Cancel order error:', e);
    return res.status(500).json({ ok: false, message: 'Failed to cancel order' });
  }
});

// Send order confirmation email
router.post('/:id/email', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('userId');

    if (!order) {
      return res.status(404).json({ ok: false, message: 'Order not found' });
    }

    // Check authorization
    if (String(order.userId._id) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ ok: false, message: 'Forbidden' });
    }

    const user = order.userId;
    const result = await sendOrderConfirmationEmail(order, user);

    if (result.ok) {
      return res.json({ ok: true, message: 'Confirmation email sent', messageId: result.messageId });
    } else {
      return res.status(500).json({ ok: false, message: result.error });
    }
  } catch (e) {
    console.error('Send email error:', e);
    return res.status(500).json({ ok: false, message: 'Failed to send email' });
  }
});

// Request return (by URL)
router.post('/:id/request-return', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, refundMethod, refundUpiId, refundBankDetails, photoUrl } = req.body || {};

    if (!reason || !reason.trim()) {
      return res.status(400).json({ ok: false, message: 'Return reason is required' });
    }

    // Validate refund method and details
    if (refundMethod === 'bank') {
      if (!refundBankDetails || typeof refundBankDetails !== 'object') {
        return res.status(400).json({ ok: false, message: 'Bank details are required for bank transfer' });
      }
      if (!refundBankDetails.accountHolderName || !refundBankDetails.accountHolderName.trim()) {
        return res.status(400).json({ ok: false, message: 'Account holder name is required' });
      }
      if (!refundBankDetails.bankName || !refundBankDetails.bankName.trim()) {
        return res.status(400).json({ ok: false, message: 'Bank name is required' });
      }
      if (!refundBankDetails.accountNumber || !refundBankDetails.accountNumber.trim()) {
        return res.status(400).json({ ok: false, message: 'Account number is required' });
      }
      if (!refundBankDetails.ifscCode || !refundBankDetails.ifscCode.trim()) {
        return res.status(400).json({ ok: false, message: 'IFSC code is required' });
      }
    } else if (refundMethod === 'upi') {
      if (!refundUpiId || !refundUpiId.trim()) {
        return res.status(400).json({ ok: false, message: 'UPI ID is required' });
      }
    } else {
      return res.status(400).json({ ok: false, message: 'Refund method is required (upi or bank)' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ ok: false, message: 'Order not found' });
    }

    // Check authorization
    if (String(order.userId) !== String(req.user._id)) {
      return res.status(403).json({ ok: false, message: 'Forbidden' });
    }

    // Must be delivered and within 7 days of delivery
    const deliveredAt = order.deliveredAt || (order.status === 'delivered' ? order.updatedAt : null);
    if (!deliveredAt || order.status !== 'delivered') {
      return res.status(400).json({ ok: false, message: 'Return can only be requested for delivered orders' });
    }
    const ms7d = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - new Date(deliveredAt).getTime() > ms7d) {
      return res.status(400).json({ ok: false, message: 'Return period expired.' });
    }

    order.returnReason = reason.trim();
    order.returnPhoto = typeof photoUrl === 'string' ? photoUrl.trim() : '';
    order.returnRequestedAt = new Date();
    order.returnStatus = 'Pending';
    order.refundMethod = refundMethod === 'bank' ? 'bank' : 'upi';
    order.refundAmount = order.total || 0;

    if (refundMethod === 'bank') {
      order.refundBankDetails = {
        accountHolderName: refundBankDetails.accountHolderName.trim(),
        bankName: refundBankDetails.bankName.trim(),
        accountNumber: refundBankDetails.accountNumber.trim(),
        ifscCode: refundBankDetails.ifscCode.trim(),
        branch: refundBankDetails.branch ? refundBankDetails.branch.trim() : '',
      };
    } else {
      order.refundUpiId = refundUpiId.trim();
    }

    await order.save();

    return res.json({ ok: true, data: order, message: 'Return request submitted' });
  } catch (e) {
    console.error('Request return error:', e);
    return res.status(500).json({ ok: false, message: 'Failed to submit return request' });
  }
});

// Admin: Update order (status, tracking number, return approval)
router.put('/:id/admin-update', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, returnStatus } = req.body || {};

    const order = await Order.findById(id).populate('userId');
    if (!order) {
      return res.status(404).json({ ok: false, message: 'Order not found' });
    }

    const previousStatus = order.status;

    // Update status if provided
    if (status && ALLOWED_STATUSES.includes(status)) {
      order.status = status;
      if (status === 'delivered') {
        order.deliveredAt = new Date();
      }
    }

    // Update tracking number if provided
    if (trackingNumber) {
      order.trackingNumber = trackingNumber.trim();
    }

    console.log('📝 [OrderUpdate] Updating order:', id, 'New returnStatus:', returnStatus);
    // Update return status if provided
    if (returnStatus && ['None', 'Pending', 'Processing', 'Completed', 'Approved', 'Rejected'].includes(returnStatus)) {
      console.log('📝 [OrderUpdate] Setting returnStatus to:', returnStatus);
      order.returnStatus = returnStatus;
      if (returnStatus === 'Completed' || returnStatus === 'Approved') {
        console.log('📝 [OrderUpdate] Setting order status to returned');
        order.status = 'returned';
      }
    }

    await order.save();
    console.log('📝 [OrderUpdate] Order saved successfully');

    // Send email on status change
    if (status && status !== previousStatus && order.userId && order.userId.email) {
      const user = order.userId;
      if (status === 'shipped' || status === 'delivered') {
        await sendStatusUpdateEmail(order, user, status);
      }
    }

    // Send email on return completion
    if ((returnStatus === 'Completed' || returnStatus === 'Processing') && order.userId && order.userId.email) {
      const user = order.userId;
      await sendReturnApprovalEmail(order, user);
    }

    return res.json({ ok: true, data: order, message: 'Order updated successfully' });
  } catch (e) {
    console.error('Admin update order error:', e);
    return res.status(500).json({ ok: false, message: 'Failed to update order' });
  }
});

module.exports = router;
