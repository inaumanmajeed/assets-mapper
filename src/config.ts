import fs from 'fs';
import path from 'path';

export interface AssetsMapperConfig {
  src: string;
  out: string;
  public?: boolean;
  exts?: string[];
  exclude?: string[];
  include?: string[];
  namingStrategy?: 'camelCase' | 'snake_case' | 'kebab-case';
  prefixStrategy?: 'folder' | 'path' | 'hash';
}

const CONFIG_FILES = [
  'assets-mapper.config.js',
  'assets-mapper.config.mjs',
  'assets-mapper.config.cjs',
  '.assetsmapperrc.js',
  '.assetsmapperrc.json',
];

export async function loadConfig(
  cwd: string = process.cwd()
): Promise<AssetsMapperConfig | null> {
  for (const configFile of CONFIG_FILES) {
    const configPath = path.join(cwd, configFile);
    if (fs.existsSync(configPath)) {
      try {
        if (configFile.endsWith('.json')) {
          const content = fs.readFileSync(configPath, 'utf8');
          return JSON.parse(content);
        } else {
          const imported = await import(configPath);
          return imported.default || imported;
        }
      } catch (error) {
        console.warn(`Warning: Could not load config from ${configFile}`);
      }
    }
  }
  return null;
}

export function mergeConfig(
  config: AssetsMapperConfig | null,
  options: Partial<AssetsMapperConfig>
): AssetsMapperConfig {
  const merged = { ...config, ...options };

  if (!merged.src || !merged.out) {
    throw new Error('Both src and out are required');
  }

  return merged as AssetsMapperConfig;
}
