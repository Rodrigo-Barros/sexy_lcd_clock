// I Have to change somes functions to async to work with settings pages

async function formatTime(date) {
  var hour = date.getHours();
  var minute = date.getMinutes();
  var amPM = hour > 11 ? "PM" : "AM";

  // switch betwwen 12 and 24 clock format the clock format is get from addon settings page if
  // none setting is found then choose 12 clock as default/fallback

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

  if (minuteIsCorrect && secondIsCorrect) {
    return true;
  }

  return false;
}

async function tick() {
  var date = new Date();
  minutesdiff = await minutesChanged(date, window.sexyLCDClockDate);

  if (await minutesChanged(date, window.sexyLCDClockDate)) {
    counter.innerHTML = await formatTime(date);
    if (await soundTime(date)) {
      var sound = new Audio(browser.extension.getURL("assets/sound.wav"));
      //sound.play();
      await browser.storage.sync.get('sound').then((result)=>{
        console.log(result.sound);
        if (result.sound == 'enable' )
        {
          console.log('reproduzindo som...');
          sound.play();
        }
      });
    }

    window.sexyLCDClockDate = date;
  }
}

async function mountClock() {
  window.sexyLCDClockDate = new Date();

  counter = document.createElement("div");

  counter.className = await browser.storage.sync.get().then((result) => {
    if (result.customCss == "" || typeof result.customCss == "undefined") {
      return "sexy_lcd_clock";
    }
    return "custom-style";
  });

  customStyleSheet = await browser.storage.sync.get().then((result) => {
    return result.customCss;
  });

  // check if the css style is set to default or custom, to set custom style for clock just
  // put css styles on addon settings page

  if (counter.className == "custom-style") {
    var customStyle = document.createElement("style");
    customStyle.type = "text/css";
    customStyle.innerHTML = ".custom-style {" + customStyleSheet + "}";
    customStyle.innerHTML += ".hidden{ display:none }";
    document.getElementsByTagName("head")[0].appendChild(customStyle);

    addClass(counter, "custom-style");
  }

  counter.innerHTML = await formatTime(window.sexyLCDClockDate);

  counter.addEventListener("mouseenter", function() {
    addClass(counter, "hidden");

    setTimeout(function() {
      removeClass(counter, "hidden");
    }, 5000);
  });

  document.body.insertBefore(counter, document.body.firstChild);

  await browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
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
