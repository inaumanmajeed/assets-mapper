const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Clean lib directory first
const libDir = path.join(__dirname, 'lib');
if (fs.existsSync(libDir)) {
  fs.rmSync(libDir, { recursive: true, force: true });
}

console.log('🔨 Compiling TypeScript...');

try {
  // Compile TypeScript to lib
  execSync('npx tsc', { stdio: 'inherit' });
  console.log('✅ TypeScript compiled to lib/');

  // Compile CLI TypeScript file to JavaScript
  const binDir = path.join(__dirname, 'bin');
  const cliTsFile = path.join(binDir, 'assets-mapper.ts');
  const cliJsFile = path.join(binDir, 'assets-mapper.js');

  if (fs.existsSync(cliTsFile)) {
    execSync(
      `npx tsc ${cliTsFile} --outDir ${binDir} --target ES2020 --module CommonJS --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck`,
      { stdio: 'inherit' }
    );
    console.log('✅ CLI compiled to JavaScript');
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
