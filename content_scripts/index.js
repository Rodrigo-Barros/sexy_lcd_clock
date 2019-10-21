async function formatTime(date) {
  var hour = date.getHours();
  var minute = date.getMinutes();
  var amPM = hour > 11 ? "PM" : "AM";

  if (hour > 12) {
    hour -= 12;
  } else if (hour === 0) {
    hour = 12;
  }

  await browser.storage.sync.get("clockFormat").then((result) => {
    result.clockFormat = 24;
    if (parseInt(result.clockFormat) == 24) {
      hour = date.getHours();
    }
  });

  if (hour < 10) {
    hour = "0" + hour;
  }

  if (minute < 10) {
    minute = "0" + minute;
  }

  return hour + ":" + minute + " " + amPM;
}

var minutesChanged = function(newDate, oldDate) {
  var newDateMinutes = newDate.getMinutes();
  var oldDateMinutes = oldDate.getMinutes();

  return newDateMinutes !== oldDateMinutes;
};

var soundTime = function(date) {
  minutes = date.getMinutes();

  var minuteIsCorrect = [0, 30].includes(minutes);
  var secondIsCorrect = date.getSeconds() < 2;

  if (minuteIsCorrect && secondIsCorrect) {
    return true;
  }

  return false;
};

var tick = function() {
  var date = new Date();
  if (minutesChanged(date, window.sexyLCDClockDate)) {
    counter.innerHTML = formatTime(date);

    if (soundTime(date)) {
      var sound = new Audio(browser.extension.getURL("assets/sound.wav"));
      sound.play();
    }

    window.sexyLCDClockDate = date;
  }
};

async function mountClock() {
  window.sexyLCDClockDate = new Date();

  var counter = document.createElement("div");
  counter.className = "sexy_lcd_clock";
  counter.innerHTML = await formatTime(window.sexyLCDClockDate);

  counter.addEventListener("mouseenter", function() {
    addClass(counter, "hidden");

    setTimeout(function() {
      removeClass(counter, "hidden");
    }, 5000);
  });

  document.body.insertBefore(counter, document.body.firstChild);

  browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.sexyLCDClockTick == true) {
      tick();
    }
  });
}

mountClock();

function addClass(element, className) {
  if (element.classList) {
    element.classList.add(className);
  } else {
    element.className += " " + className;
  }
}

function removeClass(element, className) {
  if (element.classList) {
    element.classList.remove(className);
  } else {
    element.className = element.className.replace(
      new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"),
      " "
    );
  }
}
