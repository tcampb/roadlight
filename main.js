// Modules to control application life and create native browser window
const { default: axios } = require("axios");
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  mainWindow.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  });

  // Open the DevTools.
  ipcMain.on("renderer.toggleDevTools", () => {
    mainWindow.webContents.toggleDevTools();
  });
}

ipcMain.on("renderer.getLights", async (event, data) => {
  const { ip, username } = data;

  try {
    const res = await axios.get(`http://${ip}/api/${username}/lights`);

    if (res.data && res.data.length && res.data[0].error) {
      throw new Error(res.data[0].error.description);
    }

    event.sender.send("main.getLights", {
      success: true,
      data: res.data,
    });
  } catch (e) {
    console.error(e);

    event.sender.send("main.getLights", {
      success: false,
    });
  }
});

ipcMain.on("renderer.updateLights", async (event, data) => {
  const { ids, hue, ip, username } = data;
  for (id of ids) {
    try {
      await axios.put(`http://${ip}/api/${username}/lights/${id}/state`, {
        on: true,
        hue,
        sat: 254,
        bri: 254,
      });
    } catch (e) {
      console.error(e);
      event.sender.send("main.updateLights", {
        success: false,
      });
    }
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
