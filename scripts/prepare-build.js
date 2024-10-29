const fs = require('fs');
const path = require('path');

// Ensure directories exist
const dirs = [
  'src/public',
  'src/admin/views'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Copy files
const files = [
  {
    src: 'public/webapp.html',
    dest: 'src/public/webapp.html'
  },
  {
    src: 'src/admin/views/error.ejs',
    dest: 'src/admin/views/error.ejs'
  }
];

files.forEach(file => {
  if (fs.existsSync(file.src)) {
    fs.copyFileSync(file.src, file.dest);
    console.log(`Copied ${file.src} to ${file.dest}`);
  } else {
    console.error(`Source file ${file.src} not found`);
  }
});