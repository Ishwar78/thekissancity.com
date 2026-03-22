const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema({
  eyebrow: {
    text: { type: String, required: true, default: 'Kissan City' },
    icon: { type: String, default: 'Mountain' }
  },
  title: {
    main: { type: String, required: true, default: 'Our Story' },
    highlighted: { type: String, required: true, default: 'Story' }
  },
  content: {
    main: [{
      text: { type: String, required: true }
    }],
    expanded: [{
      text: { type: String }
    }]
  },
  image: {
    src: { type: String, required: true, default: '/Capture.PNG' },
    alt: { type: String, required: true, default: 'Direct from source' },
    badge: {
      text: { type: String, required: true, default: '100% Organic' },
      icon: { type: String, default: 'Leaf' }
    },
    banner: {
      text: { type: String, required: true, default: 'Perfect for all occasions' }
    }
  },
  icons: [{
    text: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  stats: [{
    value: { type: String, required: true },
    label: { type: String, required: true }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

aboutUsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AboutUs', aboutUsSchema);
