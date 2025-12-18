const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const libDir = path.join(__dirname, 'lib');
if (fs.existsSync(libDir)) {
  fs.rmSync(libDir, { recursive: true, force: true });
}

// Minify function - removes comments and extra whitespace
function minifyJS(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\/\/.*$/gm, '') // Remove line comments
    .replace(/console\.(warn|log|error)\([^)]*\);?/g, '') // Remove console calls
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/\s*([{}();,=[\]<>*+-])\s*/g, '$1') // Remove spaces around operators
    .trim();
}

console.log('🔨 Compiling TypeScript...');

try {
  execSync('npx tsc', { stdio: 'inherit' });
  console.log('✅ TypeScript compiled to lib/');

  // Minify .js files
  const jsFiles = [
    path.join(libDir, 'index.js'),
    path.join(libDir, 'generator.js'),
    path.join(libDir, 'config.js'),
  ];
  jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      content = minifyJS(content);
      fs.writeFileSync(file, content, 'utf8');
    }
  });

  const binDir = path.join(__dirname, 'bin');
  const libBinDir = path.join(libDir, 'bin');
  const cliTsFile = path.join(binDir, 'assets-mapper.ts');

  if (fs.existsSync(cliTsFile)) {
    // Ensure lib/bin directory exists
    if (!fs.existsSync(libBinDir)) {
      fs.mkdirSync(libBinDir, { recursive: true });
    }

    execSync(
      `npx tsc ${cliTsFile} --outDir ${libBinDir} --target ES2020 --module CommonJS --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck`,
      { stdio: 'inherit' }
    );

    const compiledCliFile = path.join(libBinDir, 'assets-mapper.js');
    if (fs.existsSync(compiledCliFile)) {
      let content = fs.readFileSync(compiledCliFile, 'utf8');
      content = content.replace(
        /require\(["']\.\.\/lib\/generator\.js["']\)/g,
        'require("../generator.js")'
      );
      content = minifyJS(content);
      fs.writeFileSync(compiledCliFile, content, 'utf8');
    }

    console.log('✅ CLI compiled to lib/bin/');
  }

  // Remove .d.ts files to reduce package size
  const dtsFiles = [];
  function findDtsFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        findDtsFiles(fullPath);
      } else if (file.endsWith('.d.ts')) {
        dtsFiles.push(fullPath);
      }
    });
  }
  findDtsFiles(libDir);
  dtsFiles.forEach(file => fs.unlinkSync(file));

  // Verify required files exist
  const requiredFiles = ['index.js', 'generator.js'];
  requiredFiles.forEach(file => {
    const filePath = path.join(libDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing required file: ${file}`);
      process.exit(1);
    }
  });

  console.log('✅ Build verification complete');
} catch (error) {
  console.error('❌ TypeScript compilation failed:', error.message);
  process.exit(1);
}
