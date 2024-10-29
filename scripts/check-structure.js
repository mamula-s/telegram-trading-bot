// scripts/check-structure.js
const fs = require('fs');
const path = require('path');

const requiredDirs = [
  'src/middleware',
  'src/routes',
  'src/routes/admin',
  'src/controllers',
  'src/models',
  'src/services',
  'src/public'
];

const requiredFiles = [
  'src/middleware/adminAuth.js',
  'src/routes/admin/api.js',
  'src/index.js'
];

console.log('Checking project structure...');

requiredDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    console.error(`Missing directory: ${dir}`);
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

requiredFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) {
    console.error(`Missing file: ${file}`);
    process.exit(1);
  }
});

console.log('Project structure check completed');