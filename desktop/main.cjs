const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { execFile } = require('node:child_process');
const { mkdtemp, rename, rm, writeFile } = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { promisify } = require('node:util');

const runFile = promisify(execFile);
const projectDir = path.join(__dirname, '..');
const indexPath = path.join(__dirname, 'index.html');
const indexURL = pathToFileURL(indexPath).href;
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const samplePaths = {
  control: path.join(projectDir, 'outputs', 'control.jpg'),
  edited: path.join(projectDir, 'outputs', 'edited.jpg'),
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
  const args = ['-m', 'image_spatter', selectedPath, ...qualities.map(String)];
  try {
    const { stdout } = await runFile(python, args, {
      cwd: projectDir,
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

ipcMain.handle('image:saveComparison', async (event, bytes) => {
  checkSender(event);
  if (!(bytes instanceof ArrayBuffer) || bytes.byteLength > 8 * 1024 * 1024) {
    throw new Error('PNG verisi geçersiz veya çok büyük.');
  }
  const png = Buffer.from(bytes);
  if (!png.subarray(0, pngSignature.length).equals(pngSignature)) {
    throw new Error('Geçerli bir PNG oluşturulamadı.');
  }

  const inputPath = selectedPath;
  const result = await dialog.showSaveDialog(window, {
    defaultPath: 'image-spatter-comparison.png',
    filters: [{ name: 'PNG görüntüsü', extensions: ['png'] }],
  });
  if (result.canceled || !result.filePath) return null;
  if (path.extname(result.filePath).toLowerCase() !== '.png') {
    throw new Error('Dosya adı .png ile bitmeli.');
  }
  if (inputPath && path.resolve(result.filePath) === path.resolve(inputPath)) {
    throw new Error('Giriş görüntüsünü korumak için farklı bir dosya adı seç.');
  }

  const staging = await mkdtemp(path.join(path.dirname(result.filePath), '.image-spatter-'));
  try {
    const temporaryPng = path.join(staging, 'comparison.png');
    await writeFile(temporaryPng, png);
    await rename(temporaryPng, result.filePath);
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
  return path.basename(result.filePath);
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
