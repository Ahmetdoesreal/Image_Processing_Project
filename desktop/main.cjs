const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { execFile } = require('node:child_process');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { promisify } = require('node:util');

const runFile = promisify(execFile);
const indexPath = path.join(__dirname, 'index.html');
const indexURL = pathToFileURL(indexPath).href;
const samplePaths = {
  control: path.join(__dirname, '..', 'outputs', 'control.jpg'),
  edited: path.join(__dirname, '..', 'outputs', 'edited.jpg'),
};

let window;
let selectedPath;

function checkSender(event) {
  if (event.sender !== window?.webContents
      || event.senderFrame !== window.webContents.mainFrame
      || event.senderFrame.url !== indexURL) {
    throw new Error('Bu istek uygulama penceresinden gelmeli.');
  }
}

ipcMain.handle('image:open', async (event) => {
  checkSender(event);
  const result = await dialog.showOpenDialog(window, {
    properties: ['openFile'],
    filters: [{ name: 'Görüntüler', extensions: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'bmp', 'tif', 'tiff'] }],
  });
  if (result.canceled) return null;
  selectedPath = result.filePaths[0];
  return path.basename(selectedPath);
});

ipcMain.handle('image:sample', (event, sample) => {
  checkSender(event);
  if (!Object.hasOwn(samplePaths, sample)) throw new Error('Örnek bulunamadı.');
  selectedPath = samplePaths[sample];
  return path.basename(selectedPath);
});

ipcMain.handle('image:analyze', async (event, qualities) => {
  checkSender(event);
  if (!selectedPath) throw new Error('Önce bir görüntü aç.');
  if (!Array.isArray(qualities) || qualities.length !== 2
      || !qualities.every((quality) => Number.isInteger(quality) && quality >= 1 && quality <= 100)) {
    throw new Error('İki JPEG kalitesi de 1–100 arasında tam sayı olmalı.');
  }

  const python = process.env.IMAGE_SPATTER_PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
  const args = [path.join(__dirname, 'engine.py'), selectedPath, ...qualities.map(String)];
  try {
    const { stdout } = await runFile(python, args, {
      timeout: 120_000,
      maxBuffer: 24 * 1024 * 1024,
      windowsHide: true,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });
    return JSON.parse(stdout);
  } catch (error) {
    if (error.code === 'ENOENT' || /ModuleNotFoundError/.test(error.stderr || '')) {
      throw new Error('Python ortamı hazır değil. imagepr_env ortamını etkinleştir veya IMAGE_SPATTER_PYTHON yolunu ayarla.');
    }
    throw new Error(error.stderr?.trim().split('\n').at(-1) || 'Analiz tamamlanamadı.');
  }
});

function createWindow() {
  selectedPath = undefined;
  window = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 720,
    minHeight: 570,
    autoHideMenuBar: true,
    backgroundColor: '#131820',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event) => event.preventDefault());
  window.loadFile(indexPath);
  window.on('closed', () => { window = undefined; });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (!window) createWindow(); });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
