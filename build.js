const fs = require("fs");
const path = require("path");

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach((f) => {
    const s = path.join(src, f);
    const d = path.join(dest, f);
    if (fs.statSync(s).isDirectory()) copyDirSync(s, d);
    else fs.copyFileSync(s, d);
  });
}

// Clean lib directory first
const libDir = path.join(__dirname, "lib");
if (fs.existsSync(libDir)) {
  fs.rmSync(libDir, { recursive: true, force: true });
}

// Copy src to lib
copyDirSync(path.join(__dirname, "src"), libDir);
console.log("✅ Built to lib/");

// Verify required files exist
const requiredFiles = ["index.js", "generator.js"];
requiredFiles.forEach((file) => {
  const filePath = path.join(libDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
});

console.log("✅ Build verification complete");
