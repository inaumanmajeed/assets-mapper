const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const libDir = path.join(__dirname, 'lib');
if (fs.existsSync(libDir)) {
  fs.rmSync(libDir, { recursive: true, force: true });
}

console.log('🔨 Compiling TypeScript...');

try {
  execSync('npx tsc', { stdio: 'inherit' });
  console.log('✅ TypeScript compiled to lib/');

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
      fs.writeFileSync(compiledCliFile, content, 'utf8');
    }

    console.log('✅ CLI compiled to lib/bin/');
  }

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
