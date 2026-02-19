const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Region = require('../models/Region');
const slugify = require('slugify');
const { authOptional, requireAuth, requireAdmin } = require('../middleware/auth');

// List products: supports active, featured, category, aliases (collection, categorySlug), q, sort, page, limit
router.get('/', authOptional, async (req, res) => {
  // Prevent caching of this endpoint
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  
  try {
    const {
      active,
      featured,
      isBestSeller,
      category,
      collection,
      categorySlug,
      q,
      gender,
      colors,
      color,
      sizes,
      size,
      minPrice,
      maxPrice,
      region,
    } = req.query;
    const limit = Number(req.query.limit || 50);
    const page = Number(req.query.page || 1);
    const sortParam = String(req.query.sort || ''); // e.g., createdAt:desc

    const filter = {};
    // By default, only return "active" products, but treat missing `active` as active for legacy docs.
    // Allow overriding with active=false or active=all.
    const andClauses = [];
    const activeStr = typeof active === 'undefined' ? undefined : String(active).toLowerCase();
    if (typeof active === 'undefined' || activeStr === 'true' || activeStr === '1') {
      andClauses.push({ $or: [{ active: true }, { active: { $exists: false } }] });
    } else if (activeStr === 'false' || activeStr === '0') {
      andClauses.push({ active: false });
    } else if (activeStr === 'all') {
      // no active filter
    }

    if (typeof featured !== 'undefined') {
      filter.featured = String(featured).toLowerCase() === 'true' || featured === '1';
    }

    if (typeof isBestSeller !== 'undefined') {
      filter.isBestSeller = String(isBestSeller).toLowerCase() === 'true' || isBestSeller === '1';
    }

    const escapeRegExp = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Category matching: accept slug or name (case-insensitive), resolve via Category model if possible
    const catParam = category || collection || categorySlug;
    if (catParam) {
      const raw = String(catParam);
      try {
        const catDoc = await Category.findOne({ $or: [
          { slug: raw },
          { name: new RegExp(`^${escapeRegExp(raw)}$`, 'i') },
        ] }).lean();
        if (catDoc && catDoc.name) {
          filter.$or = [
            { category: new RegExp(`^${escapeRegExp(catDoc.name)}$`, 'i') },
            { category: new RegExp(`^${escapeRegExp(raw)}$`, 'i') },
          ];
        } else {
          filter.category = new RegExp(`^${escapeRegExp(raw)}$`, 'i');
        }
      } catch {
        filter.category = new RegExp(`^${escapeRegExp(raw)}$`, 'i');
      }
    }

    // Region matching: accept slug or name (case-insensitive), resolve via Region model if possible
    if (region) {
      const raw = String(region);
      console.log('[products] Region filter requested:', raw);
      try {
        const regionDoc = await Region.findOne({ $or: [
          { slug: raw },
          { name: new RegExp(`^${escapeRegExp(raw)}$`, 'i') },
        ] }).lean();
        console.log('[products] Region found:', regionDoc);
        if (regionDoc && regionDoc._id) {
          filter.region = regionDoc._id;
          console.log('[products] Region filter applied:', regionDoc._id);
        }
      } catch (error) {
        console.log('[products] Region lookup error:', error);
        // If region lookup fails, try to find by slug directly
        const regionDoc = await Region.findOne({ slug: raw }).lean();
        if (regionDoc && regionDoc._id) {
          filter.region = regionDoc._id;
          console.log('[products] Region filter applied (fallback):', regionDoc._id);
        }
      }
    }

    if (q) {
      const qReg = new RegExp(String(q), 'i');
      filter.$or = Array.isArray(filter.$or)
        ? [...filter.$or, { title: qReg }, { category: qReg }]
        : [{ title: qReg }, { category: qReg }];
    }

    // Color filter (supports colors=Red or color=Red)
    const colorParam = colors || color;
    if (colorParam) {
      const raw = String(colorParam).trim();
      if (raw) {
        const escaped = escapeRegExp(raw);
        // `colors` is an array of strings; match any element (case-insensitive)
        filter.colors = new RegExp(`^${escaped}$`, 'i');
      }
    }

    // Size filter (supports sizes=M or size=M)
    const sizeParam = sizes || size;
    if (sizeParam) {
      const raw = String(sizeParam).trim();
      if (raw) {
        const escaped = escapeRegExp(raw);
        const sizeRegex = new RegExp(`^${escaped}$`, 'i');

        // If inventory-by-size is used, require qty > 0 for that size.
        // Also support legacy `sizes` array (array of strings).
        filter.$and = Array.isArray(filter.$and) ? filter.$and : [];
        filter.$and.push({
          $or: [
            { sizes: sizeRegex },
            {
              sizeInventory: {
                $elemMatch: {
                  qty: { $gt: 0 },
                  $or: [{ code: sizeRegex }, { label: sizeRegex }],
                },
              },
            },
          ],
        });
      }
    }

    // Price filter (minPrice/maxPrice)
    // NOTE: `Number.isNaN(undefined)` is false, so we must guard by checking the query param exists.
    const min = typeof minPrice !== 'undefined' && String(minPrice).trim() !== '' ? Number(minPrice) : undefined;
    const max = typeof maxPrice !== 'undefined' && String(maxPrice).trim() !== '' ? Number(maxPrice) : undefined;
    const hasMin = typeof min === 'number' && Number.isFinite(min);
    const hasMax = typeof max === 'number' && Number.isFinite(max);
    if (hasMin || hasMax) {
      filter.price = {};
      if (hasMin) filter.price.$gte = min;
      if (hasMax) filter.price.$lte = max;
    }

    // Merge any AND clauses (e.g., active + size filters) without clobbering existing $or usage.
    if (andClauses.length) {
      filter.$and = Array.isArray(filter.$and) ? filter.$and : [];
      filter.$and.push(...andClauses);
    }

    // Debug switch: hit /api/products?...&__debugProducts=1 to print query + filter + result length
    const debugProducts = String(req.query.__debugProducts || '') === '1';
    if (debugProducts) {
      console.log('[products] req.query =', req.query);
      console.log('[products] mongo filter =', JSON.stringify(filter));
    }
    
    // Always log when region filter is applied
    if (region) {
      console.log('[products] Final filter with region:', JSON.stringify(filter));
    }

    const l = Math.min(200, isNaN(limit) ? 50 : limit);
    const p = Math.max(1, isNaN(page) ? 1 : page);

    // Build sort
    let sort = undefined;
    if (sortParam) {
      const [field, dir] = String(sortParam).split(':');
      if (field) {
        const direction = String(dir || 'asc').toLowerCase() === 'desc' ? -1 : 1;
        sort = { [field]: direction };
      }
    }

    let query = Product.find(filter);
    if (sort) query = query.sort(sort);
    const docs = await query.skip((p - 1) * l).limit(l).lean();
    
    // Always log results when region filter is applied
    if (region) {
      console.log('[products] Query results with region filter:', {
        filter: JSON.stringify(filter),
        resultCount: docs.length,
        results: docs.map(d => ({ id: d._id, title: d.title, region: d.region }))
      });
      
      // Also log all products to see their region fields
      const allProducts = await Product.find({}).lean();
      console.log('[products] All products with regions:', 
        allProducts.map(p => ({ 
          id: p._id, 
          title: p.title, 
          region: p.region,
          regionType: typeof p.region
        }))
      );
    }
    
    // Debug: Check specific product data
    const menShorts = docs.find(p => p._id.toString() === '6981977ec651401afa9a1c10');
    if (menShorts) {
      console.log('🔍 DEBUG - Men Shorts data from DB:', {
        id: menShorts._id,
        image_url: menShorts.image_url,
        imagesCount: menShorts.images?.length || 0,
        updatedAt: menShorts.updatedAt
      });
    }
    
    if (debugProducts) console.log('[products] docs length =', Array.isArray(docs) ? docs.length : '(not array)');
    return res.json({ ok: true, data: docs });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Get by slug (new endpoint, preferred)
router.get('/slug/:slug', async (req, res) => {
  try {
    let { slug } = req.params;
    slug = String(slug).trim();

    // Try exact match first
    let doc = await Product.findOne({ slug, active: true }).lean();

    // If not found, try case-insensitive match
    if (!doc) {
      const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      doc = await Product.findOne({
        slug: new RegExp(`^${escapedSlug}$`, 'i'),
        active: true
      }).lean();
    }

    // If still not found, try searching in title as fallback
    if (!doc) {
      doc = await Product.findOne({
        title: new RegExp(slug, 'i'),
        active: true
      }).lean();
    }

    if (!doc) {
      return res.status(404).json({ ok: false, message: 'Product not found' });
    }

    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Get by id or slug (backward compatibility)
router.get('/:idOrSlug', async (req, res) => {
  // Prevent caching of this endpoint
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  
  try {
    const { idOrSlug } = req.params;
    let doc = null;
    if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) doc = await Product.findById(idOrSlug).lean();
    if (!doc) doc = await Product.findOne({ slug: idOrSlug }).lean();
    if (!doc) return res.status(404).json({ ok: false, message: 'Not found' });
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Create product (admin) — supports Admin UI payload mapping
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const body = req.body || {};
    const title = body.title || body.name;
    const price = typeof body.price !== 'undefined' ? Number(body.price) : undefined;
    if (!title || typeof price === 'undefined') return res.status(400).json({ ok: false, message: 'Missing fields' });

    // Generate slug from product name without any suffixes
    const slug = slugify(title, { lower: true, strict: true }) || `prod-${Date.now()}`;

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(409).json({ ok: false, message: 'A product with this name already exists. Please use a different name.' });
    }

    const payload = {
      title,
      slug,
      price,
      paragraph1: body.paragraph1 || undefined,
      paragraph2: body.paragraph2 || undefined,
      category: body.category || undefined,
      stock: typeof body.stock !== 'undefined' ? Number(body.stock) : 0,
      description: body.description || undefined,
      longDescription: body.longDescription || undefined,
      images: Array.isArray(body.images)
        ? body.images
        : body.image_url
        ? [body.image_url]
        : [],
      attributes: body.attributes || {},

      // ✅ NEW: colors from body.colors / body.color / attributes.colors
      colors: Array.isArray(body.colors)
        ? body.colors
        : body.color
        ? [body.color]
        : (Array.isArray(body.attributes?.colors) ? body.attributes.colors : []),

      // ✅ NEW: colorVariants with images and primary image support
      colorVariants: Array.isArray(body.colorVariants)
        ? body.colorVariants.map(cv => ({
            colorName: String(cv.colorName || '').trim(),
            colorCode: String(cv.colorCode || '').trim(),
            images: Array.isArray(cv.images) ? cv.images.filter(img => String(img).trim()) : [],
            primaryImageIndex: Number.isInteger(cv.primaryImageIndex) ? cv.primaryImageIndex : 0,
          })).filter(cv => cv.colorName)
        : [],

      sizes: Array.isArray(body.sizes) ? body.sizes : (Array.isArray(body.attributes?.sizes) ? body.attributes.sizes : []),
      trackInventoryBySize: typeof body.trackInventoryBySize === 'boolean' ? body.trackInventoryBySize : true,
      sizeInventory: Array.isArray(body.sizeInventory)
        ? body.sizeInventory.map(s => ({
            code: String(s.code || '').trim(),
            label: String(s.label || '').trim(),
            qty: Number(s.qty || 0)
          })).filter(s => s.code)
        : [],
      sizeChartUrl: body.sizeChartUrl || undefined,
      sizeChartTitle: body.sizeChartTitle || undefined,
      colorInventory: Array.isArray(body.colorInventory)
        ? body.colorInventory.map(c => ({
            color: String(c.color || '').trim(),
            qty: Number(c.qty || 0)
          })).filter(c => c.color)
        : [],
      discount: body.discount && typeof body.discount === 'object'
        ? {
            type: body.discount.type === 'percentage' ? 'percentage' : 'flat',
            value: Number(body.discount.value || 0)
          }
        : { type: 'flat', value: 0 },
      highlights: Array.isArray(body.highlights)
        ? body.highlights.filter(h => String(h || '').trim()).slice(0, 8)
        : [],
      specs: Array.isArray(body.specs)
        ? body.specs.map(spec => ({
            key: String(spec.key || '').trim(),
            value: String(spec.value || '').trim()
          })).filter(spec => spec.key && spec.value)
        : [],
      sizeChart: body.sizeChart || undefined,
      colorImages: body.colorImages && typeof body.colorImages === 'object' ? body.colorImages : {},
      seo: body.seo !== undefined && typeof body.seo === 'object'
        ? {
            title: body.seo.title ? String(body.seo.title).trim() : undefined,
            description: body.seo.description ? String(body.seo.description).trim() : undefined,
            keywords: body.seo.keywords ? String(body.seo.keywords).trim() : undefined,
          }
        : { title: undefined, description: undefined, keywords: undefined },
      sizeFit: body.sizeFit && typeof body.sizeFit === 'object'
        ? {
            fit: body.sizeFit.fit ? String(body.sizeFit.fit).trim() : undefined,
            modelWearingSize: body.sizeFit.modelWearingSize ? String(body.sizeFit.modelWearingSize).trim() : undefined,
          }
        : { fit: undefined, modelWearingSize: undefined },
      faq: Array.isArray(body.faq)
        ? body.faq.map(f => ({
            question: String(f.question || '').trim(),
            answer: String(f.answer || '').trim()
          })).filter(f => f.question && f.answer)
        : [],
      active: typeof body.active === 'boolean' ? body.active : true,
      featured: typeof body.featured === 'boolean' ? body.featured : false,
      isBestSeller: typeof body.isBestSeller === 'boolean' ? body.isBestSeller : false,
      region: body.region || undefined,
    };

    // If categoryId/subcategoryId is provided by Admin UI, resolve to category name/slug
    try {
      const refId = body.subcategoryId || body.categoryId;
      if (refId) {
        const catDoc = await Category.findById(refId).lean();
        if (catDoc) payload.category = catDoc.name || catDoc.slug;
      }
    } catch (catErr) {}

    // If regionId is provided, resolve to region ObjectId
    try {
      const regionId = body.regionId;
      if (regionId) {
        const regionDoc = await Region.findById(regionId).lean();
        if (regionDoc) payload.region = regionDoc._id;
      }
    } catch (regionErr) {}

    const doc = await Product.create(payload);
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error(e);
    // If duplicate key still occurs, return a 409 with helpful message
    if (e && e.code === 11000 && e.keyValue && e.keyValue.slug) {
      return res.status(409).json({ ok: false, message: 'Duplicate slug', slug: e.keyValue.slug });
    }
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Update product (admin)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const updates = {};
    if (typeof body.name !== 'undefined') updates.title = body.name;
    if (typeof body.title !== 'undefined') updates.title = body.title;
    if (typeof body.description !== 'undefined') updates.description = body.description;
    if (typeof body.longDescription !== 'undefined') updates.longDescription = body.longDescription;
    if (typeof body.price !== 'undefined') updates.price = Number(body.price);
    if (typeof body.category !== 'undefined' && body.category) updates.category = body.category;
    if (typeof body.region !== 'undefined') updates.region = body.region;
    if (typeof body.stock !== 'undefined') updates.stock = Number(body.stock);
    if (typeof body.active !== 'undefined') updates.active = !!body.active;
    if (typeof body.featured !== 'undefined') updates.featured = !!body.featured;
    if (typeof body.isBestSeller !== 'undefined') updates.isBestSeller = !!body.isBestSeller;
    if (typeof body.paragraph1 !== 'undefined') updates.paragraph1 = body.paragraph1;
    if (typeof body.paragraph2 !== 'undefined') updates.paragraph2 = body.paragraph2;
    if (typeof body.image_url !== 'undefined') updates.image_url = body.image_url;
    if (Array.isArray(body.images)) updates.images = body.images;

    // NOTE: slug is NEVER updated. It's set once at creation and stays permanent.

    if (Array.isArray(body.sizes)) updates.sizes = body.sizes;

    // ✅ NEW: update colors
    if (Array.isArray(body.colors)) {
      updates.colors = body.colors;
    } else if (typeof body.color !== 'undefined') {
      updates.colors = Array.isArray(body.color) ? body.color : [body.color];
    }

    // ✅ NEW: update colorVariants with images and primary image
    if (Array.isArray(body.colorVariants)) {
      updates.colorVariants = body.colorVariants.map(cv => ({
        colorName: String(cv.colorName || '').trim(),
        colorCode: String(cv.colorCode || '').trim(),
        images: Array.isArray(cv.images) ? cv.images.filter(img => String(img).trim()) : [],
        primaryImageIndex: Number.isInteger(cv.primaryImageIndex) ? cv.primaryImageIndex : 0,
      })).filter(cv => cv.colorName);
    }
    // ✅ NEW: update quantityOptions
if (Array.isArray(body.quantityOptions)) {
  updates.quantityOptions = body.quantityOptions;
}
    if (Array.isArray(body.highlights)) updates.highlights = body.highlights.slice(0, 8);
    if (Array.isArray(body.specs)) {
      updates.specs = body.specs.map(spec => ({
        key: String(spec.key || '').trim(),
        value: String(spec.value || '').trim()
      })).filter(spec => spec.key && spec.value);
    }
    if (typeof body.trackInventoryBySize === 'boolean') updates.trackInventoryBySize = body.trackInventoryBySize;
    if (Array.isArray(body.sizeInventory)) {
      updates.sizeInventory = body.sizeInventory.map(s => ({
        code: String(s.code || '').trim(),
        label: String(s.label || '').trim(),
        qty: Number(s.qty || 0)
      })).filter(s => s.code);
    }
    if (Array.isArray(body.colorInventory)) {
      updates.colorInventory = body.colorInventory.map(c => ({
        color: String(c.color || '').trim(),
        qty: Number(c.qty || 0)
      })).filter(c => c.color);
    }
    if (body.colorImages !== undefined && typeof body.colorImages === 'object') {
      updates.colorImages = body.colorImages;
    }
    if (body.discount !== undefined && typeof body.discount === 'object') {
      updates.discount = {
        type: body.discount.type === 'percentage' ? 'percentage' : 'flat',
        value: Number(body.discount.value || 0)
      };
    }
    if (body.seo !== undefined && typeof body.seo === 'object') {
      updates.seo = {
        title: body.seo.title ? String(body.seo.title).trim() : undefined,
        description: body.seo.description ? String(body.seo.description).trim() : undefined,
        keywords: body.seo.keywords ? String(body.seo.keywords).trim() : undefined,
      };
    }
    if (body.sizeFit !== undefined && typeof body.sizeFit === 'object') {
      updates.sizeFit = {
        fit: body.sizeFit.fit ? String(body.sizeFit.fit).trim() : undefined,
        modelWearingSize: body.sizeFit.modelWearingSize ? String(body.sizeFit.modelWearingSize).trim() : undefined,
      };
    }
    if (typeof body.sizeChartUrl !== 'undefined') updates.sizeChartUrl = body.sizeChartUrl || undefined;
    if (typeof body.sizeChartTitle !== 'undefined') updates.sizeChartTitle = body.sizeChartTitle || undefined;
    if (body.sizeChart !== undefined) updates.sizeChart = body.sizeChart || undefined;
    if (Array.isArray(body.faq)) {
      updates.faq = body.faq.map(f => ({
        question: String(f.question || '').trim(),
        answer: String(f.answer || '').trim()
      })).filter(f => f.question && f.answer);
    }

    // If Admin UI sent categoryId/subcategoryId, resolve to category name/slug
    try {
      const refId = body.subcategoryId || body.categoryId;
      if (refId) {
        const catDoc = await Category.findById(refId).lean();
        if (catDoc) updates.category = catDoc.name || catDoc.slug;
      }
    } catch (catErr) {}

    // If regionId is provided, resolve to region ObjectId
    try {
      const regionId = body.regionId;
      if (regionId) {
        const regionDoc = await Region.findById(regionId).lean();
        if (regionDoc) updates.region = regionDoc._id;
      }
    } catch (regionErr) {}

    const doc = await Product.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!doc) return res.status(404).json({ ok: false, message: 'Not found' });
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// PATCH endpoint for partial updates (e.g., just details)
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const updates = {};

    // Only update fields that are explicitly provided
    if (typeof body.longDescription !== 'undefined') updates.longDescription = body.longDescription;
    if (Array.isArray(body.highlights)) updates.highlights = body.highlights.slice(0, 8);
    if (Array.isArray(body.specs)) {
      updates.specs = body.specs.map(spec => ({
        key: String(spec.key || '').trim(),
        value: String(spec.value || '').trim()
      })).filter(spec => spec.key && spec.value);
    }
    if (typeof body.trackInventoryBySize === 'boolean') updates.trackInventoryBySize = body.trackInventoryBySize;
    if (Array.isArray(body.sizeInventory)) {
      updates.sizeInventory = body.sizeInventory.map(s => ({
        code: String(s.code || '').trim(),
        label: String(s.label || '').trim(),
        qty: Number(s.qty || 0)
      })).filter(s => s.code);
    }
    if (Array.isArray(body.colorInventory)) {
      updates.colorInventory = body.colorInventory.map(c => ({
        color: String(c.color || '').trim(),
        qty: Number(c.qty || 0)
      })).filter(c => c.color);
    }
    if (body.colorImages !== undefined && typeof body.colorImages === 'object') {
      updates.colorImages = body.colorImages;
    }
    if (body.discount !== undefined && typeof body.discount === 'object') {
      updates.discount = {
        type: body.discount.type === 'percentage' ? 'percentage' : 'flat',
        value: Number(body.discount.value || 0)
      };
    }
    if (body.seo !== undefined && typeof body.seo === 'object') {
      updates.seo = {
        title: body.seo.title ? String(body.seo.title).trim() : undefined,
        description: body.seo.description ? String(body.seo.description).trim() : undefined,
        keywords: body.seo.keywords ? String(body.seo.keywords).trim() : undefined,
      };
    }
    if (typeof body.sizeChartUrl !== 'undefined') updates.sizeChartUrl = body.sizeChartUrl || undefined;
    if (typeof body.sizeChartTitle !== 'undefined') updates.sizeChartTitle = body.sizeChartTitle || undefined;
    if (body.sizeChart !== undefined) updates.sizeChart = body.sizeChart || undefined;

    if (Array.isArray(body.colors)) {
      updates.colors = body.colors;
    } else if (typeof body.color !== 'undefined') {
      updates.colors = Array.isArray(body.color) ? body.color : [body.color];
    }

    // ✅ NEW: update colorVariants with images and primary image
    if (Array.isArray(body.colorVariants)) {
      updates.colorVariants = body.colorVariants.map(cv => ({
        colorName: String(cv.colorName || '').trim(),
        colorCode: String(cv.colorCode || '').trim(),
        images: Array.isArray(cv.images) ? cv.images.filter(img => String(img).trim()) : [],
        primaryImageIndex: Number.isInteger(cv.primaryImageIndex) ? cv.primaryImageIndex : 0,
      })).filter(cv => cv.colorName);
    }

    const doc = await Product.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!doc) return res.status(404).json({ ok: false, message: 'Not found' });
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Get related products by category and price range
router.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(Number(req.query.limit || 8), 20);

    const product = await Product.findById(id).lean();
    if (!product) return res.status(404).json({ ok: false, message: 'Product not found' });

    const basePrice = Number(product.price || 0);
    const priceRange = basePrice * 0.5;
    const priceFilter = {
      $gte: Math.max(0, basePrice - priceRange),
      $lte: basePrice + priceRange,
    };

    // First, try to find products by category (case-insensitive)
    if (product.category) {
      const categoryRegex = new RegExp(`^${product.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      const filter = {
        active: true,
        _id: { $ne: id },
        category: categoryRegex,
        price: priceFilter,
      };

      const related = await Product.find(filter).limit(limit).lean();
      if (related.length > 0) {
        return res.json({ ok: true, data: related });
      }
    }

    // Fallback: if no category products found or no category, find by price range only
    const fallbackFilter = {
      active: true,
      _id: { $ne: id },
      price: priceFilter,
    };

    const related = await Product.find(fallbackFilter).limit(limit).lean();
    return res.json({ ok: true, data: related });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Soft delete
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Product.findByIdAndUpdate(id, { active: false }, { new: true }).lean();
    if (!doc) return res.status(404).json({ ok: false, message: 'Not found' });
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

module.exports = router;

