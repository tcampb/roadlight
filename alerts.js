window.showConnectionFailedAlert = () => {
  alert(
    "Failed to connect to TrainerRoad. Please ensure that the TrainerRoad application is running before clicking the Connect button."
  );
};

window.showHueConnectionFailedAlert = () => {
  alert("Failed to retrieve lights from Philips Hue Bridge.");
};

window.showHueConnectionEmptyUsernameIpAlert = () => {
  alert(
    "You must enter a username and ip address to connect to the Philips Hue Bridge."
  );
};
