const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // user can be guest, though currently we have user context
  },
  shippingAddress: {
    name: String,
    phone: String,
    email: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
    addressType: String
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      name: String,
      price: Number,
      qty: Number,
      size: String,
      image: String
    }
  ],
  paymentMethod: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryCharge: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  statusText: {
    type: String,
    default: 'Order Placed'
  },
  expectedDelivery: {
    type: Date
  },
  shiprocketOrderId: {
    type: String,
    default: null
  },
  shiprocketShipmentId: {
    type: String,
    default: null
  },
  shiprocketStatus: {
    type: String,
    enum: ['Pending', 'Synced', 'Failed', 'Not Configured'],
    default: 'Pending'
  },
  shiprocketSyncError: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
