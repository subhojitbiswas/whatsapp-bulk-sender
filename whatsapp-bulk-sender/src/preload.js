// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("api", {
  login: () => ipcRenderer.invoke("login"),
  logout: () => ipcRenderer.invoke("logout"),
  group: () => ipcRenderer.invoke("group"),
  importContact: () => ipcRenderer.invoke("importContact"),
  sendMessage: () => ipcRenderer.invoke("sendMessage"),
  contact: () => ipcRenderer.invoke("contact"),
  loginQr: (callback) => ipcRenderer.on("loginQr", callback),
  disconnected: (callback) => ipcRenderer.on("disconnected", callback),  
});

// contextBridge.exposeInMainWorld("electronAPI", {
//   testIncoming: () => ipcRenderer.invoke("testIncoming"),
//   testOutgoing: (callback) => ipcRenderer.on("testOutgoing", callback),
// });
