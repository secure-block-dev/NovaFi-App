const { spawn } = require('child_process');
const openModule = require('open');
const open = typeof openModule === 'function' ? openModule : (openModule && openModule.default) ? openModule.default : null;

const port = process.env.PORT || 2588;

// Start next dev server
const child = spawn('npm', ['run', 'dev:server'], { stdio: ['inherit', 'pipe', 'pipe'], shell: true });

child.stdout.on('data', (data) => {
  const s = data.toString();
  process.stdout.write(s);
  // When Next reports it's ready, open the browser
  if (/Local:\s+http:\/\/localhost:\d+/.test(s) || /Ready in/.test(s)) {
    // try open package (CJS or ESM default), otherwise fallback to platform opener
    (async () => {
      const url = `http://localhost:${port}`;
      try {
        let opener;
        const openPkg = require('open');
        opener = typeof openPkg === 'function' ? openPkg : (openPkg && openPkg.default) ? openPkg.default : null;
        if (opener) return opener(url).catch(() => {});
      } catch (e) {
        // ignore
      }
      const cmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
      exec(`${cmd} "${url}"`, () => {});
    })();
  }
});
child.stderr.on('data', (data) => process.stderr.write(data.toString()));
child.on('exit', (code) => process.exit(code));
