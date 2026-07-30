const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const router = express.Router();

// Multer Config for Product Images (Up to 10 images)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per image
});

// Utility to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// GET all products
router.get('/', async (req, res) => {
  try {
    const { category, health, search, active, bestSeller, newArrival } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (health) filter.healthRegions = { $in: [health] };
    if (active !== undefined) filter.isActive = active === 'true';
    if (bestSeller !== undefined) filter.isBestSeller = bestSeller === 'true';
    if (newArrival !== undefined) filter.isNewArrival = newArrival === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .populate('category', 'name imageUrl')
      .populate('healthRegions', 'name imageUrl')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
});

// GET product by ID or Slug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let product;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(idOrSlug)
        .populate('category', 'name imageUrl')
        .populate('healthRegions', 'name imageUrl');
    }

    if (!product) {
      product = await Product.findOne({ slug: idOrSlug })
        .populate('category', 'name imageUrl')
        .populate('healthRegions', 'name imageUrl');
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching single product:', error);
    res.status(500).json({ success: false, message: 'Server error fetching product' });
  }
});

// POST Create product (up to 10 images)
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    // Product data will be sent as JSON string in req.body.productData or as direct fields
    let rawData = req.body.productData ? JSON.parse(req.body.productData) : req.body;
    
    if (!rawData.name || !rawData.category) {
      return res.status(400).json({ success: false, message: 'Product Name and Category are required' });
    }

    // Process uploaded image files
    let uploadedImageUrls = [];
    if (req.files && req.files.length > 0) {
      uploadedImageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Reconstruct images in final sequence based on imagesOrder array from client
    let imagesOrder = Array.isArray(rawData.imagesOrder) ? rawData.imagesOrder : [];
    let finalImages = [];

    if (imagesOrder.length > 0) {
      let newIdx = 0;
      imagesOrder.forEach(item => {
        if (item.type === 'existing' && item.url) {
          finalImages.push(item.url);
        } else if (item.type === 'new' && uploadedImageUrls[newIdx]) {
          finalImages.push(uploadedImageUrls[newIdx]);
          newIdx++;
        }
      });
      // Append any leftover newly uploaded images
      while (newIdx < uploadedImageUrls.length) {
        finalImages.push(uploadedImageUrls[newIdx++]);
      }
    } else {
      finalImages = uploadedImageUrls;
    }

    // Generate slug
    let baseSlug = generateSlug(rawData.name);
    let slug = baseSlug;
    let count = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    const newProduct = new Product({
      name: rawData.name,
      slug: slug,
      category: rawData.category,
      healthRegions: Array.isArray(rawData.healthRegions) ? rawData.healthRegions : [],
      isActive: rawData.isActive !== undefined ? Boolean(rawData.isActive) : true,
      isBestSeller: Boolean(rawData.isBestSeller),
      isNewArrival: Boolean(rawData.isNewArrival),
      shortDescription: rawData.shortDescription || '',
      fullDescription: rawData.fullDescription || '',
      nutritionFacts: Array.isArray(rawData.nutritionFacts) ? rawData.nutritionFacts : [],
      images: finalImages.slice(0, 10),
      hasVariants: Boolean(rawData.hasVariants),
      variants: Array.isArray(rawData.variants) ? rawData.variants : [],
      simplePrice: rawData.simplePrice || {},
      faqs: Array.isArray(rawData.faqs) ? rawData.faqs : [],
      seo: rawData.seo || {}
    });

    await newProduct.save();

    const populated = await Product.findById(newProduct._id)
      .populate('category', 'name imageUrl')
      .populate('healthRegions', 'name imageUrl');

    res.status(201).json({ success: true, product: populated });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating product' });
  }
});

