const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const AboutHome = require('../models/AboutHome');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');

// Upload folder available nahi hai to automatically create ho jayega.
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {
    recursive: true,
  });
}

const allowedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadsDir);
  },

  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    callback(null, `about-home-${Date.now()}${extension}`);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      return callback(
        new Error(
          'Only JPG, PNG, WEBP, GIF and AVIF images are allowed'
        )
      );
    }

    callback(null, true);
  },
});

const defaultAboutHome = {
  badge: '🌱 Our Story',

  title: 'Bringing the Goodness of Kissan Directly to Your Home',

  content:
    '<p>The Kissan City was born from a simple belief — every Indian family deserves pure, unadulterated food. We cut out the middlemen and connect you directly with our network of trusted farmers who grow with love, tradition, and zero shortcuts.</p>',

  bullets: [
    'Partnered with 500+ certified kissan farmers across 18 states',
    'Zero pesticides, zero chemicals — 100% naturally grown',
    'Traditional farming methods preserved for authentic nutrition',
    'Fair prices directly from farm to your doorstep',
  ],

  stats: [
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

  imageUrl: '',
  imageAlt: 'Kissan farmer in field',
  buttonText: 'Explore Our Story',
  buttonLink: '#',
};

const parseJsonArray = (value, fieldName) => {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsedData = JSON.parse(value);

    if (!Array.isArray(parsedData)) {
      throw new Error(`${fieldName} must be an array`);
    }

    return parsedData;
  } catch (error) {
    throw new Error(`Invalid ${fieldName} data`);
  }
};

const normalizeBullets = (bullets) => {
  return bullets
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 20);
};

const normalizeStats = (stats) => {
  return stats
    .map((item) => ({
      number: String(item?.number || '').trim(),
      label: String(item?.label || '').trim(),
    }))
    .filter((item) => item.number || item.label)
    .slice(0, 12);
};

const removeOldUpload = (imageUrl) => {
  if (
    !imageUrl ||
    !imageUrl.startsWith('/uploads/about-home-')
  ) {
    return;
  }

  const filename = path.basename(imageUrl);
  const oldFilePath = path.join(uploadsDir, filename);

  fs.unlink(oldFilePath, (error) => {
    if (error && error.code !== 'ENOENT') {
      console.error(
        'Unable to delete previous About Home image:',
        error.message
      );
    }
  });
};

// GET ABOUT HOME DATA
router.get('/', async (req, res) => {
  try {
    let aboutHome = await AboutHome.findOne({
      singletonKey: 'about-home',
    });

    // First request par default data automatically create hoga.
    if (!aboutHome) {
      aboutHome = await AboutHome.create(defaultAboutHome);
    }

    return res.status(200).json({
      success: true,
      aboutHome,
    });
  } catch (error) {
    console.error('Error fetching About Home:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch About Home content',
    });
  }
});

// UPDATE ABOUT HOME DATA
router.put('/', upload.single('image'), async (req, res) => {
  try {
    const bullets = parseJsonArray(
      req.body.bullets,
      'bullets'
    );

    const stats = parseJsonArray(
      req.body.stats,
      'stats'
    );

    const updateData = {
      badge: String(req.body.badge || '').trim(),
      title: String(req.body.title || '').trim(),
      content: String(req.body.content || ''),
      imageAlt: String(req.body.imageAlt || '').trim(),
      buttonText: String(req.body.buttonText || '').trim(),
      buttonLink:
        String(req.body.buttonLink || '#').trim() || '#',
    };

    if (bullets !== undefined) {
      updateData.bullets = normalizeBullets(bullets);
    }

    if (stats !== undefined) {
      updateData.stats = normalizeStats(stats);
    }

    const previousData = await AboutHome.findOne({
      singletonKey: 'about-home',
    });

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const aboutHome = await AboutHome.findOneAndUpdate(
      {
        singletonKey: 'about-home',
      },
      {
        $set: updateData,
        $setOnInsert: {
          singletonKey: 'about-home',
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    // New image upload hone par previous image delete hogi.
    if (
      req.file &&
      previousData?.imageUrl &&
      previousData.imageUrl !== aboutHome.imageUrl
    ) {
      removeOldUpload(previousData.imageUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'About Home content updated successfully',
      aboutHome,
    });
  } catch (error) {
    // Database update fail ho to newly uploaded image remove kar do.
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    console.error('Error updating About Home:', error);

    const statusCode =
      error instanceof multer.MulterError ||
      error.message?.startsWith('Invalid')
        ? 400
        : 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        'Unable to update About Home content',
    });
  }
});

// MULTER ERROR HANDLER
router.use((error, req, res, next) => {
  if (!error) {
    return next();
  }

  if (req.file?.path) {
    fs.unlink(req.file.path, () => {});
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        error.code === 'LIMIT_FILE_SIZE'
          ? 'Image size must be 10 MB or less'
          : error.message,
    });
  }

  return res.status(400).json({
    success: false,
    message:
      error.message || 'Invalid image upload',
  });
});

module.exports = router;