const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
// const { Client, MessageMedia, Buttons, LocalAuth, List } = require('whatsapp-web.js');

// const client = new Client({ puppeteer: { headless: true }, authStrategy: new LocalAuth() });
const venom = require('venom-bot');
require('@electron/remote/main').initialize()
require('electron-reload')(__dirname,{ignore:"tokens/"})

let mainWindow;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  )
  mainWindow.webContents.openDevTools();
};


ipcMain.on('login', (event, arg) => {
  venom.create('local', (base64Qrimg, asciiQR, attempts, urlCode) => {
    console.log('Number of attempts to read the qrcode: ', attempts);
    console.log('Terminal qrcode: ', asciiQR);
    console.log('base64 image string qrcode: ', base64Qrimg);
    console.log('urlCode (data-ref): ', urlCode);
    mainWindow.webContents.send('login', urlCode);
  }, (statusSession, session) => {
    console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || successPageWhatsapp || waitForLogin || waitChat || successChat
    if (statusSession === "waitChat" || statusSession === "successChat") {
      mainWindow.webContents.send('login', 'success');
    }
    //Create session wss return "serverClose" case server for close
    console.log('Session name: ', session);
  }, {
    folderNameToken: 'tokens', //folder name when saving tokens
    mkdirFolderToken: '', //folder directory tokens, just inside the venom folder, example:  { mkdirFolderToken: '/node_modules', } //will save the tokens folder in the node_modules directory
    headless: 'new', // you should no longer use boolean false or true, now use false, true or 'new' learn more https://developer.chrome.com/articles/new-headless/
    devtools: false, // Open devtools by default
    debug: false, // Opens a debug session
    // logQR: true, // Logs QR automatically in terminal
    disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
    disableWelcome: true, // Will disable the welcoming message which appears in the beginning
    // autoClose: 60000, // Automatically closes the venom-bot only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
    createPathFileToken: false, // creates a folder when inserting an object in the client's browser, to work it is necessary to pass the parameters in the function create browserSessionToken
  }, (browser, waPage) => {
    console.log('Browser PID:', browser.process().pid);
    waPage.screenshot({ path: 'screenshot.png' });
  }).then((client) => {
    console.log('Debug client ',client);
    // start(client);
  }).catch((erro) => {
    console.log(erro);
  });
})

ipcMain.on('logout', (event, arg) => {
  client.logout().then(() => {
    console.log('Logged out!');
    mainWindow.webContents.send('logout', 'success');
  }).catch((error) => {
    console.log('Error logging out:', error);
    mainWindow.webContents.send('logout', error);
  });
})

ipcMain.on('group', async (event, arg) => {
  console.log("ipc received in main");
  const chats = await client.getChats();
  const groupChat = chats.filter((chat) => chat.isGroup);
  const groupName = [];
  groupChat.forEach((grp) => groupName.push({ "grpName": grp.name, "participants": grp.participants }));
  console.log('All Chats:', groupName);
  mainWindow.webContents.send('group', groupName);
})

ipcMain.on('import', async (event, data) => {
  console.log('Received import = ', data);
  let result = await Promise.all(data.map(async (dt, ind) => {
    let valid
    try {
      console.log('sending for evaluation = ', dt[0] + '' + dt[1]);
      valid = await client.isRegisteredUser(dt[0] + '' + dt[1]);
      console.log('Done evaluation ', valid);
    }
    catch (err) {
      console.log("exception = ", err);
    }
    console.log('data ', dt, " result ", valid);
    return ({ 'number': dt, 'state': valid });
  }))
  console.log('result = ', result);
  mainWindow.webContents.send('import', result);
})

ipcMain.on('sendMessage', async (event, data) => {
  console.log('Received import = ', data);
  let result = await Promise.all(data.number.map(async (dt, ind) => {
    let sendStatus;
    const msg = "test message";
    // let button = new Buttons('Button body', [{ body: 'bt1' }, { body: 'bt2' }, { body: 'bt3' }], 'title', 'footer');
    // const but = new Buttons("buttontext", [{ id: "but1", body: "butbody1" }], "buttitle", "butfooter");
    const productsList = new List(
      "Amazing deal on these products",
      "View products",
      [
        {
          title: "Products list",
          rows: [
            { id: "apple", title: "Apple" },
            { id: "mango", title: "Mango" },
            { id: "banana", title: "Banana" },
          ],
        },
      ],
      "Please select a product"
    );
    try {
      let serializedNumber = await client.getNumberId(dt);
      let response = await client.sendMessage(serializedNumber._serialized, productsList);
      console.log('first resp', response);
      response = await client.sendMessage(serializedNumber._serialized, msg);
      console.log('second resp', response);
      sendStatus = "success";
    } catch (err) {
      sendStatus = "fail";
      console.log('error in send', err);
    }
    return { number: dt, status: sendStatus }
  }))
  console.log('result = ', result);
  mainWindow.webContents.send('sendMessage', result);
})

ipcMain.on('contact', async (event, arg) => {
  let contacts = await client.getContacts();
  contacts = contacts.map((con) => {
    return ({ id: con.id, "name": con.name });
  })
  console.log("contacts ", contacts);
  mainWindow.webContents.send('contact', contacts);
})


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('ready', createWindow);

app.on('browser-window-created', (_, window) => {
  require("@electron/remote/main").enable(window.webContents)
})