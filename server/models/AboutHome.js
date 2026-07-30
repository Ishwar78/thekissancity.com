const mongoose = require('mongoose');

const statSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      trim: true,
      default: '',
    },
    label: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    _id: false,
  }
);

const aboutHomeSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'about-home',
      unique: true,
      immutable: true,
    },

    badge: {
      type: String,
      trim: true,
      default: '🌱 Our Story',
    },

    title: {
      type: String,
      trim: true,
      default: 'Bringing the Goodness of Kissan Directly to Your Home',
    },

    content: {
      type: String,
      default:
        '<p>The Kissan City was born from a simple belief — every Indian family deserves pure, unadulterated food. We cut out the middlemen and connect you directly with our network of trusted farmers who grow with love, tradition, and zero shortcuts.</p>',
    },

    bullets: {
      type: [String],
      default: [
        'Partnered with 500+ certified kissan farmers across 18 states',
        'Zero pesticides, zero chemicals — 100% naturally grown',
        'Traditional farming methods preserved for authentic nutrition',
        'Fair prices directly from farm to your doorstep',
      ],
    },

    stats: {
      type: [statSchema],
      default: [
        {
          number: '500+',
          label: 'Kissan Farmers',
        },
        {
          number: '2L+',
          label: 'Happy Families',
        },
        {
          number: '200+',
          label: 'Products',
        },
        {
          number: '18',
          label: 'States',
        },
      ],
    },

    imageUrl: {
      type: String,
      default: '',
    },

    imageAlt: {
      type: String,
      trim: true,
      default: 'Kissan farmer in field',
    },

    buttonText: {
      type: String,
      trim: true,
      default: 'Explore Our Story',
    },

    buttonLink: {
      type: String,
      trim: true,
      default: '#',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AboutHome', aboutHomeSchema);