// PUT Update product
router.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    let rawData = req.body.productData ? JSON.parse(req.body.productData) : req.body;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Keep existing images specified by client + add newly uploaded images
    let existingImagesToKeep = Array.isArray(rawData.existingImages) ? rawData.existingImages : [];
    let newUploadedUrls = [];
    if (req.files && req.files.length > 0) {
      newUploadedUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    let imagesOrder = Array.isArray(rawData.imagesOrder) ? rawData.imagesOrder : [];
    let combinedImages = [];

    if (imagesOrder.length > 0) {
      let newIdx = 0;
      imagesOrder.forEach(item => {
        if (item.type === 'existing' && existingImagesToKeep.includes(item.url)) {
          combinedImages.push(item.url);
        } else if (item.type === 'new' && newUploadedUrls[newIdx]) {
          combinedImages.push(newUploadedUrls[newIdx]);
          newIdx++;
        }
      });
      // Append any leftover new uploads
      while (newIdx < newUploadedUrls.length) {
        combinedImages.push(newUploadedUrls[newIdx++]);
      }
    } else {
      combinedImages = [...existingImagesToKeep, ...newUploadedUrls].slice(0, 10);
    }

    // If name changed, update slug if needed
    let slug = existingProduct.slug;
    if (rawData.name && rawData.name !== existingProduct.name) {
      let baseSlug = generateSlug(rawData.name);
      slug = baseSlug;
      let count = 1;
      while (await Product.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${count++}`;
      }
    }

    const updateData = {
      name: rawData.name || existingProduct.name,
      slug: slug,
      category: rawData.category || existingProduct.category,
      healthRegions: Array.isArray(rawData.healthRegions) ? rawData.healthRegions : [],
      isActive: rawData.isActive !== undefined ? Boolean(rawData.isActive) : existingProduct.isActive,
      isBestSeller: rawData.isBestSeller !== undefined ? Boolean(rawData.isBestSeller) : existingProduct.isBestSeller,
      isNewArrival: rawData.isNewArrival !== undefined ? Boolean(rawData.isNewArrival) : existingProduct.isNewArrival,
      shortDescription: rawData.shortDescription !== undefined ? rawData.shortDescription : existingProduct.shortDescription,
      fullDescription: rawData.fullDescription !== undefined ? rawData.fullDescription : existingProduct.fullDescription,
      nutritionFacts: Array.isArray(rawData.nutritionFacts) ? rawData.nutritionFacts : [],
      images: combinedImages.slice(0, 10),
      hasVariants: rawData.hasVariants !== undefined ? Boolean(rawData.hasVariants) : existingProduct.hasVariants,
      variants: Array.isArray(rawData.variants) ? rawData.variants : [],
      simplePrice: rawData.simplePrice || existingProduct.simplePrice,
      faqs: Array.isArray(rawData.faqs) ? rawData.faqs : [],
      seo: rawData.seo || existingProduct.seo
    };

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true })
      .populate('category', 'name imageUrl')
      .populate('healthRegions', 'name imageUrl');

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating product' });
  }
});

// PATCH Quick toggle (active, bestSeller, newArrival)
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { field, value } = req.body;

    if (!['isActive', 'isBestSeller', 'isNewArrival'].includes(field)) {
      return res.status(400).json({ success: false, message: 'Invalid toggle field' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { [field]: value },
      { new: true }
    ).populate('category', 'name imageUrl').populate('healthRegions', 'name imageUrl');

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Error toggling product field:', error);
    res.status(500).json({ success: false, message: 'Server error toggling field' });
  }
});

// POST Decrement Product Stock on Order
router.post('/decrement-stock', async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, qty, selectedSize }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    for (const item of items) {
      const prodId = item.id || item._id;
      const qtyToReduce = Math.max(1, parseInt(item.qty) || 1);

      if (!prodId) continue;

      const product = await Product.findById(prodId);
      if (!product) continue;

      if (product.hasVariants && product.variants && product.variants.length > 0) {
        // Find matching variant by label or default to first
        let vIdx = product.variants.findIndex(v => v.label === item.selectedSize);
        if (vIdx === -1) vIdx = 0;

        const currentStock = product.variants[vIdx].stock || 0;
        product.variants[vIdx].stock = Math.max(0, currentStock - qtyToReduce);
      } else if (product.simplePrice) {
        const currentStock = product.simplePrice.stock || 0;
        product.simplePrice.stock = Math.max(0, currentStock - qtyToReduce);
      }

      await product.save();
    }

    res.json({ success: true, message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Error decrementing stock:', error);
    res.status(500).json({ success: false, message: 'Server error decrementing stock' });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
});

module.exports = router;
