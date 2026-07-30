require('dotenv').config();
const connectDB = require('./db');
const Order = require('./models/Order');

async function fixOrders() {
  await connectDB();
  const orders = await Order.find({});
  console.log('Total orders in DB:', orders.length);

  for (let order of orders) {
    if (order.deliveryCharge > 0) {
      const oldTotal = order.totalAmount;
      const itemsSum = order.items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
      order.deliveryCharge = 0;
      order.totalAmount = Math.max(0, itemsSum - (Number(order.discountAmount) || 0));
      await order.save();
      console.log('Fixed Order:', order.orderId, 'Old Total:', oldTotal, 'New Total:', order.totalAmount);
    }
  }
  process.exit(0);
}
fixOrders();
