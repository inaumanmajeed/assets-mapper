const fs = require("fs");
const path = require("path");

/**
 * Sanitizes a name to be a valid JavaScript identifier
 * @param {string} name - The name to sanitize
 * @returns {string} A valid JavaScript identifier
 */
function sanitizeName(name) {
  if (!name || typeof name !== "string") {
    throw new Error("Invalid name provided for sanitization");
  }
  // Replace invalid chars, ensure it starts with letter/underscore
  return name.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^([0-9])/, "_$1");
}

/**
 * Creates a valid export name from a filename and its directory path
 * @param {string} filename - The filename to convert
 * @param {string} relativePath - The relative path from src directory
 * @returns {string} A valid export name
 */
function makeExportName(filename, relativePath = '') {
  const name = path.parse(filename).name;
  const dir = path.dirname(relativePath);
  
  // Always include directory name if file is in subdirectories for better organization
  if (dir && dir !== '.') {
    // Handle nested directories by joining with underscores
    const dirParts = dir.split(path.sep).filter(part => part !== '.');
    const dirName = dirParts.join('_');
    return sanitizeName(`${dirName}_${name}`);
  }
  
  return sanitizeName(name);
}

/**
 * Recursively scans directory for image files
 * @param {string} dir - Directory to scan
 * @param {string[]} exts - File extensions to include
 * @param {string} baseDir - Base source directory for relative paths
 * @returns {Array} Array of file objects with path and relative path info
 */
function scanDirectoryRecursive(dir, exts, baseDir) {
  const results = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        // Recursively scan subdirectories
        results.push(...scanDirectoryRecursive(fullPath, exts, baseDir));
      } else if (stats.isFile()) {
        const ext = path.extname(item).slice(1).toLowerCase();
        if (exts.includes(ext)) {
          const relativePath = path.relative(baseDir, fullPath);
          results.push({
            fullPath,
            relativePath,
            filename: item,
            directory: path.dirname(relativePath)
          });
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
  }
  
  return results;
}

/**
 * Generates an assets map from a source directory
 * @param {Object} options - Configuration options
 * @param {string} options.src - Source directory containing assets
 * @param {string} options.out - Output file path for the generated map
 * @param {boolean} [options.public=false] - Whether assets are in public directory
 * @param {string[]} [options.exts] - File extensions to include
 * @returns {Object} Result object with output path and processed files
 */
function generateAssetsMap(options) {
  // Validate required parameters
  if (!options || typeof options !== "object") {
    throw new Error("Options object is required");
  }
  if (!options.src || typeof options.src !== "string") {
    throw new Error("src directory is required and must be a string");
  }
  if (!options.out || typeof options.out !== "string") {
    throw new Error("out file path is required and must be a string");
  }

  const cwd = process.cwd();
  const src = path.resolve(cwd, options.src);

  if (!fs.existsSync(src)) {
    throw new Error(`Source folder not found: ${src}`);
  }

  const srcStats = fs.statSync(src);
  if (!srcStats.isDirectory()) {
    throw new Error(`Source path is not a directory: ${src}`);
  }

  const out = path.resolve(cwd, options.out);
  const defaultExts = [
    "png",
    "jpg",
    "jpeg",
    "svg",
    "webp",
    "gif",
    "ico",
    "bmp",
    "tiff",
  ];
  const exts = (options.exts || defaultExts).map((e) => e.toLowerCase());

  // Recursively scan directory for image files
  const imageFiles = scanDirectoryRecursive(src, exts, src);

  if (imageFiles.length === 0) {
    console.warn(
      `No image files found in ${src} (including subdirectories) with extensions: ${exts.join(", ")}`
    );
  }

  const lines = [];
  const mapEntries = [];
  const exportNames = new Set(); // Track duplicate export names

  imageFiles.forEach((fileInfo) => {
    let exportName = makeExportName(fileInfo.filename, fileInfo.relativePath);

    // Handle duplicate export names
    let counter = 1;
    const originalName = exportName;
    while (exportNames.has(exportName)) {
      exportName = `${originalName}_${counter}`;
      counter++;
    }
    exportNames.add(exportName);

    if (options.public) {
      try {
        const publicDir = path.resolve(cwd, "public");
        const relativePath = path.relative(publicDir, fileInfo.fullPath);
        const route = "/" + relativePath.replace(/\\/g, "/");
        lines.push(`export const ${exportName} = "${route}";`);
        mapEntries.push(`  ${exportName}`);
      } catch (error) {
        // Fallback if public directory structure is not standard
        const route = "/" + fileInfo.relativePath.replace(/\\/g, "/");
        lines.push(`export const ${exportName} = "${route}";`);
        mapEntries.push(`  ${exportName}`);
      }
    } else {
      // Generate relative import path
      const relativePath = path.relative(path.dirname(out), fileInfo.fullPath);
      const importPath = relativePath.startsWith(".")
        ? relativePath
        : `./${relativePath}`;
      const normalizedPath = importPath.replace(/\\/g, "/");
      lines.push(`import ${exportName} from "${normalizedPath}";`);
      mapEntries.push(`  ${exportName}`);
    }
  });

  // Build the final content
  lines.push("");
  lines.push("const assetsMap = {");
  lines.push(mapEntries.join(",\n"));
  lines.push("};");
  lines.push("");
  lines.push("export default assetsMap;");

  const content = lines.join("\n");

  // Ensure output directory exists and write file
  try {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, content, "utf8");
  } catch (error) {
    throw new Error(`Failed to write output file: ${error.message}`);
  }

  return {
    outputFile: out,
    processedFiles: imageFiles.map(f => f.relativePath),
    totalFiles: imageFiles.length,
    directories: [...new Set(imageFiles.map(f => f.directory).filter(d => d !== '.'))],
    skippedFiles: 0 // We'll calculate this properly in a future update
  };
}

/**
 * Starts watching the source directory for changes and regenerates assets map
 * @param {Object} options - Same options as generateAssetsMap
 * @param {Function} callback - Optional callback called after each regeneration
 * @returns {Object} Watcher object with close() method
 */
function watchAssetsMap(options, callback) {
  let watcher;
  
  try {
    watcher = fs.watch(options.src, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      
      const ext = path.extname(filename).slice(1).toLowerCase();
      const defaultExts = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif', 'ico', 'bmp', 'tiff'];
      const exts = (options.exts || defaultExts).map(e => e.toLowerCase());
      
      if (exts.includes(ext)) {
        console.log(`🔄 Detected change in ${filename}, regenerating assets map...`);
        
        try {
          const result = generateAssetsMap(options);
          console.log(`✅ Assets map updated! Processed ${result.totalFiles} files`);
          
          if (callback && typeof callback === 'function') {
            callback(null, result);
          }
        } catch (error) {
          console.error(`❌ Error regenerating assets map: ${error.message}`);
          
          if (callback && typeof callback === 'function') {
            callback(error, null);
          }
        }
      }
    });
    
    console.log(`👀 Watching ${options.src} for changes...`);
    console.log(`💡 Press Ctrl+C to stop watching`);
    
    return {
      close: () => {
        if (watcher) {
          watcher.close();
          console.log('🛑 Stopped watching for changes');
        }
      }
    };
    
  } catch (error) {
    throw new Error(`Failed to start file watcher: ${error.message}`);
  }
}

module.exports = { generateAssetsMap, watchAssetsMap };
