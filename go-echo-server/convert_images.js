const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = 'c:/Naresh/Devops/fadenfab/public';

async function run() {
  const files = fs.readdirSync(publicDir);
  console.log(`Scanning public directory for PNG images...`);

  for (const file of files) {
    if (file.toLowerCase().endsWith('.png')) {
      const inputPath = path.join(publicDir, file);
      const outputName = file.substring(0, file.length - 4) + '.webp';
      const outputPath = path.join(publicDir, outputName);

      console.log(`Converting ${file} -> ${outputName}...`);
      try {
        await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(outputPath);
        
        const origStats = fs.statSync(inputPath);
        const webpStats = fs.statSync(outputPath);
        const saved = ((origStats.size - webpStats.size) / (1024 * 1024)).toFixed(2);
        console.log(`Success! Saved ${saved} MB (${((webpStats.size / origStats.size) * 100).toFixed(1)}% of original size)`);

        // Delete the original PNG file to save space and remove references
        fs.unlinkSync(inputPath);
        console.log(`Deleted original PNG: ${file}`);
      } catch (err) {
        console.error(`Failed to convert ${file}:`, err);
      }
    }
  }
  console.log("All conversions completed!");
}

run();
