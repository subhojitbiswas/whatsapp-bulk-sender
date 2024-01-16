const { app, BrowserWindow } = require("electron");
const { ipcMain } = require("electron");
const path = require("path");
// const isDev = require("electron-is-dev");
const {
  Client,
  MessageMedia,
  Buttons,
  LocalAuth,
  List,
  NoAuth,
} = require("whatsapp-web.js");
const fs = require("fs");
// require("@electron/remote/main").initialize();

const client = new Client({
  puppeteer: { headless: true },
  authStrategy: new LocalAuth(),
});

if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: "#263238",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();
};

client.on("qr", (qr) => {
  console.log("QR RECEIVED", qr);
  mainWindow.webContents.send("loginQr", qr);
});

client.on("ready", () => {
  console.log("Client is ready!");
  mainWindow.webContents.send("loginQr", "success");
});

client.on("disconnected", (reason) => {
  console.log("Client is disconnected!", reason);
  mainWindow.webContents.send("disconnected", "success");
});

client.on("contacts-received", (contacts) => {
  console.log("Contacts received!");
  console.log(contacts);
});

client.on("message", async (msg) => {
  console.log("Message received on core as ", msg);
});

const login = (arg) => {
  client.initialize();
};

const logout = async (arg) => {
  try {
    await client.logout();
    console.log("Logged out!");
    return "success";
  } catch (error) {
    console.log("Error logging out:", error);
    return error;
  }
};

const group = async (arg) => {
  console.log("ipc received in main");
  const chats = await client.getChats();
  const groupChat = chats.filter((chat) => chat.isGroup);
  const groupName = [];
  groupChat.forEach((grp) =>
    groupName.push({ grpName: grp.name, participants: grp.participants })
  );
  console.log("All Chats:", groupName);
  return groupName;
};

const importContact = async (arg) => {
  console.log("Received import = ", arg);
  let result = await Promise.all(
    arg.map(async (dt, ind) => {
      let valid;
      try {
        console.log("sending for evaluation = ", dt[0] + "" + dt[1]);
        valid = await client.isRegisteredUser(dt[0] + "" + dt[1]);
        console.log("Done evaluation ", valid);
      } catch (err) {
        console.log("exception = ", err);
      }
      console.log("arg ", dt, " result ", valid);
      return { number: dt, state: valid };
    })
  );
  console.log("result = ", result);
  return result;
};

const sendMessage = async (arg) => {
  console.log("Received import = ", arg);
  let result = await Promise.all(
    arg.number.map(async (dt, ind) => {
      let sendStatus;
      try {
        let serializedNumber = await client.getNumberId(dt);
        let response = "";
        switch (true) {
          case arg.file && !arg.message:
            if (arg.caption) {
              console.log("first");
              response = await client.sendMessage(
                serializedNumber._serialized,
                MessageMedia.fromFilePath(arg.file),
                { caption: arg.caption }
              );
            } else {
              console.log("second");
              response = await client.sendMessage(
                serializedNumber._serialized,
                MessageMedia.fromFilePath(arg.file)
              );
            }
            break;
          case !arg.file && arg.message:
            console.log("third");
            response = await client.sendMessage(
              serializedNumber._serialized,
              arg.message
            );
            break;
          default:
            response = await client.sendMessage(
              serializedNumber._serialized,
              arg.message
            );
            response = await client.sendMessage(
              serializedNumber._serialized,
              MessageMedia.fromFilePath(arg.file),
              { caption: arg.caption }
            );
            break;
        }
        console.log("arg send response ", response);
        sendStatus = "success";
      } catch (err) {
        sendStatus = "fail";
        console.log("error in send", err);
      }
      return { number: dt, status: sendStatus };
    })
  );
  console.log("result = ", result);
  return result;
};

const contact = async (arg) => {
  let contacts = await client.getContacts();
  contacts = contacts.map((con) => {
    return { id: con.id, name: con.name };
  });
  console.log("contacts ", contacts);
  return contacts;
};

app.whenReady().then(() => {
  // ipcMain.handle("testIncoming", testIncoming);
  ipcMain.handle("login", (arg) => login(arg));
  ipcMain.handle("logout", (arg) => logout(arg));
  ipcMain.handle("group", (arg) => group(arg));
  ipcMain.handle("importContact", (arg) => importContact(arg));
  ipcMain.handle("sendMessage", (arg) => sendMessage(arg));
  ipcMain.handle("contact", (arg) => contact(arg));
  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// let clickCounter = 0;
// let intervalCounter = 0;

// setInterval(() => {
//   intervalCounter++;
//   mainWindow.webContents.send("testOutgoing", intervalCounter);
// }, 1500);

// function testIncoming() {
//   console.log(
//     "Received incoming request from channel testIncoming with counter value as ",
//     clickCounter
//   );
//   clickCounter++;
//   return clickCounter;
// }
