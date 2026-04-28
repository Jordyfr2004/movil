const fs = require('fs');
const path = require('path');

function patchFile(relativePath, replacements) {
  const filePath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(filePath)) {
    console.warn(`[native-linker-fix] File not found: ${relativePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const { find, replace } of replacements) {
    if (content.includes(replace)) {
      continue;
    }
    if (!content.includes(find)) {
      console.warn(`[native-linker-fix] Pattern not found in ${relativePath}`);
      continue;
    }
    content = content.replace(find, replace);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[native-linker-fix] Patched ${relativePath}`);
  } else {
    console.log(`[native-linker-fix] No changes needed for ${relativePath}`);
  }
}

patchFile('node_modules/expo-modules-core/android/CMakeLists.txt', [
  {
    find: '  ReactAndroid::jsi\n  android\n  ${JSEXECUTOR_LIB}',
    replace: '  ReactAndroid::jsi\n  android\n  c++_shared\n  ${JSEXECUTOR_LIB}',
  },
]);

patchFile('node_modules/react-native-screens/android/CMakeLists.txt', [
  {
    find: '            fbjni::fbjni\n            android\n        )',
    replace: '            fbjni::fbjni\n            android\n            c++_shared\n        )',
  },
  {
    find: '                fbjni::fbjni\n                android\n        )',
    replace: '                fbjni::fbjni\n                android\n                c++_shared\n        )',
  },
  {
    find: '        ReactAndroid::jsi\n        android\n    )',
    replace: '        ReactAndroid::jsi\n        android\n        c++_shared\n    )',
  },
]);
