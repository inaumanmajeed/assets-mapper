export {
  generateAssetsMap,
  watchAssetsMap,
  cleanupAssetsMap,
  sanitizeName,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  applyNamingStrategy,
  scanDirectoryRecursive,
} from './generator';

export { loadConfig, mergeConfig } from './config';

export type {
  GenerateAssetsMapOptions,
  GenerateAssetsMapResult,
  AssetFile,
} from './generator';

export type { AssetsMapperConfig } from './config';
