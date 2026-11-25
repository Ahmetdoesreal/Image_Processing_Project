const { spawn } = require('node:child_process');

const options = process.argv.slice(2);
// VS Code may set this variable for its own Electron processes.
delete process.env.ELECTRON_RUN_AS_NODE;

if (process.platform === 'linux' && process.env.SNAP_NAME === 'code') {
  // Use the GTK chooser when launched through the VS Code snap.
  delete process.env.GIO_MODULE_DIR;
  if (!options.some((option) => option.startsWith('--xdg-portal-required-version'))) {
    options.push('--xdg-portal-required-version=999');
  }
}

const application = spawn(require('electron'), [__dirname, ...options], { stdio: 'inherit' });
application.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
application.on('exit', (code) => { process.exitCode = code ?? 1; });
