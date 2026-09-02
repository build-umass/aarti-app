import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const APPS = ['apps/mobile_client', 'apps/admin_client', 'apps/backend'];

const SKIP_DIRS = new Set(['node_modules', '.expo', '.next', 'dist', '.git', '.verify', '.opencode', '.tauri']);
const SOURCE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|json|css)$/;

const TOOLING = {
  'apps/mobile_client': {
    expo: 'CLI + platform runtime',
    'jest-expo': 'jest preset',
    '@expo/metro-runtime': 'web runtime peer of expo-router',
    '@expo/vector-icons': 'icon components',
    'expo-constants': 'required peer of expo-router',
    'expo-dev-client': 'native dev builds (expo run:android/ios)',
    'expo-font': 'font loading in _layout',
    'expo-linking': 'required peer of expo-router',
    'expo-localization': 'i18n',
    'expo-router': 'routing',
    'expo-splash-screen': 'splash control in _layout',
    'expo-sqlite': 'local database',
    'react-native-screens': 'required peer of expo-router',
    'react-native-web': 'web platform companion',
    'react-native-worklets': 'peer of react-native-reanimated 4',
    '@babel/core': 'babel peer',    '@types/jest': 'types',
    '@types/react': 'types',
    '@types/react-test-renderer': 'types',
    eslint: 'lint runner',
    'eslint-config-expo': 'lint config',
    jest: 'test runner',
    typescript: 'type checking',
    'react-native-gesture-handler': 'expo-router recommended peer',
    i18next: 'i18n core',
    'react-i18next': 'i18n react bindings',
    react: 'framework',
    'react-dom': 'framework',
    'react-native': 'framework',
    'react-native-reanimated': 'animation (TypingIndicator)',
    'react-native-safe-area-context': 'safe area layout',
  },
  'apps/admin_client': {
    next: 'framework',
    react: 'framework',
    'react-dom': 'framework',
    postcss: 'css pipeline',
    tailwindcss: 'css framework',
    '@tailwindcss/postcss': 'postcss plugin',
    autoprefixer: 'postcss plugin',
    'tailwindcss-animate': 'tailwind config',
    'tailwind-merge': 'lib/utils.ts cn()',
    clsx: 'lib/utils.ts cn()',
    'class-variance-authority': 'ui component variants',
    eslint: 'lint runner',
    'eslint-config-next': 'lint config',
    '@types/node': 'types',
    '@types/react': 'types',
    '@types/react-dom': 'types',
    '@types/bcrypt': 'types',
    typescript: 'type checking',
    'lucide-react': 'icons',
    'react-hook-form': 'forms (quizzes/resources pages)',
    jose: 'JWT (lib/auth.ts)',
    bcrypt: 'password hashing (login route)',
  },
  'apps/backend': {
    cors: 'CORS middleware (app.ts)',
    dotenv: 'env loading (db.ts)',
    express: 'HTTP framework',
    mongoose: 'MongoDB ODM',
    '@types/cors': 'types',
    '@types/express': 'types',
    '@types/node': 'node globals for TS compilation',
    typescript: 'build (tsc --build)',
  },
};

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (SOURCE_EXT.test(entry)) files.push(full);
  }
  return files;
}

function depPattern(dep) {
  const escaped = dep.replaceAll('.', '\\.').replaceAll('/', '\\/').replaceAll('-', '\\-');
  if (dep.startsWith('@')) return new RegExp(`['"]${escaped}(\\/|['"])`);
  return new RegExp(`['"]${escaped}['"]`);
}

let failures = 0;

for (const app of APPS) {
  const pkg = JSON.parse(readFileSync(join(root, app, 'package.json'), 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const files = walk(join(root, app)).filter(
    (f) => !f.endsWith('package.json') && !f.endsWith('package-lock.json')
  );
  const keep = TOOLING[app] ?? {};

  for (const [dep, version] of Object.entries(deps)) {
    const pattern = depPattern(dep);
    const inScripts = JSON.stringify(pkg.scripts ?? {}).includes(dep);
    const hit = files.find((f) => {
      try {
        return pattern.test(readFileSync(f, 'utf8'));
      } catch {
        return false;
      }
    });
    if (hit || inScripts || keep[dep]) {
      if (!hit && !inScripts) {
        console.log(`KEEP  ${app} ${dep}@${version} (${keep[dep]})`);
      }
    } else {
      failures++;
      console.log(`UNUSED  ${app} ${dep}@${version}`);
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} dependency(ies) with no import/script evidence`);
  process.exit(1);
}
console.log('\nAll dependencies have evidence or a keep-list entry.');
