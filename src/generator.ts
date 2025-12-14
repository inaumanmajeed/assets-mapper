import fs from 'fs';
import path from 'path';

export function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^([0-9])/, '_$1');
}

export interface AssetFile {
  fullPath: string;
  relativePath: string;
  filename: string;
  name: string;
  directory: string;
}

export function scanDirectoryRecursive(
  dir: string,
  exts: string[],
  baseDir: string
): AssetFile[] {
  const results: AssetFile[] = [];
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        results.push(...scanDirectoryRecursive(fullPath, exts, baseDir));
      } else if (stats.isFile()) {
        const ext = path.extname(item).slice(1).toLowerCase();
        if (exts.includes(ext)) {
          const relativePath = path.relative(baseDir, fullPath);
          results.push({
            fullPath,
            relativePath,
            filename: item,
            name: path.parse(item).name,
            directory: path.dirname(relativePath),
          });
        }
      }
    }
  } catch (error) {
    if (typeof error === 'object' && error && 'message' in error) {
      console.warn(
        `Warning: Could not read directory ${dir}: ${(error as any).message}`
      );
    } else {
      console.warn(`Warning: Could not read directory ${dir}`);
    }
  }
  return results;
}

export interface GenerateAssetsMapOptions {
  src: string;
  out: string;
  public?: boolean;
  exts?: string[];
}

export interface GenerateAssetsMapResult {
  outputFile: string;
  processedFiles: string[];
  totalFiles: number;
  directories: string[];
  duplicates: string[];
}

export function generateAssetsMap(
  options: GenerateAssetsMapOptions
): GenerateAssetsMapResult {
  if (!options || typeof options !== 'object') {
    throw new Error('Options object is required');
  }
  if (!options.src || typeof options.src !== 'string') {
    throw new Error('src directory is required and must be a string');
  }
  if (!options.out || typeof options.out !== 'string') {
    throw new Error('out file path is required and must be a string');
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
    'png',
    'jpg',
    'jpeg',
    'svg',
    'webp',
    'gif',
    'ico',
    'bmp',
    'tiff',
  ];
  const exts = (options.exts || defaultExts).map(e => e.toLowerCase());

  const imageFiles = scanDirectoryRecursive(src, exts, src);

  if (imageFiles.length === 0) {
    console.warn(
      `No image files found in ${src} (including subdirectories) with extensions: ${exts.join(
        ', '
      )}`
    );
  }

  const nameUsageCount: { [key: string]: number } = {};

  const lines: string[] = [];
  const mapEntries: string[] = [];
  const exportNames: Set<string> = new Set();

  imageFiles.forEach(fileInfo => {
    let exportName: string;
    const baseName = sanitizeName(fileInfo.name);

    nameUsageCount[baseName] = (nameUsageCount[baseName] || 0) + 1;

    if (nameUsageCount[baseName] === 1) {
      exportName = baseName;
    } else {
      const dir = fileInfo.directory;
      if (dir && dir !== '.') {
        const dirParts = dir.split(path.sep).filter(part => part !== '.');
        const dirName = dirParts.join('_');
        exportName = sanitizeName(`${dirName}_${fileInfo.name}`);
      } else {
        exportName = baseName;
      }
    }

    let counter = 1;
    const originalName = exportName;
    while (exportNames.has(exportName)) {
      exportName = `${originalName}_${counter}`;
      counter++;
    }
    exportNames.add(exportName);

    if (options.public) {
      try {
        const publicDir = path.resolve(cwd, 'public');
        const relativePath = path.relative(publicDir, fileInfo.fullPath);
        const route = '/' + relativePath.replace(/\\/g, '/');
        lines.push(`export const ${exportName} = "${route}";`);
        mapEntries.push(`  ${exportName}`);
      } catch (error) {
        const route = '/' + fileInfo.relativePath.replace(/\\/g, '/');
        lines.push(`export const ${exportName} = "${route}";`);
        mapEntries.push(`  ${exportName}`);
      }
    } else {
      const relativePath = path.relative(path.dirname(out), fileInfo.fullPath);
      const importPath = relativePath.startsWith('.')
        ? relativePath
        : `./${relativePath}`;
      const normalizedPath = importPath.replace(/\\/g, '/');
      lines.push(`import ${exportName} from "${normalizedPath}";`);
      mapEntries.push(`  ${exportName}`);
    }
  });

  lines.push('');
  lines.push('const assetsMap = {');
  lines.push(mapEntries.join(',\n'));
  lines.push('};');
  lines.push('');
  lines.push('export default assetsMap;');

  const content = lines.join('\n');

  try {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, content, 'utf8');
  } catch (error) {
    if (typeof error === 'object' && error && 'message' in error) {
      throw new Error(`Failed to write output file: ${(error as any).message}`);
    } else {
      throw new Error(`Failed to write output file.`);
    }
  }

  return {
    outputFile: out,
    processedFiles: imageFiles.map(f => f.relativePath),
    totalFiles: imageFiles.length,
    directories: [
      ...new Set(imageFiles.map(f => f.directory).filter(d => d !== '.')),
    ],
    duplicates: Object.keys(nameUsageCount).filter(
      name => nameUsageCount[name] && nameUsageCount[name] > 1
    ),
  };
}

export function watchAssetsMap(
  options: GenerateAssetsMapOptions,
  callback?: (err: Error | null, result: GenerateAssetsMapResult | null) => void
): { close: () => void } {
  let watcher: fs.FSWatcher | undefined;
  try {
    watcher = fs.watch(
      options.src,
      { recursive: true },
      (eventType: string, filename: string | null) => {
        if (!filename) return;
        const ext = path.extname(filename).slice(1).toLowerCase();
        const defaultExts = [
          'png',
          'jpg',
          'jpeg',
          'svg',
          'webp',
          'gif',
          'ico',
          'bmp',
          'tiff',
        ];
        const exts = (options.exts || defaultExts).map(e => e.toLowerCase());

        if (exts.includes(ext)) {
          console.log(
            `🔄 Detected change in ${filename}, regenerating assets map...`
          );
          try {
            const result = generateAssetsMap(options);
            console.log(
              `✅ Assets map updated! Processed ${result.totalFiles} files`
            );
            if (callback) callback(null, result);
          } catch (error) {
            if (typeof error === 'object' && error && 'message' in error) {
              console.error(
                `❌ Error regenerating assets map: ${(error as any).message}`
              );
            } else {
              console.error(`❌ Error regenerating assets map.`);
            }
            if (callback)
              callback(
                error instanceof Error ? error : new Error('Unknown error'),
                null
              );
          }
        }
      }
    );

    console.log(`👀 Watching ${options.src} for changes...`);
    console.log(`💡 Press Ctrl+C to stop watching`);

    return {
      close: () => {
        if (watcher) {
          watcher.close();
          console.log('🛑 Stopped watching for changes');
        }
      },
    };
  } catch (error) {
    if (typeof error === 'object' && error && 'message' in error) {
      throw new Error(
        `Failed to start file watcher: ${(error as any).message}`
      );
    } else {
      throw new Error(`Failed to start file watcher.`);
    }
  }
}

export function cleanupAssetsMap(outputPath: string): boolean {
  try {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
      console.log(`🗑️ Cleaned up assets map file: ${outputPath}`);
      return true;
    }
    return false;
  } catch (error) {
    if (typeof error === 'object' && error && 'message' in error) {
      console.warn(
        `Warning: Could not cleanup assets map file: ${(error as any).message}`
      );
    } else {
      console.warn(`Warning: Could not cleanup assets map file.`);
    }
    return false;
  }
}
