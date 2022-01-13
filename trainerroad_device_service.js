const getPowerZone = (ftp, power) => {
  return window.POWER_ZONES(ftp).find(({ low, high }) => {
    return power >= low && power <= high;
  });
};

const onConnect = () => {
  const btn = document.querySelector("#connect");
  btn.setAttribute("disabled", true);
  btn.textContent = "Connected";
  document.querySelector("#connection_status").textContent = "Connected";
};

const onDisconnect = () => {
  const btn = document.querySelector("#connect");
  btn.removeAttribute("disabled");
  btn.textContent = "Connect";
  document.querySelector("#connection_status").textContent = "Not Connected";
  window.showConnectionFailedAlert();
};

const onConnecting = () => {
  const btn = document.querySelector("#connect");
  btn.setAttribute("disabled", true);
  btn.textContent = "Connecting...";
};

const onOpen = (ws) => () => {
  console.log("Received socket notification onopen.");

  ws.send(
    JSON.stringify({
      commandType: "Session.ActivateDeviceSessionCommand",
    })
  );

  onConnect();
};

const onClose = () => () => {
  console.log("ws.onclose");
  document.querySelector("#power").textContent = "-";
  onDisconnect();
};

const onError = () => () => {
  console.log("ws.onerror");
  document.querySelector("#power").textContent = "-";
  onDisconnect();
};

const onMessage = () => {
  let previousPower = 0;

  return ({ data }) => {
    const { Type, PowerValue } = JSON.parse(data);

    if (Type === "DevicePowerChanged") {
      const ftp = window.getFtp();
      const { title: previousZoneName } = getPowerZone(ftp, previousPower);
      const { title: currentZoneName, hue } = getPowerZone(ftp, PowerValue);
      const ip = localStorage.getItem("ip");
      const username = localStorage.getItem("username");

      if (previousZoneName !== currentZoneName && ip && username) {
        window.api.updateLights({
          ids: window.getSelectedLightIds(),
          hue,
          ip,
          username,
        });
      }

      previousPower = PowerValue;
      document.querySelector("#power").textContent = PowerValue;
    }
  };
};

window.createDeviceService = async () => {
  const { success, url } = await window.api.getTrainerRoadDeviceServiceUrl();

  if (!success) {
    return onDisconnect();
  }

  let ws;

  try {
    ws = new WebSocket(url);
  } catch (e) {
    console.error(e);
    return onDisconnect();
  }

  ws.onopen = onOpen(ws);
  ws.onclose = onClose();
  ws.onerror = onError();
  ws.onmessage = onMessage();
};
