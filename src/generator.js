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
 * Creates a valid export name from a filename
 * @param {string} filename - The filename to convert
 * @returns {string} A valid export name
 */
function makeExportName(filename) {
  const name = path.parse(filename).name;
  return sanitizeName(name);
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

  // Read directory contents and filter for valid image files
  let allFiles;
  try {
    allFiles = fs.readdirSync(src);
  } catch (error) {
    throw new Error(`Failed to read source directory: ${error.message}`);
  }

  const files = allFiles.filter((f) => {
    const ext = (path.extname(f) || "").slice(1).toLowerCase();
    return exts.includes(ext);
  });

  if (files.length === 0) {
    console.warn(
      `No image files found in ${src} with extensions: ${exts.join(", ")}`
    );
  }

  const lines = [];
  const mapEntries = [];
  const exportNames = new Set(); // Track duplicate export names

  files.forEach((file) => {
    let exportName = makeExportName(file);

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
        const relativePath = path.relative(publicDir, path.join(src, file));
        const route = "/" + relativePath.replace(/\\/g, "/");
        lines.push(`export const ${exportName} = "${route}";`);
        mapEntries.push(`  ${exportName}`);
      } catch (error) {
        // Fallback if public directory structure is not standard
        lines.push(`export const ${exportName} = "/${file}";`);
        mapEntries.push(`  ${exportName}`);
      }
    } else {
      // Generate relative import path
      const relativePath = path.relative(
        path.dirname(out),
        path.join(src, file)
      );
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
    processedFiles: files,
    totalFiles: files.length,
    skippedFiles: allFiles.length - files.length,
  };
}

module.exports = { generateAssetsMap };
