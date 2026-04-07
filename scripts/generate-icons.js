#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 * 
 * This script generates all required PWA icon sizes from a single source image.
 * You need to install sharp for image processing: npm install sharp
 * 
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Try to import sharp, provide helpful error if not available
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Sharp is not installed. Please install it with:');
  console.error('   npm install sharp');
  process.exit(1);
}

// Configuration
const CONFIG = {
  sourceImage: path.join(__dirname, '../public/icon-512.png'), // Source image (should be 512x512 or larger)
  outputDir: path.join(__dirname, '../public'),
  iconName: 'icon',
  backgroundColor: '#22c55e', // Theme color for background if needed
  iconSizes: [
    { size: 16, name: 'favicon' },
    { size: 32, name: 'icon' },
    { size: 57, name: 'icon' },
    { size: 60, name: 'icon' },
    { size: 72, name: 'icon' },
    { size: 76, name: 'icon' },
    { size: 96, name: 'icon' },
    { size: 114, name: 'icon' },
    { size: 120, name: 'icon' },
    { size: 128, name: 'icon' },
    { size: 144, name: 'icon' },
    { size: 152, name: 'icon' },
    { size: 180, name: 'icon' },
    { size: 192, name: 'icon' },
    { size: 384, name: 'icon' },
    { size: 512, name: 'icon' }
  ],
  // Additional formats
  generateFavicon: true,
  generateMaskable: true
};

/**
 * Generate a single icon size
 */
async function generateIcon(size, name, isMaskable = false) {
  const filename = `${name}-${size}.png`;
  const outputPath = path.join(CONFIG.outputDir, filename);
  
  try {
    let pipeline = sharp(CONFIG.sourceImage);
    
    // Resize to target size
    pipeline = pipeline.resize(size, size, {
      fit: 'cover',
      position: 'center'
    });
    
    // Add background for maskable icons
    if (isMaskable) {
      pipeline = pipeline.composite([{
        input: Buffer.from(
          `<svg width="${size}" height="${size}">
            <rect width="100%" height="100%" fill="${CONFIG.backgroundColor}"/>
            <rect width="80%" height="80%" x="10%" y="10%" fill="white" rx="${size * 0.1}"/>
          </svg>`
        ),
        blend: 'dest-over'
      }]);
    }
    
    await pipeline.png({ quality: 90 }).toFile(outputPath);
    
    console.log(`✅ Generated ${filename}`);
    return outputPath;
  } catch (error) {
    console.error(`❌ Failed to generate ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Generate favicon.ico file
 */
async function generateFavicon() {
  const outputPath = path.join(CONFIG.outputDir, 'favicon.ico');
  
  try {
    // Generate multiple sizes for favicon
    const sizes = [16, 32, 48];
    const buffers = await Promise.all(
      sizes.map(size => 
        sharp(CONFIG.sourceImage)
          .resize(size, size, { fit: 'cover', position: 'center' })
          .png()
          .toBuffer()
      )
    );
    
    // Create ICO file (simplified version - for proper ICO generation, consider using 'ico-convert')
    await sharp(buffers[0]) // Use 32x32 as base
      .toFile(outputPath.replace('.ico', '-32.png'));
    
    console.log(`✅ Generated favicon-32.png (use as favicon.ico alternative)`);
  } catch (error) {
    console.error(`❌ Failed to generate favicon:`, error.message);
  }
}

/**
 * Generate maskable icons
 */
async function generateMaskableIcons() {
  const maskableSizes = [192, 512];
  
  for (const size of maskableSizes) {
    await generateIcon(size, 'icon-maskable', true);
  }
}

/**
 * Generate browserconfig.xml for Windows tiles
 */
async function generateBrowserConfig() {
  const config = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square70x70logo src="/icon-72.png"/>
            <square150x150logo src="/icon-150.png"/>
            <square310x310logo src="/icon-310.png"/>
            <TileColor>#22c55e</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;
  
  const outputPath = path.join(CONFIG.outputDir, 'browserconfig.xml');
  fs.writeFileSync(outputPath, config);
  console.log(`✅ Generated browserconfig.xml`);
}

/**
 * Generate tile configuration for Windows
 */
async function generateTileConfig() {
  // Generate additional sizes for Windows tiles
  const tileSizes = [150, 310];
  
  for (const size of tileSizes) {
    await generateIcon(size, 'icon');
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🎨 Starting PWA icon generation...\n');
  
  // Check if source image exists
  if (!fs.existsSync(CONFIG.sourceImage)) {
    console.error(`❌ Source image not found: ${CONFIG.sourceImage}`);
    console.error('Please provide a 512x512 PNG file at this location.');
    process.exit(1);
  }
  
  try {
    // Generate standard icons
    console.log('📱 Generating standard icons...');
    for (const { size, name } of CONFIG.iconSizes) {
      await generateIcon(size, name);
    }
    
    // Generate favicon
    if (CONFIG.generateFavicon) {
      console.log('\n🌐 Generating favicon...');
      await generateFavicon();
    }
    
    // Generate maskable icons
    if (CONFIG.generateMaskable) {
      console.log('\n🎭 Generating maskable icons...');
      await generateMaskableIcons();
    }
    
    // Generate Windows tile configurations
    console.log('\n🪟 Generating Windows tile configurations...');
    await generateTileConfig();
    await generateBrowserConfig();
    
    console.log('\n✨ PWA icon generation completed successfully!');
    console.log('\n📋 Generated files:');
    
    // List generated files
    const files = fs.readdirSync(CONFIG.outputDir)
      .filter(file => file.startsWith('icon-') || file.startsWith('icon-maskable-') || 
                   file === 'favicon-32.png' || file === 'browserconfig.xml')
      .sort();
    
    files.forEach(file => {
      console.log(`   - ${file}`);
    });
    
    console.log('\n💡 Next steps:');
    console.log('   1. Update your index.html to reference the new icons');
    console.log('   2. Test your PWA with: npm run pwa:test');
    console.log('   3. Run Lighthouse audit: npm run pwa:audit');
    
  } catch (error) {
    console.error('\n❌ Icon generation failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { generateIcon, generateFavicon, generateMaskableIcons };
