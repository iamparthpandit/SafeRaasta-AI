const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find the gradle cache directory
const userHome = process.env.USERPROFILE || process.env.HOME;
const gradleCache = path.join(userHome, '.gradle', 'caches');

console.log('Searching for graphicsConversions.h...');

// Find all graphicsConversions.h files
try {
  const findCommand = process.platform === 'win32'
    ? `powershell -Command "Get-ChildItem -Path '${gradleCache}' -Recurse -Filter 'graphicsConversions.h' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName"`
    : `find "${gradleCache}" -name "graphicsConversions.h"`;
  
  const result = execSync(findCommand, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 });
  const files = result.split('\n').filter(f => f.trim() && fs.existsSync(f.trim()));
  
  console.log(`Found ${files.length} files`);
  
  files.forEach(file => {
    const filePath = file.trim();
    if (!filePath || !fs.existsSync(filePath)) return;
    
    console.log(`Patching: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the buggy line
    const buggyLine = 'return std::format("{}%", dimension.value);';
    const fixedLine = 'return folly::to<std::string>(dimension.value) + "%";';
    
    if (content.includes(buggyLine)) {
      content = content.replace(buggyLine, fixedLine);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✓ Patched successfully');
    } else {
      console.log('  Already patched or different version');
    }
  });
  
  console.log('\nPatch complete! Now run: npx react-native run-android');
  
} catch (error) {
  console.error('Error:', error.message);
  console.log('\nManual patch required. Please downgrade React Native or wait for fix.');
}
