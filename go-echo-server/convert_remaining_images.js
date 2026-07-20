const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const uploadedLogo = 'C:/Users/narik/.gemini/antigravity/brain/4dde8c7c-c103-4980-871d-2390ad470ee6/.user_uploaded/media__1784487701210.jpg';
const appDir = 'c:/Naresh/Devops/fadenfab/app';
const publicDir = 'c:/Naresh/Devops/fadenfab/public';

async function run() {
  console.log("Converting final favicon logo to webp...");
  
  // Convert uploaded logo to app/icon.webp
  try {
    await sharp(uploadedLogo)
      .webp({ quality: 90 })
      .toFile(path.join(appDir, 'icon.webp'));
    console.log("Created app/icon.webp");
  } catch (err) {
    console.error("Failed to create app/icon.webp:", err);
  }

  // Convert uploaded logo to public/favicon.webp
  try {
    await sharp(uploadedLogo)
      .webp({ quality: 90 })
      .toFile(path.join(publicDir, 'favicon.webp'));
    console.log("Created public/favicon.webp");
  } catch (err) {
    console.error("Failed to create public/favicon.webp:", err);
  }

  // Convert public/gpay-qr.jpg to public/gpay-qr.webp
  const gpayJpg = path.join(publicDir, 'gpay-qr.jpg');
  if (fs.existsSync(gpayJpg)) {
    try {
      await sharp(gpayJpg)
        .webp({ quality: 80 })
        .toFile(path.join(publicDir, 'gpay-qr.webp'));
      console.log("Created public/gpay-qr.webp");
      fs.unlinkSync(gpayJpg);
      console.log("Deleted public/gpay-qr.jpg");
    } catch (err) {
      console.error("Failed to convert gpay-qr.jpg:", err);
    }
  }

  // Clean up legacy non-webp files
  const legacyFiles = [
    path.join(appDir, 'favicon.ico'),
    path.join(appDir, 'icon.jpg'),
    path.join(appDir, 'favicon.jpg'),
    path.join(publicDir, 'favicon.ico')
  ];

  for (const file of legacyFiles) {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
        console.log(`Deleted legacy file: ${file}`);
      } catch (err) {
        console.error(`Failed to delete legacy file ${file}:`, err);
      }
    }
  }

  console.log("Conversion and cleanup complete!");
}

run();
