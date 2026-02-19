const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    price: { type: Number, required: true },
    images: { type: [String], default: [] },
    image_url: { type: String },
    description: { type: String },
    longDescription: { type: String },
    highlights: { type: [String], default: [] },
    specs: { type: [{ key: String, value: String }], default: [] },
    category: { type: String },
    region: { type: mongoose.Schema.Types.ObjectId, ref: 'Region' },
    gender: { type: String, enum: ['male', 'female', 'unisex'], default: 'unisex' },
    stock: { type: Number, default: 0 },
    paragraph1: { type: String },
    paragraph2: { type: String },
    attributes: { type: Object, default: {} },

    colors: { type: [String], default: [] },
    colorVariants: {
      type: [
        {
          colorName: { type: String, required: true },
          colorCode: { type: String, default: '' },
          images: { type: [String], default: [] },
          primaryImageIndex: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    colorInventory: {
      type: [
        {
          color: { type: String },
          qty: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    colorImages: {
      type: Object,
      default: {},
    },

    // New quantity/pack/unit structure
    quantityOptions: {
      type: [
        {
          id: { type: String, required: true },
          quantity: { type: Number, required: true }, // e.g., 300, 600
          unit: { type: String, enum: ['gm', 'ml', 'l', 'pcs'], required: true }, // grams, ml, liters, pieces
          packSize: { type: Number, default: 1 }, // e.g., 1, 2, 4 for pack of 1, 2, 4
          displayLabel: { type: String, required: true }, // e.g., "300ml", "600ml (2 X 300ml Bottles)"
          price: { type: Number, required: true }, // price for this specific quantity option
          originalPrice: { type: Number }, // original price for discount display
          stock: { type: Number, default: 0 },
          isActive: { type: Boolean, default: true },
          sortOrder: { type: Number, default: 0 }
        }
      ],
      default: []
    },

    // Legacy size support - keep for backward compatibility
    sizes: { type: [String], default: [] },
    trackInventoryBySize: { type: Boolean, default: false },
    sizeInventory: {
      type: [
        {
          code: { type: String },
          label: { type: String },
          qty: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    sizeChartUrl: { type: String },
    sizeChartTitle: { type: String },
    sizeChart: {
      type: {
        title: { type: String },
        fieldLabels: {
          type: {
            chest: { type: String, default: 'Chest' },
            waist: { type: String, default: 'Waist' },
            length: { type: String, default: 'Length' }
          },
          default: {
            chest: 'Chest',
            waist: 'Waist',
            length: 'Length'
          }
        },
        rows: [
          {
            sizeLabel: { type: String },
            chest: { type: String },
            waist: { type: String },
            length: { type: String },
            brandSize: { type: String }
          }
        ],
        guidelines: { type: String },
        diagramUrl: { type: String }
      },
      default: null
    },

    discount: {
      type: new mongoose.Schema(
        {
          type: { type: String, enum: ['flat', 'percentage'], default: 'flat' },
          value: { type: Number, default: 0 },
        },
        { _id: false }
      ),
      default: () => ({ type: 'flat', value: 0 }),
    },

    seo: {
      type: {
        title: { type: String },
        description: { type: String },
        keywords: { type: String },
      },
      default: {},
    },

    sizeFit: {
      type: {
        fit: { type: String },
        modelWearingSize: { type: String },
      },
      default: {},
    },

    faq: {
      type: [
        {
          question: { type: String, required: true },
          answer: { type: String, required: true },
        },
      ],
      default: [],
    },

    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    reviews: {
      type: [{
        id: { type: String, required: true },
        username: { type: String, required: true },
        email: { type: String },
        rating: { type: Number, required: true, min: 1, max: 5 },
        text: { type: String, required: true },
        status: { type: String, enum: ['pending', 'published', 'rejected'], default: 'published' },
        createdAt: { type: Date, default: Date.now },
      }],
      default: [],
    },
   
  },
  { timestamps: true },
);

ProductSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (!this.image_url && this.images && this.images.length) {
    this.image_url = this.images[0];
  }
  next();
});

// Helpful indexes for search/filter
ProductSchema.index({ title: 'text' });
ProductSchema.index({ category: 1, active: 1 });

module.exports = mongoose.model('Product', ProductSchema);
