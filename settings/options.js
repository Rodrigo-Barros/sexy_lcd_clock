function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    clockFormat: document.querySelector("#clockFormat").value,
    customCss: document.querySelector("#customCss").value,
    sound : document.querySelector('#sound').value
  });
}

function restoreOptions() {
  function setCurrentChoice(result) {
    document.querySelector("#clockFormat").value = result.clockFormat || "12";
    document.querySelector("#customCss").value = result.customCss || "";
    document.querySelector("#sound").value = result.sound || "enable";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.sync.get();
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
