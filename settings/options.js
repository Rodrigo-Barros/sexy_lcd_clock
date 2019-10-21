function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    clockFormat: document.querySelector("#clockFormat").value
  });
}

function restoreOptions() {
  function setCurrentChoice(result) {
    document.querySelector("#clockFormat").value = result.clockFormat || "blue";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.sync.get("clockFormat");
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
