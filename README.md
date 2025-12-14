# Assets Mapper

🚀 **Auto-generate TypeScript-safe asset maps from your image folders with smart duplicate handling, file watching, and advanced configuration.**

Perfect for React, Next.js, Vue, and any JavaScript/TypeScript framework. Never deal with broken image paths again!

> **v2.1.1**: Documentation improvements and stability fixes. **v2.1.0**: Major feature release with config file support, naming strategies, exclude/include patterns, and comprehensive testing!

## ✨ Features

- 🔍 **Recursive directory scanning** - finds assets in nested folders
- 👀 **File watching** - auto-regenerates when assets change  
- 🎯 **Smart duplicate handling** - only adds folder prefixes when needed
- 📝 **Config file support** - project-level configuration
- 🎨 **Naming strategies** - camelCase, snake_case, or kebab-case
- 🚫 **Exclude/Include patterns** - fine-grained control over what gets processed
- 📦 **Framework agnostic** - works with any JS/TS project
- 🚀 **Full TypeScript support** - built with TypeScript, includes type definitions
- 🧪 **Fully tested** - comprehensive test suite with Jest
- 🛠️ **Zero configuration** - works out of the box
- ⚡ **Fast & reliable** - optimized build pipeline with error handling
- 🧹 **Auto-cleanup** - removes generated files on uninstall

## 📦 Installation

```bash
npm install assets-mapper
```

## 🚀 Quick Start

### 💡 Recommended: Using Config File

**Create `assets-mapper.config.js` in your project root:**

```javascript
export default {
  src: './src/assets',
  out: './src/assetsMap.ts',
  public: false,
  exts: ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'],
  exclude: ['**/node_modules/**', '**/.git/**'],
  namingStrategy: 'camelCase',
  prefixStrategy: 'folder'
};
```

**Then simply run:**
```bash
npx assets-mapper
```

Or with watching enabled:
```bash
npx assets-mapper --watch
```

---

### CLI Usage

#### Basic Commands
```bash
# Generate assets map
npx assets-mapper --src src/assets --out src/assetsMap.js

# With TypeScript
npx assets-mapper --src src/assets --out src/assetsMap.ts

# Watch mode (auto-regenerate on changes)
npx assets-mapper --src src/assets --out src/assetsMap.js --watch

# Create config file interactively
npx assets-mapper init

# Preview changes without writing
npx assets-mapper --dry-run

# Show detailed statistics
npx assets-mapper --stats
```

#### Advanced Options
```bash
# Custom naming strategy
npx assets-mapper --src src/assets --out map.js --naming camelCase
# Options: default | camelCase | snake_case | kebab-case

# Exclude patterns
npx assets-mapper --src src/assets --out map.js --exclude '**/test/**,**/temp/**'

# Include only specific patterns
npx assets-mapper --src src/assets --out map.js --include '**/icons/**,**/images/**'

# For Next.js public folder
npx assets-mapper --src public/images --out src/assetsMap.js --public

# Custom prefix strategy for duplicates
npx assets-mapper --src src/assets --out map.js --prefix path
# Options: folder (default) | path | hash

# Combine multiple options
npx assets-mapper --src src/assets --out map.ts --naming camelCase --prefix hash --watch
```

### Programmatic Usage

**JavaScript:**
```javascript
const { generateAssetsMap } = require('assets-mapper');

const result = generateAssetsMap({
  src: 'src/assets',
  out: 'src/assetsMap.js'
});

console.log(`✅ Generated map with ${result.totalFiles} assets`);
```

**TypeScript:**
```typescript
import { generateAssetsMap, GenerateAssetsMapOptions } from 'assets-mapper';

const options: GenerateAssetsMapOptions = {
  src: 'src/assets',
  out: 'src/assetsMap.js'
};

const result = generateAssetsMap(options);
console.log(`✅ Generated map with ${result.totalFiles} assets`);
```

## 📁 Example

**Your folder structure:**
```
src/assets/
├── logo.png
├── hero.jpg
├── icons/
│   ├── home.svg
│   └── logo.png    # duplicate filename
└── images/
    └── banner.webp
```

**Generated `assetsMap.js`:**
```javascript
import logo from "./assets/logo.png";
import hero from "./assets/hero.jpg"; 
import home from "./assets/icons/home.svg";
import icons_logo from "./assets/icons/logo.png";  // ← smart prefix for duplicate
import banner from "./assets/images/banner.webp";

const assetsMap = {
  logo,
  hero,
  home,
  icons_logo,
  banner
};

export default assetsMap;
```

**Use in your components:**
```jsx
import assetsMap from './assetsMap.js';

function Header() {
  return (
    <header>
      <img src={assetsMap.logo} alt="Logo" />
      <img src={assetsMap.hero} alt="Hero" />
    </header>
  );
}
```

**TypeScript with full type safety:**
```tsx
import assetsMap from './assetsMap.js';

interface HeaderProps {
  showHero?: boolean;
}

function Header({ showHero = true }: HeaderProps) {
  return (
    <header>
      <img src={assetsMap.logo} alt="Logo" /> {/* ← Full autocomplete! */}
      {showHero && <img src={assetsMap.hero} alt="Hero" />}
    </header>
  );
}
```

## ⚙️ Options

### CLI Options
| Option | Description | Default |
|--------|-------------|---------|
| `--src` | Source directory | Required |
| `--out` | Output file path | Required |
| `--watch` | Watch for changes | `false` |
| `--public` | Use public folder paths | `false` |
| `--exts` | File extensions | `png,jpg,jpeg,svg,webp,gif,ico,bmp,tiff` |
| `--exclude` | Glob patterns to exclude | `**/node_modules/**,**/.git/**` |
| `--include` | Glob patterns to include (only these) | `undefined` |
| `--naming` | Naming strategy | `default` |
| `--prefix` | Duplicate prefix strategy | `folder` |
| `--init` | Create config file | - |
| `--dry-run` | Preview without writing | - |
| `--stats` | Show detailed statistics | - |

### Config File Options
```typescript
interface AssetsMapperConfig {
  src: string;                    // Source directory
  out: string;                    // Output file path
  public?: boolean;               // Generate public URLs
  exts?: string[];                // File extensions
  exclude?: string[];             // Patterns to exclude
  include?: string[];             // Patterns to include
  namingStrategy?: 'camelCase' | 'snake_case' | 'kebab-case';
  prefixStrategy?: 'folder' | 'path' | 'hash';
}
```

### Naming Strategies
- **default**: `my_image_file` → `my_image_file`
- **camelCase**: `my-image-file` → `myImageFile`
- **snake_case**: `my-image-file` → `my_image_file`
- **kebab-case**: `my-image-file` → `my-image-file`

### Prefix Strategies (for duplicates)
- **folder**: Uses immediate parent folder name (default)
- **path**: Uses full directory path
- **hash**: Uses hash of file path

## 🧠 Smart Features

**Duplicate Handling**: Only adds folder prefixes when filenames actually conflict:
- First occurrence: `logo.png` → `logo` (keeps simple name)
- Second occurrence: `icons/logo.png` → `iconsLogo` (gets prefix)
- This preserves existing component references!

**Exclude Patterns**: Automatically excludes `node_modules` and `.git` by default.

**Auto-cleanup**: Removes generated files when package is uninstalled.

**File Watching**: Monitors your assets folder and automatically regenerates on changes.

**Config File Support**: Set defaults once, use everywhere in your project.

## 🎯 Why Assets Mapper?

- ✅ **No more broken paths** - catch missing assets at build time
- ✅ **Full TypeScript support** - built with TypeScript, includes type definitions
- ✅ **IntelliSense everywhere** - autocomplete for all your assets  
- ✅ **Refactor friendly** - rename files without breaking imports
- ✅ **Tree shaking ready** - only bundle what you use
- ✅ **Framework agnostic** - works with React, Next.js, Vue, Svelte, etc.
- ✅ **Production ready** - robust error handling and optimized builds
- ✅ **Highly configurable** - naming strategies, exclude patterns, and more
- ✅ **Fully tested** - comprehensive test suite ensures reliability

## 🆕 What's New in v2.1.0

- 🎨 **Naming Strategies** - camelCase, snake_case, or kebab-case for exports
- 📝 **Config File Support** - `assets-mapper.config.js` for project defaults
- 🚫 **Exclude/Include Patterns** - glob pattern support for fine-grained control
- 🎯 **Prefix Strategies** - folder, path, or hash for duplicate naming
- 🧪 **Full Test Coverage** - comprehensive Jest test suite
- 📊 **CLI Enhancements** - `--init`, `--dry-run`, `--stats` commands
- 🐛 **Bug Fixes** - duplicate handling preserves first occurrence names

## 📚 API

### generateAssetsMap(options)

Generates the assets map file.

```typescript
interface GenerateAssetsMapOptions {
  src: string;
  out: string;
  public?: boolean;
  exts?: string[];
  exclude?: string[];
  include?: string[];
  namingStrategy?: 'camelCase' | 'snake_case' | 'kebab-case';
  prefixStrategy?: 'folder' | 'path' | 'hash';
}

interface GenerateAssetsMapResult {
  outputFile: string;
  processedFiles: string[];
  totalFiles: number;
  directories: string[];
  duplicates: string[];
}
```

### watchAssetsMap(options, callback?)

Watch mode for automatic regeneration.

```typescript
const watcher = watchAssetsMap({
  src: 'src/assets',
  out: 'src/assetsMap.js'
});

// Later: watcher.close();
```

## 🔧 Requirements

- Node.js 14+ 
- Works with React, Next.js, Vue, Svelte, and any JavaScript/TypeScript framework

## 📝 License

MIT - see [LICENSE](LICENSE) for details.

---

**Made with ❤️ for developers who hate broken image paths**