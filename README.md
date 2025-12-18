# Assets Mapper

Auto-generate asset maps from folders for React and Next.js projects.

## Install

```bash
npm install assets-mapper
```

## CLI Commands

### Generate
Scan assets folder and generate map file once.
```bash
assets-mapper generate --src ./public/assets --out ./src/assets-map.js
```

**Options:**
- `-s, --src <path>` - Source directory (required)
- `-o, --out <path>` - Output file path (required)
- `-e, --exts <extensions>` - File extensions (comma-separated, default: png,jpg,jpeg,svg,webp,gif,ico,bmp,tiff)
- `-n, --naming <strategy>` - Naming strategy: camelCase, snake_case, kebab-case (default: sanitized)
- `-p, --public` - Generate public routes instead of imports
- `--exclude <patterns>` - Exclude patterns (comma-separated)
- `--include <patterns>` - Include patterns (comma-separated)

### Watch
Watch assets folder and regenerate map on changes.
```bash
assets-mapper watch --src ./public/assets --out ./src/assets-map.js
```

Same options as `generate` command.

### Cleanup
Remove generated assets map file.
```bash
assets-mapper cleanup ./src/assets-map.js
```

## Config File

Create `assets-mapper.config.js`:
```javascript
module.exports = {
  src: './public/assets',
  out: './src/assets-map.js',
  exts: ['png', 'jpg', 'svg', 'webp', 'gif'],
  namingStrategy: 'camelCase',
  public: false,
  exclude: ['**/node_modules/**'],
  include: ['**/*.{png,jpg,svg}'],
};
```

## Programmatic API

```typescript
import { generateAssetsMap, watchAssetsMap, cleanupAssetsMap } from 'assets-mapper';

// Generate
const result = generateAssetsMap({ src: './public/assets', out: './src/assets-map.js' });

// Watch
const watcher = watchAssetsMap({ src: './public/assets', out: './src/assets-map.js' });
watcher.close();

// Cleanup
cleanupAssetsMap('./src/assets-map.js');
```

**Full documentation**: https://github.com/inaumanmajeed/assets-mapper
