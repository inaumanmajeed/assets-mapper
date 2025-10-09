#!/usr/bin/env node
const args = require("minimist")(process.argv.slice(2));
const { generateAssetsMap, watchAssetsMap } = require("../lib/generator");

function showHelp() {
  console.log(`
Assets Mapper - Generate typed asset maps for React/Next.js projects

Usage:
  assets-mapper --src <folder> --out <file> [options]

Options:
  --src <folder>     Source directory containing image assets (required)
  --out <file>       Output file path for the generated map (required)
  --public          Generate public URLs instead of import statements
  --watch, -w       Watch for changes and auto-regenerate (stays running)
  --exts <list>     Comma-separated list of file extensions (default: png,jpg,jpeg,svg,webp,gif,ico,bmp,tiff)
  --help, -h        Show this help message

Features:
  • Recursively scans subdirectories for images
  • Generates unique names for files with same names in different folders
  • Auto-watch mode for development workflow

Examples:
  assets-mapper --src ./public/assets --out ./src/assetsMap.js --public
  assets-mapper --src ./src/assets --out ./src/assetsMap.js --watch
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
  const options = {
    src: args.src,
    out: args.out,
    public: !!args.public,
    exts: args.exts
      ? String(args.exts)
          .split(",")
          .map((ext) => ext.trim())
      : undefined,
  };

  // Generate initial assets map
  const result = generateAssetsMap(options);

  console.log(`✅ Assets map generated successfully!`);
  console.log(`   Output: ${result.outputFile}`);
  console.log(`   Processed: ${result.totalFiles} files`);
  
  if (result.directories.length > 0) {
    console.log(`   Directories: ${result.directories.join(', ')}`);
  }
  
  if (result.skippedFiles > 0) {
    console.log(`   Skipped: ${result.skippedFiles} files`);
  }

  // Start watching if requested
  if (args.watch || args.w) {
    console.log('');
    const watcher = watchAssetsMap(options);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down...');
      watcher.close();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      watcher.close();
      process.exit(0);
    });
  }
  
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
