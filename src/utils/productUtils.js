const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5005').replace(/\/$/, '');

export const formatProduct = (prod) => {
  if (!prod) return null;

  // Process main image
  let mainImg = '/product_ghee.png';
  if (prod.images && prod.images.length > 0) {
    const rawImg = prod.images[0];
    mainImg = rawImg.startsWith('http') ? rawImg : `${BASE_URL}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
  } else if (prod.img) {
    mainImg = prod.img;
  }

  // Process array of images
  let imgs = [mainImg];
  if (prod.images && prod.images.length > 0) {
    imgs = prod.images.map(img => img.startsWith('http') ? img : `${BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`);
  } else if (prod.imgs && prod.imgs.length > 0) {
    imgs = prod.imgs;
  }

  // Process price & original price from variants or simplePrice
  let price = 0;
  let originalPrice = 0;

  if (prod.hasVariants && prod.variants && prod.variants.length > 0) {
    price = Math.round(Number(prod.variants[0].salePrice) || 0);
    originalPrice = Math.round(Number(prod.variants[0].originalPrice) || price);
  } else if (prod.simplePrice) {
    price = Math.round(Number(prod.simplePrice.salePrice) || 0);
    originalPrice = Math.round(Number(prod.simplePrice.originalPrice) || price);
  } else if (prod.price !== undefined) {
    price = Math.round(Number(prod.price) || 0);
    originalPrice = Math.round(Number(prod.originalPrice) || price);
  }

  const categoryName = prod.category?.name || prod.category || 'Farm Product';
  const categorySlug = prod.category?.name 
    ? prod.category.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    : (prod.categorySlug || 'general');

  // Determine tabs & tags
  const tabs = ['All Products'];
  const tags = prod.tags || ['all'];

  // Categorize based on category name or type
  const isWellness = categoryName.toLowerCase().includes('wellness') || 
                     categoryName.toLowerCase().includes('superfood') || 
                     categoryName.toLowerCase().includes('ayurvedic') ||
                     categoryName.toLowerCase().includes('tea');

  if (isWellness) {
    tabs.push('Wellness');
    tags.push('wellness');
  } else {
    tabs.push('Food Products');
    tags.push('food');
  }

  if (prod.isNewArrival) {
    tabs.push('New Arrivals');
    tags.push('new-arrivals');
    tags.push('new');
  }

  if (prod.isBestSeller) {
    tabs.push('Bestsellers');
    tags.push('bestseller');
  }

  return {
    id: prod._id || prod.id,
    _id: prod._id || prod.id,
    slug: prod.slug,
    name: prod.name,
    category: categoryName,
    categorySlug: categorySlug,
    healthRegions: prod.healthRegions || [],
    img: mainImg,
    imgs: imgs,
    price: Math.round(Number(price) || 0),
    originalPrice: Math.round(Number(originalPrice) > price ? Number(originalPrice) : price * 1.25),
    rating: prod.rating || 4.8,
    reviews: prod.reviews || 120,
    badge: prod.isBestSeller ? 'bestseller' : (prod.isNewArrival ? 'new' : (prod.badge || null)),
    shortDesc: prod.shortDescription || prod.shortDesc || '',
    tab: tabs,
    tags: tags,
    inStock: prod.isActive !== undefined ? prod.isActive : true
  };
};

export const fetchAllStoreProducts = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/products`);
    const data = await res.json();
    if (data.success && Array.isArray(data.products)) {
      return data.products.map(formatProduct);
    }
  } catch (err) {
    console.error('Error fetching dynamic store products:', err);
  }
  return [];
};
