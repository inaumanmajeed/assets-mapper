/**
 * Assets Mapper Configuration
 *
 * This file demonstrates all available configuration options.
 * Place this file in your project root as 'assets-mapper.config.js'
 */

export default {
  /**
   * Source directory containing your assets
   * @required
   */
  src: './src/assets',

  /**
   * Output file path for the generated assets map
   * @required
   */
  out: './src/assetsMap.ts',

  /**
   * Generate public URLs instead of import statements
   * Useful for Next.js public folder or static assets
   * @default false
   */
  public: false,

  /**
   * File extensions to include
   * Defaults to common image formats
   */
  exts: ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'],

  /**
   * Glob patterns to exclude from processing
   * Defaults to node_modules and .git folders
   */
  exclude: [
    '**/node_modules/**',
    '**/.git/**',
    '**/test/**',
    '**/temp/**',
    '**/__tests__/**',
  ],

  /**
   * Glob patterns to include (only these will be processed)
   * If specified, only matching files will be included
   */
  // include: ['**/icons/**', '**/images/**'],

  /**
   * Naming strategy for export names
   * - 'camelCase': myImageFile
   * - 'snake_case': my_image_file
   * - 'kebab-case': my-image-file (only for string exports)
   * @default undefined (sanitized default)
   */
  namingStrategy: 'camelCase',

  /**
   * Strategy for naming duplicate files
   * - 'folder': uses immediate parent folder (e.g., icons_logo)
   * - 'path': uses full directory path (e.g., assets_icons_logo)
   * - 'hash': uses hash of file path (e.g., logo_a1b2c3d4)
   * @default 'folder'
   */
  prefixStrategy: 'folder',
};
