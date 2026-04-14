const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Region = require('../models/Region');
const Review = require('../models/Review');
const slugify = require('slugify');
const { authOptional, requireAuth, requireAdmin } = require('../middleware/auth');

const DEBUG = process.env.NODE_ENV !== 'production';

// ─── Image validation ──────────────────────────────────────────────────────────
// Reject base64 images to prevent MongoDB bloat
function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  // Allow http/https URLs, reject data: (base64)
  return url.startsWith('http://') || url.startsWith('https://');
}

function validateImages(images) {
  if (!Array.isArray(images)) return [];
  const validImages = images.filter(img => isValidImageUrl(img));
  if (validImages.length !== images.length) {
    console.warn('[products] Rejected base64 images - only URLs allowed');
  }
  return validImages;
}

// ─── Card projection ──────────────────────────────────────────────────────────
// Only return fields needed to render product cards. This alone cuts payload
// size by 70-90% on products that have sizeChart, faq, specs, etc.
const CARD_FIELDS =
  '_id title slug price images image_url category featured active isBestSeller discount createdAt';

// ─── Homepage batch endpoint ──────────────────────────────────────────────────
// Replaces 4 separate requests (featured, new arrivals, categories, regions)
// with a single parallel Promise.all. Call this from the frontend instead.
//
// GET /api/products/homepage
// Returns { featured[], newArrivals[], categories[], regions[] }
router.get('/homepage', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=60'); // 1 min cache — adjustable

  try {
    const activeFilter = { $or: [{ active: true }, { active: { $exists: false } }] };

    const [featured, newArrivals, categories, regions] = await Promise.all([
      // Featured products — hits (featured, active) index
      Product.find({ featured: true, ...activeFilter })
        .select(CARD_FIELDS)
        .limit(12)
        .lean(),

      // New arrivals — hits (createdAt, active) index
      Product.find(activeFilter)
        .sort({ createdAt: -1, _id: -1 })
        .select(CARD_FIELDS)
        .limit(8)
        .lean(),

      // Categories with parent info
      require('../models/Category').find({}).lean(),

      // Regions
      require('../models/Region').find({}).lean(),
    ]);

    return res.json({
      ok: true,
      data: { featured, newArrivals, categories, regions },
    });
  } catch (e) {
    console.error('[homepage] batch error', e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// ─── Best sellers ─────────────────────────────────────────────────────────────
router.get('/bestsellers', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  try {
    const limit = Math.min(Number(req.query.limit || 8), 20);
    const activeFilter = { $or: [{ active: true }, { active: { $exists: false } }] };
    const docs = await Product.find({ isBestSeller: true, ...activeFilter })
      .select(CARD_FIELDS)
      .limit(limit)
      .lean();
    return res.json({ ok: true, data: docs });
  } catch (e) {
    console.error('[bestsellers]', e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// ─── List products ────────────────────────────────────────────────────────────
router.get('/', authOptional, async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');

  if (DEBUG) console.log('[PRODUCTS API] Query params:', req.query);

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

    // Determine limit — cap at 50 for list, 12 for featured
    const defaultLimit = featured ? 12 : 50;
    const l = Math.min(200, Number(req.query.limit || defaultLimit));
    const p = Math.max(1, Number(req.query.page || 1));
    const sortParam = String(req.query.sort || '');

    const filter = {};
    const andClauses = [];

    // Active filter
    const activeStr = typeof active === 'undefined' ? undefined : String(active).toLowerCase();
    if (typeof active === 'undefined' || activeStr === 'true' || activeStr === '1') {
      andClauses.push({ $or: [{ active: true }, { active: { $exists: false } }] });
    } else if (activeStr === 'false' || activeStr === '0') {
      andClauses.push({ active: false });
    }
    // activeStr === 'all' → no filter

    if (typeof featured !== 'undefined') {
      filter.featured = String(featured).toLowerCase() === 'true' || featured === '1';
    }

    if (typeof isBestSeller !== 'undefined') {
      filter.isBestSeller = String(isBestSeller).toLowerCase() === 'true' || isBestSeller === '1';
    }

    const escapeRegExp = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Category filter
    const catParam = category || collection || categorySlug;
    if (catParam) {
      let rawValues = Array.isArray(catParam) ? catParam : [String(catParam)];
      if (rawValues.length === 1 && rawValues[0].includes(',')) {
        rawValues = rawValues[0].split(',').map((v) => v.trim());
      }

      const $orConditions = [];
      const categoryDocs = await Category.find({
        $or: rawValues.flatMap((raw) => [
          { slug: raw },
          { name: new RegExp(`^${escapeRegExp(raw)}$`, 'i') },
        ]),
      }).lean();

      const categoryMap = new Map();
      categoryDocs.forEach((doc) => {
        if (doc.slug) categoryMap.set(doc.slug, doc);
        if (doc.name) categoryMap.set(doc.name.toLowerCase(), doc);
      });

      for (const raw of rawValues) {
        const catDoc = categoryMap.get(raw) || categoryMap.get(raw.toLowerCase());
        if (catDoc?.name) {
          $orConditions.push({ category: catDoc.name }, { subcategory: catDoc.name });
        } else {
          $orConditions.push({ category: raw }, { subcategory: raw });
        }
      }

      if ($orConditions.length > 0) filter.$or = $orConditions;
    }

    // Region filter
    if (region) {
      const raw = String(region);
      const regionDoc = await Region.findOne({
        $or: [{ slug: raw }, { name: new RegExp(`^${escapeRegExp(raw)}$`, 'i') }],
      }).lean();
      if (regionDoc?._id) filter.region = regionDoc._id;
    }

    // Text search
    if (q) {
      const qReg = new RegExp(String(q), 'i');
      filter.$or = Array.isArray(filter.$or)
        ? [...filter.$or, { title: qReg }, { category: qReg }]
        : [{ title: qReg }, { category: qReg }];
    }

    // Color filter
    const colorParam = colors || color;
    if (colorParam) {
      const raw = String(colorParam).trim();
      if (raw) filter.colors = new RegExp(`^${escapeRegExp(raw)}$`, 'i');
    }

    // Size filter
    const sizeParam = sizes || size;
    if (sizeParam) {
      const raw = String(sizeParam).trim();
      if (raw) {
        const sizeRegex = new RegExp(`^${escapeRegExp(raw)}$`, 'i');
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

    // Price filter
    const min = req.query.minPrice !== undefined && String(req.query.minPrice).trim() !== '' ? Number(req.query.minPrice) : undefined;
    const max = req.query.maxPrice !== undefined && String(req.query.maxPrice).trim() !== '' ? Number(req.query.maxPrice) : undefined;
    const hasMin = typeof min === 'number' && Number.isFinite(min);
    const hasMax = typeof max === 'number' && Number.isFinite(max);
    if (hasMin || hasMax) {
      filter.price = {};
      if (hasMin) filter.price.$gte = min;
      if (hasMax) filter.price.$lte = max;
    }

    // Merge AND clauses
    if (andClauses.length) {
      filter.$and = Array.isArray(filter.$and) ? [...filter.$and, ...andClauses] : andClauses;
    }

    // Build sort
    let sort;
    if (sortParam) {
      const [field, dir] = String(sortParam).split(':');
      if (field) {
        const direction = String(dir || 'asc').toLowerCase() === 'desc' ? -1 : 1;
        sort = field === 'createdAt' ? { [field]: direction, _id: direction } : { [field]: direction };
      }
    }

    // Determine which fields to return
    // skipReviews=true (default for cards) → lean card fields only
    // skipReviews=false → full document (product detail page)
    const skipReviews = req.query.skipReviews !== 'false';
    const projection = skipReviews ? CARD_FIELDS : undefined;

    let query = Product.find(filter);
    if (sort) query = query.sort(sort);
    if (projection) query = query.select(projection);

    const docs = await query.skip((p - 1) * l).limit(l).lean();

    return res.json({ ok: true, data: docs });
  } catch (e) {
    console.error('[products] API error:', e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// ─── Get by slug ──────────────────────────────────────────────────────────────
router.get('/slug/:slug', async (req, res) => {
  const skipReviews = req.query.skipReviews === 'true';
  try {
    let { slug } = req.params;
    slug = String(slug).trim();

    let doc = await Product.findOne({ slug, active: true }).lean();
    if (!doc) {
      const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      doc = await Product.findOne({ slug: new RegExp(`^${escapedSlug}$`, 'i'), active: true }).lean();
    }
    if (!doc) {
      doc = await Product.findOne({ title: new RegExp(slug, 'i'), active: true }).lean();
    }
    if (!doc) return res.status(404).json({ ok: false, message: 'Product not found' });

    if (!skipReviews) {
      const [stats] = await Review.aggregate([
        { $match: { productId: doc._id, status: 'published', approved: true } },
        { $group: { _id: '$productId', reviewCount: { $sum: 1 }, averageRating: { $avg: '$rating' } } },
      ]);
      doc.reviewCount = stats?.reviewCount ?? 0;
      doc.averageRating = stats ? Math.round(stats.averageRating * 10) / 10 : 0;
    }

    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// ─── Get by id or slug (backward compat) ─────────────────────────────────────
router.get('/:idOrSlug', async (req, res) => {
  const skipReviews = req.query.skipReviews === 'true';
  res.set('Cache-Control', skipReviews ? 'no-cache' : 'public, max-age=300');
  try {
    const { idOrSlug } = req.params;
    let doc = null;
    if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) doc = await Product.findById(idOrSlug).lean();
    if (!doc) doc = await Product.findOne({ slug: idOrSlug }).lean();
    if (!doc) return res.status(404).json({ ok: false, message: 'Not found' });

    if (!skipReviews) {
      const [stats] = await Review.aggregate([
        { $match: { productId: doc._id, status: 'published', approved: true } },
        { $group: { _id: '$productId', reviewCount: { $sum: 1 }, averageRating: { $avg: '$rating' } } },
      ]);
      doc.reviewCount = stats?.reviewCount ?? 0;
      doc.averageRating = stats ? Math.round(stats.averageRating * 10) / 10 : 0;
    }

    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// ─── Create (admin) ───────────────────────────────────────────────────────────
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const body = req.body || {};
    const title = body.title || body.name;
    const price = typeof body.price !== 'undefined' ? Number(body.price) : undefined;
    if (!title || typeof price === 'undefined')
      return res.status(400).json({ ok: false, message: 'Missing fields' });

    const slug = slugify(title, { lower: true, strict: true }) || `prod-${Date.now()}`;
    if (await Product.findOne({ slug })) {
      return res.status(409).json({ ok: false, message: 'A product with this name already exists.' });
    }

    const payload = buildPayload(body, { title, slug, price });

    try {
      if (body.categoryId) {
        const catDoc = await Category.findById(body.categoryId).lean();
        if (catDoc) { payload.category = catDoc.name || catDoc.slug; payload.categoryId = catDoc._id; }
      }
      if (body.subcategoryId) {
        const subcatDoc = await Category.findById(body.subcategoryId).lean();
        if (subcatDoc) { payload.subcategory = subcatDoc.name || subcatDoc.slug; payload.subcategoryId = subcatDoc._id; }
      }
      if (body.regionId) {
        const regionDoc = await Region.findById(body.regionId).lean();
        if (regionDoc) payload.region = regionDoc._id;
      }
    } catch {}

    const doc = await Product.create(payload);
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error(e);
    if (e?.code === 11000 && e?.keyValue?.slug)
      return res.status(409).json({ ok: false, message: 'Duplicate slug', slug: e.keyValue.slug });
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// ─── Update (admin) ───────────────────────────────────────────────────────────
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const updates = buildUpdates(body);

    try {
      if (body.categoryId) {
        const catDoc = await Category.findById(body.categoryId).lean();
        if (catDoc) { updates.category = catDoc.name || catDoc.slug; updates.categoryId = catDoc._id; }
      }
      if (body.subcategoryId) {
        const subcatDoc = await Category.findById(body.subcategoryId).lean();
        if (subcatDoc) { updates.subcategory = subcatDoc.name || subcatDoc.slug; updates.subcategoryId = subcatDoc._id; }
      }
      if (body.regionId) {
        const regionDoc = await Region.findById(body.regionId).lean();
        if (regionDoc) updates.region = regionDoc._id;
      }
    } catch {}

    const doc = await Product.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!doc) return res.status(404).json({ ok: false, message: 'Not found' });
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// ─── PATCH (admin) ────────────────────────────────────────────────────────────
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = buildPartialUpdates(req.body || {});
    const doc = await Product.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!doc) return res.status(404).json({ ok: false, message: 'Not found' });
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// ─── Related products ─────────────────────────────────────────────────────────
router.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(Number(req.query.limit || 8), 20);
    const product = await Product.findById(id).select('price category').lean();
    if (!product) return res.status(404).json({ ok: false, message: 'Product not found' });

    const basePrice = Number(product.price || 0);
    const priceRange = basePrice * 0.5;
    const priceFilter = { $gte: Math.max(0, basePrice - priceRange), $lte: basePrice + priceRange };

    let related = [];
    if (product.category) {
      const categoryRegex = new RegExp(`^${product.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      related = await Product.find({ active: true, _id: { $ne: id }, category: categoryRegex, price: priceFilter })
        .select(CARD_FIELDS)
        .limit(limit)
        .lean();
    }

    if (!related.length) {
      related = await Product.find({ active: true, _id: { $ne: id }, price: priceFilter })
        .select(CARD_FIELDS)
        .limit(limit)
        .lean();
    }

    return res.json({ ok: true, data: related });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// ─── Delete (admin) ───────────────────────────────────────────────────────────
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ ok: false, message: 'Product not found' });
    return res.json({ ok: true, message: 'Product permanently deleted', data: deleted });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPayload(body, { title, slug, price }) {
  const rawImages = Array.isArray(body.images) ? body.images : body.image_url ? [body.image_url] : [];
  const validatedImages = validateImages(rawImages);
  const validatedImageUrl = body.image_url && isValidImageUrl(body.image_url) ? body.image_url : (validatedImages[0] || undefined);

  return {
    title, slug, price,
    paragraph1: body.paragraph1,
    paragraph2: body.paragraph2,
    category: body.category,
    stock: typeof body.stock !== 'undefined' ? Number(body.stock) : 0,
    description: body.description,
    longDescription: body.longDescription,
    images: validatedImages,
    image_url: validatedImageUrl,
    attributes: body.attributes || {},
    colors: Array.isArray(body.colors) ? body.colors : body.color ? [body.color] : (Array.isArray(body.attributes?.colors) ? body.attributes.colors : []),
    colorVariants: normalizeColorVariants(body.colorVariants),
    sizes: Array.isArray(body.sizes) ? body.sizes : (Array.isArray(body.attributes?.sizes) ? body.attributes.sizes : []),
    trackInventoryBySize: typeof body.trackInventoryBySize === 'boolean' ? body.trackInventoryBySize : true,
    sizeInventory: normalizeSizeInventory(body.sizeInventory),
    sizeChartUrl: body.sizeChartUrl,
    sizeChartTitle: body.sizeChartTitle,
    colorInventory: normalizeColorInventory(body.colorInventory),
    discount: normalizeDiscount(body.discount),
    highlights: Array.isArray(body.highlights) ? body.highlights.filter(h => String(h || '').trim()).slice(0, 8) : [],
    specs: normalizeSpecs(body.specs),
    sizeChart: body.sizeChart,
    colorImages: (body.colorImages && typeof body.colorImages === 'object') ? body.colorImages : {},
    seo: normalizeSeo(body.seo),
    sizeFit: normalizeSizeFit(body.sizeFit),
    faq: normalizeFaq(body.faq),
    active: typeof body.active === 'boolean' ? body.active : true,
    featured: typeof body.featured === 'boolean' ? body.featured : false,
    isBestSeller: typeof body.isBestSeller === 'boolean' ? body.isBestSeller : false,
    region: body.region,
  };
}

function buildUpdates(body) {
  const u = {};
  if (body.name !== undefined) u.title = body.name;
  if (body.title !== undefined) u.title = body.title;
  if (body.description !== undefined) u.description = body.description;
  if (body.longDescription !== undefined) u.longDescription = body.longDescription;
  if (body.price !== undefined) u.price = Number(body.price);
  if (body.category !== undefined && body.category) u.category = body.category;
  if (body.region !== undefined) u.region = body.region;
  if (body.stock !== undefined) u.stock = Number(body.stock);
  if (body.active !== undefined) u.active = !!body.active;
  if (body.featured !== undefined) u.featured = !!body.featured;
  if (body.isBestSeller !== undefined) u.isBestSeller = !!body.isBestSeller;
  if (body.paragraph1 !== undefined) u.paragraph1 = body.paragraph1;
  if (body.paragraph2 !== undefined) u.paragraph2 = body.paragraph2;
  if (body.image_url !== undefined) {
    u.image_url = isValidImageUrl(body.image_url) ? body.image_url : undefined;
  }
  if (Array.isArray(body.images)) {
    u.images = validateImages(body.images);
  }
  if (Array.isArray(body.sizes)) u.sizes = body.sizes;
  if (Array.isArray(body.colors)) u.colors = body.colors;
  else if (body.color !== undefined) u.colors = Array.isArray(body.color) ? body.color : [body.color];
  if (Array.isArray(body.colorVariants)) u.colorVariants = normalizeColorVariants(body.colorVariants);
  if (Array.isArray(body.quantityOptions)) u.quantityOptions = body.quantityOptions;
  if (Array.isArray(body.highlights)) u.highlights = body.highlights.slice(0, 8);
  if (Array.isArray(body.specs)) u.specs = normalizeSpecs(body.specs);
  if (body.trackInventoryBySize !== undefined) u.trackInventoryBySize = body.trackInventoryBySize;
  if (Array.isArray(body.sizeInventory)) u.sizeInventory = normalizeSizeInventory(body.sizeInventory);
  if (Array.isArray(body.colorInventory)) u.colorInventory = normalizeColorInventory(body.colorInventory);
  if (body.colorImages !== undefined && typeof body.colorImages === 'object') u.colorImages = body.colorImages;
  if (body.discount !== undefined && typeof body.discount === 'object') u.discount = normalizeDiscount(body.discount);
  if (body.seo !== undefined && typeof body.seo === 'object') u.seo = normalizeSeo(body.seo);
  if (body.sizeFit !== undefined && typeof body.sizeFit === 'object') u.sizeFit = normalizeSizeFit(body.sizeFit);
  if (body.sizeChartUrl !== undefined) u.sizeChartUrl = body.sizeChartUrl || undefined;
  if (body.sizeChartTitle !== undefined) u.sizeChartTitle = body.sizeChartTitle || undefined;
  if (body.sizeChart !== undefined) u.sizeChart = body.sizeChart || undefined;
  if (Array.isArray(body.faq)) u.faq = normalizeFaq(body.faq);
  return u;
}

function buildPartialUpdates(body) {
  const u = {};
  if (body.longDescription !== undefined) u.longDescription = body.longDescription;
  if (Array.isArray(body.highlights)) u.highlights = body.highlights.slice(0, 8);
  if (Array.isArray(body.specs)) u.specs = normalizeSpecs(body.specs);
  if (body.trackInventoryBySize !== undefined) u.trackInventoryBySize = body.trackInventoryBySize;
  if (Array.isArray(body.sizeInventory)) u.sizeInventory = normalizeSizeInventory(body.sizeInventory);
  if (Array.isArray(body.colorInventory)) u.colorInventory = normalizeColorInventory(body.colorInventory);
  if (body.colorImages !== undefined && typeof body.colorImages === 'object') u.colorImages = body.colorImages;
  if (body.discount !== undefined && typeof body.discount === 'object') u.discount = normalizeDiscount(body.discount);
  if (body.seo !== undefined && typeof body.seo === 'object') u.seo = normalizeSeo(body.seo);
  if (body.sizeChartUrl !== undefined) u.sizeChartUrl = body.sizeChartUrl || undefined;
  if (body.sizeChartTitle !== undefined) u.sizeChartTitle = body.sizeChartTitle || undefined;
  if (body.sizeChart !== undefined) u.sizeChart = body.sizeChart || undefined;
  if (Array.isArray(body.colors)) u.colors = body.colors;
  else if (body.color !== undefined) u.colors = Array.isArray(body.color) ? body.color : [body.color];
  if (Array.isArray(body.colorVariants)) u.colorVariants = normalizeColorVariants(body.colorVariants);
  return u;
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

function normalizeColorVariants(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(cv => ({
    colorName: String(cv.colorName || '').trim(),
    colorCode: String(cv.colorCode || '').trim(),
    images: Array.isArray(cv.images) ? validateImages(cv.images) : [],
    primaryImageIndex: Number.isInteger(cv.primaryImageIndex) ? cv.primaryImageIndex : 0,
  })).filter(cv => cv.colorName);
}

function normalizeSizeInventory(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(s => ({
    code: String(s.code || '').trim(),
    label: String(s.label || '').trim(),
    qty: Number(s.qty || 0),
  })).filter(s => s.code);
}

function normalizeColorInventory(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(c => ({
    color: String(c.color || '').trim(),
    qty: Number(c.qty || 0),
  })).filter(c => c.color);
}

function normalizeSpecs(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(spec => ({
    key: String(spec.key || '').trim(),
    value: String(spec.value || '').trim(),
  })).filter(spec => spec.key && spec.value);
}

function normalizeDiscount(discount) {
  if (!discount || typeof discount !== 'object') return { type: 'flat', value: 0 };
  return { type: discount.type === 'percentage' ? 'percentage' : 'flat', value: Number(discount.value || 0) };
}

function normalizeSeo(seo) {
  if (!seo || typeof seo !== 'object') return {};
  return {
    title: seo.title ? String(seo.title).trim() : undefined,
    description: seo.description ? String(seo.description).trim() : undefined,
    keywords: seo.keywords ? String(seo.keywords).trim() : undefined,
  };
}

function normalizeSizeFit(sf) {
  if (!sf || typeof sf !== 'object') return {};
  return {
    fit: sf.fit ? String(sf.fit).trim() : undefined,
    modelWearingSize: sf.modelWearingSize ? String(sf.modelWearingSize).trim() : undefined,
  };
}

function normalizeFaq(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(f => ({
    question: String(f.question || '').trim(),
    answer: String(f.answer || '').trim(),
  })).filter(f => f.question && f.answer);
}

module.exports = router;
