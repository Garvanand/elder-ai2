const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const png1x1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');

const assets = ['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'];

assets.forEach(asset => {
  fs.writeFileSync(path.join(assetsDir, asset), png1x1);
  console.log(`Created ${asset}`);
});

console.log('All placeholder assets created!');
