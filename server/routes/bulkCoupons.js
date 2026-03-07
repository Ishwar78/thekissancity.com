const express = require('express');
const router = express.Router();
const BulkCoupon = require('../models/BulkCoupon');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Send bulk coupon emails
const sendBulkCouponEmails = async (coupon, recipients) => {
  const emailPromises = recipients.map(async (recipient) => {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient.email,
        subject: `Special Coupon: ${coupon.name}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #2d6a4f 0%, #6b4423 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">🎉 Exclusive Coupon for You!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Special discount from Kisaan City</p>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin: 20px 0;">
              <h2 style="color: #2d6a4f; margin: 0 0 20px 0;">Your Coupon Details</h2>
              
              <div style="background: white; border: 2px dashed #2d6a4f; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Coupon Code</p>
                <p style="margin: 0; font-size: 32px; font-weight: bold; color: #2d6a4f; letter-spacing: 2px;">${coupon.code}</p>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div>
                  <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Discount Type</p>
                  <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">
                    ${coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                  </p>
                </div>
                <div>
                  <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Valid Until</p>
                  <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">
                    ${new Date(coupon.expiryDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              
              ${coupon.minOrderAmount > 0 ? `
                <p style="margin: 10px 0; color: #666; font-size: 14px;">
                  Minimum order amount: ₹${coupon.minOrderAmount.toLocaleString('en-IN')}
                </p>
              ` : ''}
              
              ${coupon.maxDiscountAmount ? `
                <p style="margin: 10px 0; color: #666; font-size: 14px;">
                  Maximum discount: ₹${coupon.maxDiscountAmount.toLocaleString('en-IN')}
                </p>
              ` : ''}
              
              ${coupon.offerText ? `
                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #2d6a4f; font-weight: bold;">${coupon.offerText}</p>
                </div>
              ` : ''}
              
              ${coupon.description ? `
                <p style="margin: 20px 0; color: #666; line-height: 1.6;">${coupon.description}</p>
              ` : ''}
              
              ${coupon.termsAndConditions ? `
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin: 0 0 10px 0; color: #856404;">Terms & Conditions</h4>
                  <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">${coupon.termsAndConditions}</p>
                </div>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/shop" 
                 style="background: #2d6a4f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Shop Now & Use Coupon
              </a>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
              <p>This coupon can be used ${coupon.usageLimitPerUser} time(s) per user.</p>
              <p>Total usage limit: ${coupon.usageLimit} users</p>
              <p>© 2024 Kisaan City. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${recipient.email}`);
      return { success: true, email: recipient.email };
    } catch (error) {
      console.error(`Failed to send email to ${recipient.email}:`, error);
      return { success: false, email: recipient.email, error: error.message };
    }
  });

  const results = await Promise.all(emailPromises);
  return results;
};

// POST /api/bulk-coupons - Create new bulk coupon
router.post('/', [requireAuth, requireAdmin], async (req, res) => {
  try {
    const {
      code,
      name,
      discountType,
      discountValue,
      minOrderAmount = 0,
      maxDiscountAmount,
      usageLimit,
      usageLimitPerUser = 1,
      offerText,
      description,
      termsAndConditions,
      expiryDate,
      isPublic = false,
      sendToUsers = false,
      recipientEmails = [],
      applicableProducts = [],
    } = req.body;

    // Validate input
    if (!code || !name || !discountType || discountValue === undefined || !usageLimit || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    if (discountType !== 'percentage' && discountType !== 'flat') {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount type',
      });
    }

    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount must be between 0 and 100',
      });
    }

    if (discountType === 'flat' && discountValue < 0) {
      return res.status(400).json({
        success: false,
        message: 'Flat discount must be positive',
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await BulkCoupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists',
      });
    }

    // Create bulk coupon
    const bulkCoupon = new BulkCoupon({
      code: code.toUpperCase(),
      name,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      usageLimitPerUser,
      offerText,
      description,
      termsAndConditions,
      expiryDate,
      isPublic,
      applicableProducts,
      createdBy: req.user.id,
    });

    // Add recipients if sending to users
    if (sendToUsers && recipientEmails.length > 0) {
      const recipients = recipientEmails.map(email => ({
        email: email.trim().toLowerCase(),
      }));

      // Find users by email
      const users = await User.find({ email: { $in: recipients.map(r => r.email) } });
      
      // Update recipients with user IDs
      recipients.forEach(recipient => {
        const user = users.find(u => u.email === recipient.email);
        if (user) {
          recipient.userId = user._id;
        }
      });

      bulkCoupon.sentTo = recipients;
    }

    await bulkCoupon.save();

    // Send emails if requested
    let emailResults = [];
    if (sendToUsers && bulkCoupon.sentTo.length > 0) {
      try {
        emailResults = await sendBulkCouponEmails(bulkCoupon, bulkCoupon.sentTo);
      } catch (emailError) {
        console.error('Email sending failed but coupon was created:', emailError);
        emailResults = [{ success: false, error: 'Email sending failed' }];
      }
    }

    res.status(201).json({
      success: true,
      message: 'Bulk coupon created successfully',
      data: bulkCoupon,
      emailResults,
    });
  } catch (error) {
    console.error('Error creating bulk coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/bulk-coupons - Get all bulk coupons (admin only)
router.get('/', [requireAuth, requireAdmin], async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    // Build query
    const query = {};
    
    if (status === 'active') {
      query.isActive = true;
      query.expiryDate = { $gt: new Date() };
    } else if (status === 'inactive') {
      query.$or = [
        { isActive: false },
        { expiryDate: { $lte: new Date() } }
      ];
    }

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const coupons = await BulkCoupon.find(query)
      .populate('createdBy', 'name email')
      .populate('sentTo.userId', 'name email')
      .populate('applicableProducts', 'title name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BulkCoupon.countDocuments(query);

    res.json({
      success: true,
      data: coupons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bulk coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/bulk-coupons/:id - Get single bulk coupon
router.get('/:id', [requireAuth, requireAdmin], async (req, res) => {
  try {
    const coupon = await BulkCoupon.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('sentTo.userId', 'name email')
      .populate('usedBy.userId', 'name email')
      .populate('applicableProducts', 'title name');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error('Error fetching bulk coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// PUT /api/bulk-coupons/:id - Update bulk coupon
router.put('/:id', [requireAuth, requireAdmin], async (req, res) => {
  try {
    const coupon = await BulkCoupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    const allowedUpdates = [
      'name', 'discountType', 'discountValue', 'minOrderAmount', 
      'maxDiscountAmount', 'usageLimit', 'usageLimitPerUser', 
      'offerText', 'description', 'termsAndConditions', 
      'expiryDate', 'isActive', 'isPublic', 'applicableProducts'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(coupon, updates);
    await coupon.save();
    
    // Populate applicableProducts for the response
    await coupon.populate('applicableProducts', 'title name');

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (error) {
    console.error('Error updating bulk coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// DELETE /api/bulk-coupons/:id - Delete bulk coupon
router.delete('/:id', [requireAuth, requireAdmin], async (req, res) => {
  try {
    const coupon = await BulkCoupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    await BulkCoupon.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting bulk coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// POST /api/bulk-coupons/:id/send-emails - Send coupon emails to additional users
router.post('/:id/send-emails', [requireAuth, requireAdmin], async (req, res) => {
  try {
    const { recipientEmails } = req.body;
    
    if (!recipientEmails || recipientEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recipient emails provided',
      });
    }

    const coupon = await BulkCoupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    // Prepare new recipients
    const newRecipients = recipientEmails.map(email => ({
      email: email.trim().toLowerCase(),
    }));

    // Find users by email
    const users = await User.find({ email: { $in: newRecipients.map(r => r.email) } });
    
    // Update recipients with user IDs
    newRecipients.forEach(recipient => {
      const user = users.find(u => u.email === recipient.email);
      if (user) {
        recipient.userId = user._id;
      }
    });

    // Check for duplicates
    const existingEmails = coupon.sentTo.map(s => s.email);
    const uniqueNewRecipients = newRecipients.filter(
      r => !existingEmails.includes(r.email)
    );

    if (uniqueNewRecipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All recipients have already received this coupon',
      });
    }

    // Send emails
    const emailResults = await sendBulkCouponEmails(coupon, uniqueNewRecipients);

    // Add recipients to coupon
    coupon.sentTo.push(...uniqueNewRecipients);
    await coupon.save();

    res.json({
      success: true,
      message: `Emails sent to ${uniqueNewRecipients.length} recipients`,
      data: {
        sentCount: uniqueNewRecipients.length,
        emailResults,
      },
    });
  } catch (error) {
    console.error('Error sending coupon emails:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// POST /api/bulk-coupons/validate - Validate and apply bulk coupon
router.post('/validate', requireAuth, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    
    if (!code || orderAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and order amount are required',
      });
    }

    const coupon = await BulkCoupon.findOne({ 
      code: code.toUpperCase(), 
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code',
      });
    }

    // Check if coupon is expired
    if (coupon.isExpired) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired',
      });
    }

    // Check if coupon is fully used
    if (coupon.isFullyUsed) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit has been reached',
      });
    }

    // Check if user can use this coupon
    const canUse = coupon.canUserUse(req.user.id, req.user.email);
    if (!canUse) {
      return res.status(400).json({
        success: false,
        message: 'You cannot use this coupon',
      });
    }

    // Check minimum order amount
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount.toLocaleString('en-IN')} required`,
      });
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderAmount);

    if (discountAmount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No discount applicable',
      });
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        coupon: {
          code: coupon.code,
          name: coupon.name,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount,
          offerText: coupon.offerText,
        },
        finalAmount: orderAmount - discountAmount,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// POST /api/bulk-coupons/apply - Apply bulk coupon to order
