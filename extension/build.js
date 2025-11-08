/**
 * Build script to copy files and build extension
 */

import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function copyRecursive(src, dest) {
  if (!existsSync(src)) {
    console.warn(`Source does not exist: ${src}`);
    return;
  }

  const stat = statSync(src);
  if (stat.isDirectory()) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    const files = readdirSync(src);
    files.forEach((file) => {
      copyRecursive(join(src, file), join(dest, file));
    });
  } else {
    copyFileSync(src, dest);
  }
}

// Build with Vite
console.log('Building with Vite...');
execSync('vite build', { stdio: 'inherit', cwd: __dirname });

// Copy additional files
console.log('Copying additional files...');
const distDir = resolve(__dirname, 'dist');

const filesToCopy = [
  'background.js',
  'contentScript.js',
  'content.css',
  'storage.js',
  'csvStorage.js',
  'manifest.json',
  'popup-fallback.js',
  'popup-simple.html',
  'popup-simple.js',
  'chatWidget.js',
  'pageExtractor.js',
  'contextualRecall.js',
  'memoryGraph.js',
];

filesToCopy.forEach((file) => {
  const src = resolve(__dirname, file);
  const dest = resolve(distDir, file);
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`✓ Copied ${file}`);
  } else {
    console.warn(`⚠ File not found: ${file}`);
  }
});

// Copy icons directory
const iconsDir = resolve(__dirname, 'icons');
const distIconsDir = resolve(distDir, 'icons');
if (existsSync(iconsDir)) {
  copyRecursive(iconsDir, distIconsDir);
  console.log('✓ Copied icons directory');
} else {
  console.warn('⚠ Icons directory not found. Create icons/ folder with icon files.');
}

// Fix popup.html paths (Vite outputs absolute paths, but Chrome extensions need relative paths)
const popupHtmlPath = resolve(distDir, 'popup.html');
if (existsSync(popupHtmlPath)) {
  let popupHtml = readFileSync(popupHtmlPath, 'utf8');

  // Replace absolute paths with relative paths
  popupHtml = popupHtml.replace(/src="\/popup\.js"/g, 'src="./popup.js"');
  popupHtml = popupHtml.replace(/href="\/popup\.css"/g, 'href="./popup.css"');

  // Remove crossorigin attribute (causes issues in Chrome extensions)
  popupHtml = popupHtml.replace(/crossorigin/g, '');

  // Add popup-fallback.js script at the end of body
  if (!popupHtml.includes('popup-fallback.js')) {
    popupHtml = popupHtml.replace('</body>', '  <script src="./popup-fallback.js"></script>\n</body>');
  }

  // Add fallback content and styles if not present
  if (!popupHtml.includes('loading-fallback')) {
    // Insert fallback styles in head
    if (!popupHtml.includes('<style>')) {
      popupHtml = popupHtml.replace('</head>', `
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; width: 400px; min-height: 500px; }
    #root { width: 100%; min-height: 500px; }
    .loading-fallback { padding: 20px; text-align: center; color: #666; background: #fff; min-height: 500px; }
  </style>
</head>`);
    }

    // Ensure root div has loading state
    if (!popupHtml.includes('loading-fallback')) {
      popupHtml = popupHtml.replace(
        '<div id="root"></div>',
        '<div id="root"><div class="loading-fallback"><h2 style="color: #7c3aed; margin-bottom: 20px;">Synapse Capture</h2><p>Loading...</p></div></div>'
      );
    }
  }

  writeFileSync(popupHtmlPath, popupHtml);
  console.log('✓ Fixed popup.html paths and added fallback script');
}

console.log('\n✅ Build complete!');
console.log(`📦 Extension files are in: ${distDir}`);
console.log('\nNext steps:');
console.log('1. Create icon files in extension/icons/ if not done');
console.log('2. Load extension in Chrome: chrome://extensions/ → Load unpacked → Select dist folder');

