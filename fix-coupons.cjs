const mongoose = require('mongoose');
const BulkCoupon = require('./server/models/BulkCoupon');

// Update coupons to be public
async function makeCouponsPublic() {
  try {
    // Connect to MongoDB (adjust connection string as needed)
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisaancity', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Update HOLIOFF coupon
    const holioffResult = await BulkCoupon.updateOne(
      { code: 'HOLIOFF' },
      { $set: { isPublic: true } }
    );
    console.log('HOLIOFF updated:', holioffResult);

    // Update SAVE10 coupon
    const save10Result = await BulkCoupon.updateOne(
      { code: 'SAVE10' },
      { $set: { isPublic: true } }
    );
    console.log('SAVE10 updated:', save10Result);

    // Also make S2KXF0V0 public and apply to all products
    const s2kxf0v0Result = await BulkCoupon.updateOne(
      { code: 'S2KXF0V0' },
      { 
        $set: { 
          isPublic: true,
          applicableProducts: [] // Apply to all products
        }
      }
    );
    console.log('S2KXF0V0 updated:', s2kxf0v0Result);

    console.log('All coupons updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating coupons:', error);
    process.exit(1);
  }
}

makeCouponsPublic();