router.post('/apply', requireAuth, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    
    if (!code || orderAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and order amount are required',
      });
    }

    const coupon = await BulkCoupon.findOne({ 
      code: code.toUpperCase(), 
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code',
      });
    }

    // Validate coupon (same checks as validate endpoint)
    if (coupon.isExpired || coupon.isFullyUsed) {
      return res.status(400).json({
        success: false,
        message: coupon.isExpired ? 'Coupon has expired' : 'Coupon usage limit has been reached',
      });
    }

    const canUse = coupon.canUserUse(req.user.id, req.user.email);
    if (!canUse) {
      return res.status(400).json({
        success: false,
        message: 'You cannot use this coupon',
      });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount.toLocaleString('en-IN')} required`,
      });
    }

    const discountAmount = coupon.calculateDiscount(orderAmount);
    if (discountAmount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No discount applicable',
      });
    }

    // Mark coupon as used
    await coupon.markAsUsed(req.user.id, req.user.email, orderAmount, discountAmount);

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        coupon: {
          code: coupon.code,
          name: coupon.name,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount,
          offerText: coupon.offerText,
        },
        finalAmount: orderAmount - discountAmount,
      },
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/bulk-coupons/inspect/:couponCode - Inspect a specific coupon
router.get('/inspect/:couponCode', async (req, res) => {
  try {
    const { couponCode } = req.params;
    const coupon = await BulkCoupon.findOne({ code: couponCode.toUpperCase() }).populate('applicableProducts', 'title name');

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.json({ success: true, data: coupon });
  } catch (error) {
    console.error('Error inspecting coupon:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/bulk-coupons/check-applicability/:productId - Check coupon applicability and get alternatives
router.get('/check-applicability/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { couponCode } = req.query;

    console.log('Checking coupon applicability for productId:', productId, 'couponCode:', couponCode);

    // Find the product to validate it exists
    const Product = require('../models/Product');
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    let couponApplicable = false;
    let couponDetails = null;

    // Check specific coupon if provided
    if (couponCode) {
      console.log('Checking specific coupon:', couponCode);
      const coupon = await BulkCoupon.findOne({ 
        code: couponCode.toUpperCase(), 
        isActive: true,
        expiryDate: { $gt: new Date() }
      }).populate('applicableProducts', 'title name');

      if (coupon) {
        console.log('Found coupon:', coupon);
        // Check if coupon applies to this product
        const applicableProductIds = coupon.applicableProducts.map(p => p._id.toString());
        couponApplicable = applicableProductIds.length === 0 || applicableProductIds.includes(productId);
        console.log('Applicable product IDs:', applicableProductIds);
        console.log('Coupon applicable:', couponApplicable);
        
        couponDetails = {
          code: coupon.code,
          name: coupon.name,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          offerText: coupon.offerText,
          applicable: couponApplicable,
        };
      } else {
        console.log('Coupon not found or inactive');
      }
    }

    // Get alternative coupons (show common coupons if no bulk coupons available)
    console.log('Fetching alternative coupons...');
    const query = {
      isActive: true,
      expiryDate: { $gt: new Date() },
      // Show coupons that apply to ALL products (empty applicableProducts array)
      applicableProducts: { $size: 0 }
    };
    
    console.log('Alternative coupons query:', JSON.stringify(query, null, 2));
    
    const alternativeCoupons = await BulkCoupon.find(query)
    .populate('applicableProducts', 'title name')
    .select('code name discountType discountValue offerText applicableProducts')
    .limit(5)
    .lean();

    console.log('Found alternative coupons:', alternativeCoupons.length, alternativeCoupons);

    // If no bulk coupons found, include common coupons in response
    if (alternativeCoupons.length === 0) {
      console.log('No bulk coupons found, checking for common coupons...');
      try {
        const Coupon = require('../models/Coupon');
        const commonCoupons = await Coupon.find({
          isActive: true,
          expiryDate: { $gt: new Date() }
        })
        .select('code discount expiryDate offerText description termsAndConditions')
        .limit(5)
        .lean();

        console.log('Found common coupons:', commonCoupons);

        // Format common coupons to match bulk coupon structure
        const formattedCommonCoupons = commonCoupons.map(coupon => ({
          code: coupon.code,
          name: coupon.offerText || coupon.description || 'Discount Coupon',
          discountType: 'percentage',
          discountValue: coupon.discount,
          offerText: coupon.offerText,
          appliesToAllProducts: true,
        }));

        console.log('Formatted common coupons:', formattedCommonCoupons);

        res.json({
          success: true,
          data: {
            productId,
            couponChecked: couponDetails,
            applicableCoupons: formattedCommonCoupons,
            showCommonCoupons: true,
          },
        });
        return;
      } catch (error) {
        console.error('Error fetching common coupons:', error);
      }
    }

    const formattedAlternatives = alternativeCoupons.map(coupon => ({
      code: coupon.code,
      name: coupon.name,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      offerText: coupon.offerText,
      appliesToAllProducts: coupon.applicableProducts.length === 0,
    }));

    console.log('Formatted alternatives:', formattedAlternatives);

    res.json({
      success: true,
      data: {
        productId,
        couponChecked: couponDetails,
        applicableCoupons: formattedAlternatives,
      },
    });
  } catch (error) {
    console.error('Error checking coupon applicability:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

module.exports = router;
