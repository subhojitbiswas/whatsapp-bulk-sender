const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipcRendererAPI', {
  send: (data) => ipcRenderer.send(data),
});