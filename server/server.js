const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

const Admin = require('./models/Admin');
const connectDB = require('./db');

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: '10mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

// Uploaded images public access
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// Seed Admin User
const seedAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({
      email: 'thekissancity@gmail.com',
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(
        'KissanCity@2026',
        10
      );

      await Admin.create({
        email: 'thekissancity@gmail.com',
        password: hashedPassword,
      });

      console.log('Admin user seeded');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

// Routes
app.use('/auth', require('./routes/authRoutes'));

app.use(
  '/api/categories',
  require('./routes/categoryRoutes')
);

app.use(
  '/api/health',
  require('./routes/healthRoutes')
);

app.use(
  '/api/banners',
  require('./routes/bannerRoutes')
);

app.use(
  '/api/payment',
  require('./routes/paymentRoutes')
);

app.use(
  '/api/blogs',
  require('./routes/blogRoutes')
);

app.use(
  '/api/videos',
  require('./routes/videoRoutes')
);

app.use(
  '/api/about-home',
  require('./routes/aboutHomeRoutes')
);

app.use(
  '/api/products',
  require('./routes/productRoutes')
);

app.use(
  '/api/solar-inquiries',
  require('./routes/solarInquiryRoutes')
);

app.use(
  '/api/reviews',
  require('./routes/reviewRoutes')
);

app.use(
  '/api/user',
  require('./routes/userAuthRoutes')
);

app.use(
  '/api/orders',
  require('./routes/orderRoutes')
);

app.use(
  '/api/coupons',
  require('./routes/couponRoutes')
);

app.use(
  '/api/bulk-coupons',
  require('./routes/bulkCouponRoutes')
);

app.use(
  '/api/returns',
  require('./routes/returnRoutes')
);

app.use(
  '/api/tickets',
  require('./routes/ticketRoutes')
);

app.use(
  '/api/tickers',
  require('./routes/tickerRoutes')
);

app.use(
  '/api/contact-info',
  require('./routes/contactInfoRoutes')
);

app.use(
  '/api/inquiries',
  require('./routes/inquiryRoutes')
);

app.use(
  '/api/policies',
  require('./routes/policyRoutes')
);

app.use(
  '/api/farmers-experts',
  require('./routes/farmerExpertRoutes')
);

// Basic server test
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend server is working',
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);

  res.status(error.status || 500).json({
    success: false,
    message:
      error.message || 'Internal server error',
  });
});

// Start Server Function
const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();

    const PORT = process.env.PORT || 5005;
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();