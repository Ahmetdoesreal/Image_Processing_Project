const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('imageSpatter', {
  open: () => ipcRenderer.invoke('image:open'),
  sample: (sample) => ipcRenderer.invoke('image:sample', sample),
  analyze: (qualities) => ipcRenderer.invoke('image:analyze', qualities),
});
