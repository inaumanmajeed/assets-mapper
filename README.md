# Assets Mapper

🚀 **Auto-generate TypeScript-safe asset maps from your image folders with smart duplicate handling and file watching.**

Perfect for React, Next.js, Vue, and any JavaScript framework. Never deal with broken image paths again!

## ✨ Features

- 🔍 **Recursive directory scanning** - finds assets in nested folders
- 👀 **File watching** - auto-regenerates when assets change  
- 🎯 **Smart duplicate handling** - only adds folder prefixes when needed
- 📦 **Framework agnostic** - works with any JS/TS project
- 🚀 **TypeScript support** - get autocomplete for your assets
- 🛠️ **Zero configuration** - works out of the box

## 📦 Installation

```bash
npm install assets-mapper
```

## 🚀 Quick Start

### CLI Usage
```bash
# Basic usage
npx assets-mapper --src src/assets --out src/assetsMap.js

# With file watching (recommended for development)
npx assets-mapper --src src/assets --out src/assetsMap.js --watch

# For Next.js public folder
npx assets-mapper --src public/images --out src/assetsMap.js --public
```

### Programmatic Usage
```javascript
const { generateAssetsMap } = require('assets-mapper');

const result = generateAssetsMap({
  src: 'src/assets',
  out: 'src/assetsMap.js'
});

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
- ✅ **TypeScript autocomplete** - IntelliSense for all your assets  
- ✅ **Refactor friendly** - rename files without breaking imports
- ✅ **Tree shaking ready** - only bundle what you use
- ✅ **Framework agnostic** - works everywhere

## 🔧 Requirements

- Node.js 14+ 
- Works with React, Next.js, Vue, Svelte, and any JS framework

## 📝 License

MIT - see [LICENSE](LICENSE) for details.

---

**Made with ❤️ for developers who hate broken image paths**