import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  sanitizeName,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  applyNamingStrategy,
  scanDirectoryRecursive,
  generateAssetsMap,
} from '../src/generator';

describe('sanitizeName', () => {
  it('should sanitize special characters', () => {
    expect(sanitizeName('my-image.png')).toBe('my_image_png');
    expect(sanitizeName('hello world')).toBe('hello_world');
    expect(sanitizeName('icon@2x')).toBe('icon_2x');
  });

  it('should handle numbers at start', () => {
    expect(sanitizeName('123icon')).toBe('_123icon');
    expect(sanitizeName('4k-image')).toBe('_4k_image');
  });

  it('should preserve valid characters', () => {
    expect(sanitizeName('validName123')).toBe('validName123');
    expect(sanitizeName('snake_case_name')).toBe('snake_case_name');
  });
});

describe('naming strategies', () => {
  it('should convert to camelCase', () => {
    expect(toCamelCase('hello-world')).toBe('helloWorld');
    expect(toCamelCase('my_image_file')).toBe('myImageFile');
    expect(toCamelCase('icon@2x')).toBe('icon2x');
  });

  it('should convert to snake_case', () => {
    expect(toSnakeCase('HelloWorld')).toBe('helloworld');
    expect(toSnakeCase('my-image-file')).toBe('my_image_file');
    expect(toSnakeCase('icon@2x')).toBe('icon_2x');
  });

  it('should convert to kebab-case', () => {
    expect(toKebabCase('HelloWorld')).toBe('helloworld');
    expect(toKebabCase('my_image_file')).toBe('my-image-file');
    expect(toKebabCase('icon@2x')).toBe('icon-2x');
  });

  it('should apply naming strategies', () => {
    expect(applyNamingStrategy('hello-world', 'camelCase')).toBe('helloWorld');
    expect(applyNamingStrategy('hello-world', 'snake_case')).toBe(
      'hello_world'
    );
    expect(applyNamingStrategy('hello-world', 'kebab-case')).toBe(
      'hello-world'
    );
  });
});

describe('scanDirectoryRecursive', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'assets-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should find image files in directory', () => {
    fs.writeFileSync(path.join(tempDir, 'image1.png'), 'fake');
    fs.writeFileSync(path.join(tempDir, 'image2.jpg'), 'fake');
    fs.writeFileSync(path.join(tempDir, 'not-image.txt'), 'fake');

    const results = scanDirectoryRecursive(
      tempDir,
      ['png', 'jpg'],
      tempDir,
      undefined,
      undefined
    );

    expect(results).toHaveLength(2);
    expect(results.some(r => r.filename === 'image1.png')).toBe(true);
    expect(results.some(r => r.filename === 'image2.jpg')).toBe(true);
  });

  it('should scan nested directories', () => {
    const subDir = path.join(tempDir, 'icons');
    fs.mkdirSync(subDir);
    fs.writeFileSync(path.join(tempDir, 'logo.png'), 'fake');
    fs.writeFileSync(path.join(subDir, 'icon.svg'), 'fake');

    const results = scanDirectoryRecursive(
      tempDir,
      ['png', 'svg'],
      tempDir,
      undefined,
      undefined
    );

    expect(results).toHaveLength(2);
    expect(results.some(r => r.directory === '.')).toBe(true);
    expect(results.some(r => r.directory === 'icons')).toBe(true);
  });

  it('should handle empty directory', () => {
    const results = scanDirectoryRecursive(
      tempDir,
      ['png'],
      tempDir,
      undefined,
      undefined
    );
    expect(results).toHaveLength(0);
  });
});

