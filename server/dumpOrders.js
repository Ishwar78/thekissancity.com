const mongoose = require('mongoose');
const Order = require('./models/Order');

mongoose.connect('mongodb+srv://ishwarwebmok_db_user:webmok12345@cluster0.vrncv5n.mongodb.net/thekissan')
  .then(async () => {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(3);
    console.log("=== LATEST 3 ORDERS ===");
    console.log(JSON.stringify(orders, null, 2));
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });
