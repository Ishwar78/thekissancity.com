const mongoose = require('mongoose');
const Order = require('./server/models/Order');

mongoose.connect('mongodb://127.0.0.1:27017/kissan-city')
  .then(async () => {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(1).populate('user');
    console.log(JSON.stringify(orders, null, 2));
    mongoose.disconnect();
  })
  .catch(err => console.error(err));