describe('generateAssetsMap', () => {
  let tempDir: string;
  let outputFile: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'assets-test-'));
    outputFile = path.join(tempDir, 'output.js');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should generate assets map file', () => {
    fs.writeFileSync(path.join(tempDir, 'logo.png'), 'fake');

    const result = generateAssetsMap({
      src: tempDir,
      out: outputFile,
    });

    expect(fs.existsSync(outputFile)).toBe(true);
    expect(result.totalFiles).toBe(1);
    expect(result.processedFiles).toHaveLength(1);
  });

  it('should handle duplicates correctly - first keeps simple name', () => {
    fs.writeFileSync(path.join(tempDir, 'logo.png'), 'fake');
    const subDir = path.join(tempDir, 'icons');
    fs.mkdirSync(subDir);
    fs.writeFileSync(path.join(subDir, 'logo.png'), 'fake');

    generateAssetsMap({
      src: tempDir,
      out: outputFile,
    });

    const content = fs.readFileSync(outputFile, 'utf8');
    expect(content).toContain('import logo from');
    expect(content).toContain('import icons_logo from');
    expect(content).not.toContain('import root_logo from');
  });

  it('should generate public URLs when public option is true', () => {
    fs.writeFileSync(path.join(tempDir, 'banner.jpg'), 'fake');

    generateAssetsMap({
      src: tempDir,
      out: outputFile,
      public: true,
    });

    const content = fs.readFileSync(outputFile, 'utf8');
    expect(content).toContain('export const banner =');
    expect(content).toContain('/banner.jpg');
  });

  it('should throw error for missing source directory', () => {
    expect(() => {
      generateAssetsMap({
        src: '/nonexistent/path',
        out: outputFile,
      });
    }).toThrow();
  });

  it('should respect custom file extensions', () => {
    fs.writeFileSync(path.join(tempDir, 'image.png'), 'fake');
    fs.writeFileSync(path.join(tempDir, 'icon.svg'), 'fake');

    const result = generateAssetsMap({
      src: tempDir,
      out: outputFile,
      exts: ['png'],
    });

    expect(result.totalFiles).toBe(1);
    expect(result.processedFiles[0]).toContain('.png');
  });

  it('should handle deeply nested directories', () => {
    const deep = path.join(tempDir, 'a', 'b', 'c');
    fs.mkdirSync(deep, { recursive: true });
    fs.writeFileSync(path.join(deep, 'deep.png'), 'fake');

    const result = generateAssetsMap({
      src: tempDir,
      out: outputFile,
    });

    expect(result.totalFiles).toBe(1);
    const content = fs.readFileSync(outputFile, 'utf8');
    expect(content).toContain('import deep from');
  });

  it('should report duplicates in result', () => {
    fs.writeFileSync(path.join(tempDir, 'logo.png'), 'fake');
    const subDir = path.join(tempDir, 'icons');
    fs.mkdirSync(subDir);
    fs.writeFileSync(path.join(subDir, 'logo.png'), 'fake');

    const result = generateAssetsMap({
      src: tempDir,
      out: outputFile,
    });

    expect(result.duplicates).toContain('logo');
    expect(result.duplicates).toHaveLength(1);
  });

  it('should respect exclude patterns', () => {
    const testDir = path.join(tempDir, 'test');
    fs.mkdirSync(testDir);
    fs.writeFileSync(path.join(tempDir, 'logo.png'), 'fake');
    fs.writeFileSync(path.join(testDir, 'test.png'), 'fake');

    const result = generateAssetsMap({
      src: tempDir,
      out: outputFile,
      exclude: ['**/test/**'],
    });

    expect(result.totalFiles).toBe(1);
    expect(result.processedFiles[0]).toContain('logo.png');
  });

  it('should respect include patterns', () => {
    const iconsDir = path.join(tempDir, 'icons');
    fs.mkdirSync(iconsDir);
    fs.writeFileSync(path.join(tempDir, 'logo.png'), 'fake');
    fs.writeFileSync(path.join(iconsDir, 'icon.png'), 'fake');

    const result = generateAssetsMap({
      src: tempDir,
      out: outputFile,
      include: ['**/icons/**'],
    });

    expect(result.totalFiles).toBe(1);
    expect(result.processedFiles[0]).toContain('icon.png');
  });

  it('should apply camelCase naming strategy', () => {
    fs.writeFileSync(path.join(tempDir, 'my-logo.png'), 'fake');

    generateAssetsMap({
      src: tempDir,
      out: outputFile,
      namingStrategy: 'camelCase',
    });

    const content = fs.readFileSync(outputFile, 'utf8');
    expect(content).toContain('import myLogo from');
  });

  it('should use different prefix strategies', () => {
    fs.writeFileSync(path.join(tempDir, 'logo.png'), 'fake');
    const subDir = path.join(tempDir, 'icons');
    fs.mkdirSync(subDir);
    fs.writeFileSync(path.join(subDir, 'logo.png'), 'fake');

    generateAssetsMap({
      src: tempDir,
      out: outputFile,
      prefixStrategy: 'path',
    });

    const content = fs.readFileSync(outputFile, 'utf8');
    expect(content).toContain('import logo from');
    expect(content).toContain('import icons_logo from');
  });
});
