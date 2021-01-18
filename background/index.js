var tick = function() {
  //console.log("tick");
  browser.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    browser.tabs.sendMessage(tabs[0].id, { sexyLCDClockTick: true }, function(response) {
      // console.log(response.farewell);
    });
  });
};

setInterval(tick, 500); // Ticks twice a second
