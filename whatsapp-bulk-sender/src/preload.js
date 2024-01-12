// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld(
    'globalWindow',
    {
        login: (content) => ipcRenderer.on('login', content),
        disconnected: (content) => ipcRenderer.on('disconnected', content),
        loginQr: () => ipcRenderer.invoke('loginQr'),
        logout: () => ipcRenderer.invoke('logout'),
        

    }
  )