async function formatTime(date) {
  var hour = date.getHours();
  var minute = date.getMinutes();
  var amPM = hour > 11 ? "PM" : "AM";

  await browser.storage.sync.get("clockFormat").then((result) => {
    if (parseInt(result.clockFormat) == 24) {
      hour = date.getHours();
      amPM = "";
    } else if (result.clockFormat == "undefined" || parseInt(result.clockFormat) == "12") {
      if (hour > 12) {
        hour -= 12;
      } else if (hour === 0) {
        hour = 12;
      }
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

async function minutesChanged(newDate, oldDate) {
  var newDateMinutes = newDate.getMinutes();
  var oldDateMinutes = oldDate.getMinutes();

  return newDateMinutes !== oldDateMinutes;
}

async function soundTime(date) {
  minutes = date.getMinutes();
  var minuteIsCorrect = [0, 30].includes(minutes);
  var secondIsCorrect = date.getSeconds() < 2;

  return true;
  if (minuteIsCorrect && secondIsCorrect) {
    return true;
  }

  return false;
}

async function tack() {
  var date = new Date();

  minutesdiff = await minutesChanged(date, window.sexyLCDClockDate);

  console.log(minutesdiff);

  if (await minutesdiff /*minutesChanged(date, window.sexyLCDClockDate)*/) {
    counter.innerHTML = await formatTime(date);

    if (await soundTime(date)) {
      var sound = new Audio(browser.extension.getURL("assets/sound.wav"));
      sound.play();
    }

    window.sexyLCDClockDate = date;
  }
}

async function mountClock() {
  window.sexyLCDClockDate = new Date();

  counter = document.createElement("div");
  counter.className = "sexy_lcd_clock";
  counter.innerHTML = await formatTime(window.sexyLCDClockDate);

  counter.addEventListener("mouseenter", function() {
    addClass(counter, "hidden");

    setTimeout(function() {
      removeClass(counter, "hidden");
    }, 5000);
  });

  document.body.insertBefore(counter, document.body.firstChild);
  /*setInterval(() => {
    tick();
  }, 2000);*/
  //await tick();
  await browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.sexyLCDClockTick == true) {
      tack();
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
