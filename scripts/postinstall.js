const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');

if (process.env.SKIP_ADMIN_POSTINSTALL === '1') {
  process.exit(0);
}

console.log('[postinstall] Installing admin module dependencies...');

try {
  execSync('npm install --prefix admin', {
    cwd: rootDir,
    stdio: 'inherit',
  });
} catch (error) {
  console.warn('[postinstall] Admin install failed — main app install will continue.');
  console.warn(error.message || error);
}
