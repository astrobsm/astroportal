// Simple test script to verify project setup
const fs = require('fs');
const path = require('path');

console.log('🔍 Astro-BSM Portal Setup Verification');
console.log('=====================================\n');

// Check package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('✅ package.json found and valid');
  console.log(`   Name: ${packageJson.name}`);
  console.log(`   Version: ${packageJson.version}`);
} catch (error) {
  console.log('❌ package.json error:', error.message);
}

// Check key directories
const directories = ['src', 'public', 'server', 'src/components', 'src/pages', 'src/services'];
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ Directory exists: ${dir}`);
  } else {
    console.log(`❌ Directory missing: ${dir}`);
  }
});

// Check key files
const files = [
  'index.html',
  'vite.config.js',
  'src/main.jsx',
  'src/App.jsx',
  'src/index.css',
  'server/index.js',
  'server/database/schema.sql',
  'public/manifest.json',
  'public/sw.js'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ File exists: ${file}`);
  } else {
    console.log(`❌ File missing: ${file}`);
  }
});

// Check icons
const iconFiles = [
  'public/icons/icon.svg',
  'public/icons/icon-192x192.svg',
  'public/icons/icon-72x72.svg'
];

iconFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ Icon exists: ${file}`);
  } else {
    console.log(`❌ Icon missing: ${file}`);
  }
});

console.log('\n🎉 Project setup verification complete!');
console.log('\nNext steps:');
console.log('1. Run "npm install" to install dependencies');
console.log('2. Set up PostgreSQL database');
console.log('3. Run "npm run dev" for frontend');
console.log('4. Run "npm run server" for backend');
console.log('5. Or run "npm run dev:full" for both together');
