/*
// SOURCE:  http://stackoverflow.com/questions/18229022/how-to-show-current-time-in-javascript-in-the-format-hhmmss
function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
function showClockTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    // add a zero in front of numbers<10
    m = checkTime(m);
    s = checkTime(s);
    return h + ":" + m + ":" + s;
}
*/

function showClockTime(date) {
  var date = new Date();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  seconds = seconds < 10 ? '0'+seconds : seconds;
  var strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
  return strTime;
}


//============================ REGISTER PUBLIC RESOURCES ============================//
// Register the list of functions and variables we want to make publicly available
//module.exports.make = make;
//module.exports.avatars = avatars;

// OR

if (typeof thisIsTheClient === "undefined")
{
	module.exports = {
		showClockTime: showClockTime
	};
}
