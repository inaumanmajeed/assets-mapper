#!/usr/bin/env node
import minimist from 'minimist';
import { generateAssetsMap, watchAssetsMap } from '../lib/generator.js';
import { loadConfig, mergeConfig } from '../lib/config.js';

interface CliArgs {
  _: string[];
  src?: string;
  out?: string;
  public?: boolean;
  watch?: boolean;
  w?: boolean;
  exts?: string;
  exclude?: string;
  include?: string;
  naming?: 'camelCase' | 'snake_case' | 'kebab-case';
  prefix?: 'folder' | 'path' | 'hash';
  init?: boolean;
  'dry-run'?: boolean;
  stats?: boolean;
  help?: boolean;
  h?: boolean;
}

const args = minimist(process.argv.slice(2)) as CliArgs;

function showHelp() {
  console.log(`
Assets Mapper - Generate typed asset maps for React/Next.js projects

Usage:
  assets-mapper --src <folder> --out <file> [options]
  assets-mapper init                          # Create config file

Options:
  --src <folder>        Source directory containing image assets (required)
  --out <file>          Output file path for the generated map (required)
  --public              Generate public URLs instead of import statements
  --watch, -w           Watch for changes and auto-regenerate (stays running)
  --exts <list>         Comma-separated list of file extensions (default: png,jpg,jpeg,svg,webp,gif,ico,bmp,tiff)
  --exclude <patterns>  Comma-separated glob patterns to exclude (default: **/node_modules/**,**/.git/**)
  --include <patterns>  Comma-separated glob patterns to include (only these)
  --naming <strategy>   Naming convention: camelCase, snake_case, kebab-case
  --prefix <strategy>   Duplicate prefix strategy: folder, path, hash
  --init                Create a config file interactively
  --dry-run             Show what would be generated without writing
  --stats               Show detailed statistics about assets
  --help, -h            Show this help message

Config File:
  Create assets-mapper.config.js in your project root:
  
  export default {
    src: './src/assets',
    out: './src/assetsMap.ts',
    exts: ['png', 'svg', 'webp'],
    exclude: ['**/test/**'],
    namingStrategy: 'camelCase'
  };

Features:
  • Recursively scans subdirectories for images
  • Smart duplicate handling - preserves first occurrence name
  • Auto-watch mode for development workflow
  • Config file support for project defaults

Examples:
  assets-mapper --src ./public/assets --out ./src/assetsMap.js --public
  assets-mapper --src ./src/assets --out ./src/assetsMap.js --watch
  assets-mapper --src ./assets --out ./src/assetsMap.js --naming camelCase
  assets-mapper --src ./assets --out ./src/map.js --exclude '**/test/**,**/temp/**'
`);
}

async function main() {
  if (args.help || args.h) {
    showHelp();
    process.exit(0);
  }

  if (args.init) {
    console.log('📝 Creating assets-mapper.config.js...');
    const fs = await import('fs');
    const configContent = `export default {
  src: './src/assets',
  out: './src/assetsMap.ts',
  public: false,
  exts: ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'],
  exclude: ['**/node_modules/**', '**/.git/**'],
  namingStrategy: 'camelCase',
  prefixStrategy: 'folder'
};
`;
    fs.default.writeFileSync('assets-mapper.config.js', configContent);
    console.log('✅ Created assets-mapper.config.js');
    console.log('📖 Edit the config file and run: assets-mapper');
    process.exit(0);
  }

  const config = await loadConfig();

  let finalOptions;

  if (config) {
    console.log('📦 Using config from file');
    finalOptions = mergeConfig(config, {
      src: args.src,
      out: args.out,
      public: args.public,
      exts: args.exts ? args.exts.split(',').map(e => e.trim()) : undefined,
      exclude: args.exclude
        ? args.exclude.split(',').map(e => e.trim())
        : undefined,
      include: args.include
        ? args.include.split(',').map(e => e.trim())
        : undefined,
      namingStrategy: args.naming,
      prefixStrategy: args.prefix,
    });
  } else {
    if (!args.src || !args.out) {
      console.error('Error: Both --src and --out arguments are required\n');
      showHelp();
      process.exit(1);
    }

    finalOptions = {
      src: args.src,
      out: args.out,
      public: args.public,
      exts: args.exts ? args.exts.split(',').map(e => e.trim()) : undefined,
      exclude: args.exclude
        ? args.exclude.split(',').map(e => e.trim())
        : undefined,
      include: args.include
        ? args.include.split(',').map(e => e.trim())
        : undefined,
      namingStrategy: args.naming,
      prefixStrategy: args.prefix,
    };
  }

  if (args['dry-run']) {
    console.log('🔍 Dry run - showing what would be generated:\n');
    console.log('Options:', JSON.stringify(finalOptions, null, 2));
    process.exit(0);
  }

  try {
    const result = generateAssetsMap(finalOptions);

    console.log(`✅ Assets map generated successfully!`);
    console.log(`   Output: ${result.outputFile}`);
    console.log(`   Processed: ${result.totalFiles} files`);

    if (result.directories.length > 0) {
      console.log(`   Directories: ${result.directories.join(', ')}`);
    }

    if (result.duplicates.length > 0) {
      console.log(`   Duplicates: ${result.duplicates.join(', ')}`);
    }

    if (args.stats) {
      console.log('\n📊 Statistics:');
      console.log(`   Total files: ${result.totalFiles}`);
      console.log(`   Unique directories: ${result.directories.length}`);
      console.log(`   Duplicate names: ${result.duplicates.length}`);
      console.log(`   Processed files: ${result.processedFiles.length}`);
    }

    if (args.watch || args.w) {
      console.log('');
      const watcher = watchAssetsMap(finalOptions);

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
    if (typeof error === 'object' && error && 'message' in error) {
      console.error('❌ Error:', (error as any).message);
    } else {
      console.error('❌ Error:', String(error));
    }
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
