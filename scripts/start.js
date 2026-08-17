const { spawn, execSync } = require('child_process');
const net = require('net');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const webPort = Number(process.env.PORT || 2588);
const defaultAdminPort = Number(process.env.ADMIN_PORT || 3001);
const fallbackAdminPort = Number(process.env.ADMIN_FALLBACK_PORT || 2088);

const children = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.end();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function getPidsOnPort(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
      const pids = new Set();
      const portPattern = new RegExp(`:${port}\\s+\\S+\\s+LISTENING\\s+(\\d+)`, 'i');

      for (const line of output.split('\n')) {
        const match = line.match(portPattern);
        if (!match) continue;

        const processId = Number(match[1]);
        if (processId && processId !== process.pid) {
          pids.add(processId);
        }
      }

      return [...pids];
    }

    const output = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, { encoding: 'utf8' });
    return output
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(Number)
      .filter((pid) => pid !== process.pid);
  } catch {
    return [];
  }
}

function killPid(pid) {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
    } else {
      process.kill(pid, 'SIGKILL');
    }
    return true;
  } catch {
    return false;
  }
}

async function freePort(port) {
  const pids = getPidsOnPort(port);
  if (!pids.length) {
    return;
  }

  console.log(`[start] Stopping previous process(es) on port ${port}: ${pids.join(', ')}`);

  for (const pid of pids) {
    killPid(pid);
  }

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (!(await isPortOpen(port))) {
      return;
    }
    await sleep(250);
  }

  throw new Error(`Could not free port ${port}.`);
}

async function freePorts(ports) {
  for (const port of ports) {
    await freePort(port);
  }
}

async function resolveAdminPort() {
  if (!(await isPortOpen(defaultAdminPort))) {
    return defaultAdminPort;
  }

  if (defaultAdminPort === fallbackAdminPort) {
    throw new Error(`Admin port ${defaultAdminPort} is already in use.`);
  }

  if (await isPortOpen(fallbackAdminPort)) {
    throw new Error(
      `Admin ports ${defaultAdminPort} and ${fallbackAdminPort} are already in use.`
    );
  }

  console.log(
    `[start] Port ${defaultAdminPort} is in use — using ${fallbackAdminPort} for admin API.`
  );
  return fallbackAdminPort;
}

function waitForService(child, port, label, timeoutMs = 180_000) {
  const started = Date.now();

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearInterval(interval);
      child.removeListener('exit', onExit);
      if (error) reject(error);
      else resolve();
    };

    const onExit = (code) => {
      finish(
        new Error(
          `${label} exited before becoming ready${code ? ` (code ${code})` : ''}.`
        )
      );
    };

    child.once('exit', onExit);

    const interval = setInterval(async () => {
      if (child.exitCode !== null) {
        return;
      }

      if (await isPortOpen(port)) {
        finish();
        return;
      }

      if (Date.now() - started > timeoutMs) {
        finish(new Error(`${label} did not start on port ${port} within ${timeoutMs / 1000}s.`));
      }
    }, 500);
  });
}

function startProcess(label, command, args, options = {}) {
  const { cwd = rootDir, env = {} } = options;

  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...env },
  });

  children.push(child);

  child.on('exit', (code) => {
    if (code && code !== 0 && children.includes(child)) {
      console.error(`[${label}] exited with code ${code}`);
      shutdown(code ?? 1);
    }
  });

  return child;
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

async function main() {
  await freePorts([webPort, defaultAdminPort, fallbackAdminPort]);

  const adminPort = await resolveAdminPort();
  const adminApiUrl = `http://localhost:${adminPort}`;

  console.log(`[1/2] Starting main app (dev) on http://localhost:${webPort} ...`);
  const web = startProcess(
    'web',
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'dev'],
    {
      env: {
        NEXT_PUBLIC_ADMIN_API_URL: adminApiUrl,
      },
    }
  );

  try {
    await waitForService(web, webPort, 'Main app');
  } catch (error) {
    console.error(error.message);
    shutdown(1);
    return;
  }

  console.log('[1/2] Main app is ready.');

  console.log(`[2/2] Starting admin API (dev) on ${adminApiUrl} ...`);
  const admin = startProcess(
    'admin',
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'dev:admin'],
    {
      env: {
        ADMIN_PORT: String(adminPort),
      },
    }
  );

  try {
    await waitForService(admin, adminPort, 'Admin API');
  } catch (error) {
    console.error(error.message);
    shutdown(1);
    return;
  }

  console.log('[2/2] Admin API is ready.');
  console.log('');
  console.log(`Main app:  http://localhost:${webPort}`);
  console.log(`Admin UI:  http://localhost:${webPort}/admin/login`);
  console.log(`Admin API: ${adminApiUrl}`);
  console.log('');
  console.log('Press Ctrl+C to stop both services.');
}

main().catch((error) => {
  console.error('[start] Failed:', error.message);
  shutdown(1);
});
