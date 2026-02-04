const fs = require('fs');
const { createCanvas } = require('canvas');

// Create icons directory if it doesn't exist
if (!fs.existsSync('./icons')) {
  fs.mkdirSync('./icons');
}

// Function to create a simple colored square icon
function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Blue background
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(0, 0, size, size);
  
  // White book icon (simplified)
  ctx.fillStyle = 'white';
  ctx.font = `${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('📚', size/2, size/2);
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`./icons/${filename}`, buffer);
  console.log(`Created ${filename}`);
}

// Create icons
createIcon(16, 'icon16.png');
createIcon(48, 'icon48.png');
createIcon(128, 'icon128.png');

console.log('All icons created successfully!');