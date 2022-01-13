const util = require("util");
const exec = util.promisify(require("child_process").exec);
const find = require("find-process");
const axios = require("axios").default;

const parseWebsocketUrl = (output) => {
  const [host] = new RegExp(/(localhost:\d+) \(LISTEN\)/).exec(output);

  return "ws://" + host.replace(" (LISTEN)", "");
};

const parseWebsocketUrlWindows = (output) => {
  const [host] = new RegExp(/(127\.0\.0\.1:\d+)/).exec(output);

  return "ws://" + host;
};

exports.findDeviceService = async () => {
  if (process.env.NODE_ENV === "test") {
    return Promise.resolve("ws://localhost:8081");
  }

  const [deviceService] = await find("name", "TrainerRoad.Embedded");

  if (!deviceService) {
    throw new Error("Failed to find TrainerRoad.Embedded process");
  }

  const { pid } = deviceService;

  let command = "lsof -aPi -p ";

  if (process.platform === "win32") {
    command = "netstat -ano | findstr ";
  }

  const { stdout, stderr } = await exec(command + pid);

  if (stderr) {
    throw new Error(stderr);
  }

  if (process.platform === "win32") {
    return parseWebsocketUrlWindows(stdout);
  }

  return parseWebsocketUrl(stdout);
};

exports.getLights = ({ ip, username }) =>
  axios.get(`${ip}/api/${username}/lights`);
