#!/usr/bin/env node
const args = require("minimist")(process.argv.slice(2));
const { generateAssetsMap } = require("../lib/generator");

function showHelp() {
  console.log(`
Assets Mapper - Generate typed asset maps for React/Next.js projects

Usage:
  assets-mapper --src <folder> --out <file> [options]

Options:
  --src <folder>     Source directory containing image assets (required)
  --out <file>       Output file path for the generated map (required)
  --public          Generate public URLs instead of import statements
  --exts <list>     Comma-separated list of file extensions (default: png,jpg,jpeg,svg,webp,gif,ico,bmp,tiff)
  --help, -h        Show this help message

Examples:
  assets-mapper --src ./public/assets --out ./src/assetsMap.js --public
  assets-mapper --src ./assets --out ./src/assetsMap.js --exts png,svg,jpg
`);
}

if (args.help || args.h) {
  showHelp();
  process.exit(0);
}

if (!args.src || !args.out) {
  console.error("Error: Both --src and --out arguments are required\n");
  showHelp();
  process.exit(1);
}

try {
  const result = generateAssetsMap({
    src: args.src,
    out: args.out,
    public: !!args.public,
    exts: args.exts
      ? String(args.exts)
          .split(",")
          .map((ext) => ext.trim())
      : undefined,
  });

  console.log(`✅ Assets map generated successfully!`);
  console.log(`   Output: ${result.outputFile}`);
  console.log(`   Processed: ${result.processedFiles.length} files`);
  if (result.skippedFiles > 0) {
    console.log(`   Skipped: ${result.skippedFiles} files`);
  }
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
