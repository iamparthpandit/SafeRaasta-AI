/**
 * Patch for React Native 0.83.1 graphicsConversions.h std::format bug
 * This fixes the C++ compilation error with Android NDK
 * 
 * Run after: npm install
 * Add to package.json: "postinstall": "node patch-rn-graphics-fix.js"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// The file is in the Android prefab includes after Gradle sync
// We need to create a gradle.properties override instead

const gradlePropsPath = path.join(__dirname, 'android', 'gradle.properties');

console.log('Applying React Native 0.83.1 C++ compatibility fix...');

if (!fs.existsSync(gradlePropsPath)) {
  console.log('❌ gradle.properties not found');
  process.exit(1);
}

let content = fs.readFileSync(gradlePropsPath, 'utf8');

// Remove the newArchEnabled if it exists (it's ignored in 0.83+)
content = content.replace(/\nnewArchEnabled=.*\n/g, '\n');

// Add C++ flags to work around the std::format issue
const cppFix = `
# Workaround for React Native 0.83.1 std::format C++ compilation issue
# Forces use of C++17 standard which is more stable with Android NDK
android.defaultConfig.externalNativeBuild.cmake.cppFlags=-std=c++17
`;

if (!content.includes('android.defaultConfig.externalNativeBuild')) {
  content += cppFix;
  fs.writeFileSync(gradlePropsPath, content, 'utf8');
  console.log('✅ Applied C++17 compatibility fix to gradle.properties');
} else {
  console.log('✅ Already configured');
}

console.log('\nNext steps:');
console.log('1. cd android && gradlew.bat clean');
console.log('2. cd .. && npx react-native run-android');

