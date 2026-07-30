const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://ishwarwebmok_db_user:webmok12345@cluster0.vrncv5n.mongodb.net/thekissan')
  .then(async () => {
    try {
      await mongoose.connection.collection('reviews').dropIndex('product_1_user_1');
      console.log('Index dropped successfully');
    } catch (e) {
      console.log('Error or index not found:', e.message);
    }
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });
