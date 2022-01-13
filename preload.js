const { contextBridge, ipcRenderer } = require("electron");
const { findDeviceService } = require("./utils");

contextBridge.exposeInMainWorld("api", {
  getTrainerRoadDeviceServiceUrl: async () => {
    try {
      const url = await findDeviceService();

      return { success: true, url };
    } catch (e) {
      console.error(e);
      return { success: false };
    }
  },
  getLights: async (config) => {
    return new Promise((resolve) => {
      ipcRenderer.once("main.getLights", (_event, data) => {
        resolve(data);
      });
      ipcRenderer.send("renderer.getLights", config);
    });
  },
  getFtp: async () => {
    return new Promise((resolve) => {
      ipcRenderer.once("main.getFtp", (_event, data) => {
        resolve(data);
      });
      ipcRenderer.send("renderer.getFtp");
    });
  },
  updateLights: (obj) => {
    ipcRenderer.send("renderer.updateLights", obj);
  },
  toggleDevTools: () => {
    ipcRenderer.send("renderer.toggleDevTools");
  },
});
