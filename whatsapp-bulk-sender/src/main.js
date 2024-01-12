const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const { Client, MessageMedia, Buttons, LocalAuth, List, NoAuth } = require('whatsapp-web.js');
const fs = require('fs');
if (require('electron-squirrel-startup')) {
  app.quit();
}

const client = new Client({ puppeteer: { headless: true }, authStrategy: new LocalAuth() });

// const client = new Client({
//   authStrategy: new LocalAuth({ clientId: "client-one" }),
//   puppeteer: {
//     headless: true,
//     args: ['--no-sandbox',
//       '--disable-setuid-sandbox',
//       '--disable-extensions',
//       '--disable-dev-shm-usage',
//       '--disable-accelerated-2d-canvas',
//       '--no-first-run',
//       '--no-zygote',
//       // '--single-process', // <- this one doesn't works in Windows
//       '--disable-gpu']
//   }
// });

require('@electron/remote/main').initialize()
let mainWindow;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: "#263238",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  )
  mainWindow.webContents.openDevTools();
};

client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
  mainWindow.webContents.send('loginQr', qr);
});

client.on('ready', () => {
  console.log('Client is ready!');
  mainWindow.webContents.send('loginQr', 'success');
});

client.on('disconnected', (reason) => {
  console.log('Client is disconnected!', reason);
  mainWindow.webContents.send('disconnected', 'success');
});


client.on('contacts-received', (contacts) => {
  console.log('Contacts received!');
  console.log(contacts);
});

client.on('message', async msg => {
  console.log('Message received on core as ', msg);
})

app.on('ready', createWindow);

app.on('browser-window-created', (_, window) => {
  require("@electron/remote/main").enable(window.webContents)
})

ipcMain.on('login', (event, arg) => {
  client.initialize();
})

ipcMain.on('logout', (event, arg) => {
  client.logout().then(() => {
    console.log('Logged out!');
    event.reply('logout', 'success');
  }).catch((error) => {
    console.log('Error logging out:', error);
    event.reply('logout', error);
  });
})

ipcMain.on('group', async (event, arg) => {
  console.log("ipc received in main");
  const chats = await client.getChats();
  const groupChat = chats.filter((chat) => chat.isGroup);
  const groupName = [];
  groupChat.forEach((grp) => groupName.push({ "grpName": grp.name, "participants": grp.participants }));
  console.log('All Chats:', groupName);
  event.reply('group', groupName);
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
  event.reply('import', result);
})

ipcMain.on('sendMessage', async (event, data) => {
  console.log('Received import = ', data);
  // try{
  //   const file = await MessageMedia.fromFilePath("C:\\Users\\subho\\OneDrive\\Desktop\\acknowledgementSlip_S1889607391000.pdf");
  //   console.log('Debug file ',file);
  // } catch(err){
  //   console.log('Error msgmedia ',err);
  // }
  let result = await Promise.all(data.number.map(async (dt, ind) => {
    let sendStatus;
    try {
      let serializedNumber = await client.getNumberId(dt);
      let response = "";
      // let button = new Buttons('Button body', [{ body: 'bt1' }, { body: 'bt2' }, { body: 'bt3' }], 'title', 'footer');
      // let sections = [{ title: 'sectionTitle', rows: [{ title: 'ListItem1', description: 'desc' }, { title: 'ListItem2' }] }];
      // let list = new List('List body', 'btnText', sections, 'Title', 'footer');
      // response = await client.sendMessage(serializedNumber._serialized, list);
      switch (true) {
        case (data.file && !data.message):
          if(data.caption){
            console.log('first');
            response = await client.sendMessage(serializedNumber._serialized, MessageMedia.fromFilePath(data.file), { caption: data.caption });
          } else {
            console.log('second');
            response = await client.sendMessage(serializedNumber._serialized, MessageMedia.fromFilePath(data.file));
          }
          break;
        case (!data.file && data.message):
          console.log('third');
          response = await client.sendMessage(serializedNumber._serialized, data.message);
          break;
        default:
          response = await client.sendMessage(serializedNumber._serialized, data.message);
          response = await client.sendMessage(serializedNumber._serialized, MessageMedia.fromFilePath(data.file), { caption: data.caption });
          break;
      }
      console.log('data send response ', response);
      sendStatus = "success";
    } catch (err) {
      sendStatus = "fail";
      console.log('error in send', err);
    }
    return { number: dt, status: sendStatus }
  }))
  console.log('result = ', result);
  event.reply('sendMessage', result);
})

ipcMain.on('contact', async (event, arg) => {
  let contacts = await client.getContacts();
  contacts = contacts.map((con) => {
    return ({ id: con.id, "name": con.name });
  })
  console.log("contacts ", contacts);
  event.reply('contact', contacts);
})


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})