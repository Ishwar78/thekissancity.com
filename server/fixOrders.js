const mongoose = require('mongoose');
const Order = require('./models/Order');

mongoose.connect('mongodb+srv://ishwarwebmok_db_user:webmok12345@cluster0.vrncv5n.mongodb.net/thekissan')
  .then(async () => {
    const userId = "6a5f12a5836e823efbf70ad1";
    const result = await Order.updateMany(
      { user: { $exists: false } },
      { $set: { user: userId } }
    );
    console.log('Updated orders:', result);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });
