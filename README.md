# Assets Mapper

🚀 **Auto-generate TypeScript-safe asset maps from your image folders with smart duplicate handling and file watching.**

Perfect for React, Next.js, Vue, and any JavaScript/TypeScript framework. Never deal with broken image paths again!

> **v2.0.0**: Now built with TypeScript for enhanced type safety and better developer experience!

## ✨ Features

- 🔍 **Recursive directory scanning** - finds assets in nested folders
- 👀 **File watching** - auto-regenerates when assets change  
- 🎯 **Smart duplicate handling** - only adds folder prefixes when needed
- 📦 **Framework agnostic** - works with any JS/TS project
- 🚀 **Full TypeScript support** - built with TypeScript, includes type definitions
- 🛠️ **Zero configuration** - works out of the box
- ⚡ **Fast & reliable** - optimized build pipeline with error handling
- 🧹 **Auto-cleanup** - removes generated files on uninstall

## 📦 Installation

```bash
npm install assets-mapper
```

## 🚀 Quick Start

### CLI Usage
```bash
# Basic usage (JavaScript)
npx assets-mapper --src src/assets --out src/assetsMap.js

# Generate TypeScript file with type definitions
npx assets-mapper --src src/assets --out src/assetsMap.ts

# With file watching (recommended for development)
npx assets-mapper --src src/assets --out src/assetsMap.js --watch

# For Next.js public folder
npx assets-mapper --src public/images --out src/assetsMap.js --public

# TypeScript + watching for development
npx assets-mapper --src src/assets --out src/assetsMap.ts --watch
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

| Option | Description | Default |
|--------|-------------|---------|
| `--src` | Source directory | Required |
| `--out` | Output file path | Required |
| `--watch` | Watch for changes | `false` |
| `--public` | Use public folder paths | `false` |
| `--exts` | File extensions | `png,jpg,jpeg,svg,webp,gif,ico` |

## 🧠 Smart Features

**Duplicate Handling**: Only adds folder prefixes when filenames actually conflict:
- `logo.png` → `logo` (simple name)
- `icons/logo.png` → `icons_logo` (prefixed due to conflict)

**Auto-cleanup**: Removes generated files when package is uninstalled.

**File Watching**: Automatically regenerates when you add/remove/rename assets.

## 🎯 Why Assets Mapper?

- ✅ **No more broken paths** - catch missing assets at build time
- ✅ **Full TypeScript support** - built with TypeScript, includes type definitions
- ✅ **IntelliSense everywhere** - autocomplete for all your assets  
- ✅ **Refactor friendly** - rename files without breaking imports
- ✅ **Tree shaking ready** - only bundle what you use
- ✅ **Framework agnostic** - works with React, Next.js, Vue, Svelte, etc.
- ✅ **Production ready** - robust error handling and optimized builds

## 🆕 What's New in v2.0.0

- **🔥 Full TypeScript Migration**: Complete rewrite in TypeScript with strict type checking
- **📝 Type Definitions**: Generated `.d.ts` files for perfect IDE integration
- **⚡ Enhanced Performance**: Optimized build pipeline and error handling
- **🎨 Code Quality**: Prettier integration with pre-commit hooks
- **🛡️ Type Safety**: All functions now have proper type annotations

## 🔧 Requirements

- Node.js 14+ 
- Works with React, Next.js, Vue, Svelte, and any JavaScript/TypeScript framework

## 📝 License

MIT - see [LICENSE](LICENSE) for details.

---

**Made with ❤️ for developers who hate broken image paths**