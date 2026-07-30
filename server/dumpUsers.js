const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb+srv://ishwarwebmok_db_user:webmok12345@cluster0.vrncv5n.mongodb.net/thekissan')
  .then(async () => {
    const users = await User.find().limit(5);
    console.log(JSON.stringify(users, null, 2));
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });
