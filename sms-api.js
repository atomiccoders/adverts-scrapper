var SMSAPI = require("smsapi"),
  smsapi = new SMSAPI({
    normalize: true,
    format: 'json'
  });

smsapi.authentication
  .login("jmic@tapptic.com", "0ayIfdglOgw0nhiatt")
  .then(this.sendMessage)
  .then(displayResult)
  .catch(displayError);

exports.sendTest = function sendTest(msg) {
  console.log(msg);
  return msg;
}

exports.sendMessage = function sendMessage(msg) {
  return smsapi.message
    .sms()
    .from(msg.from) // "Info"
    .to(msg.to) // "883543667"
    .message(msg.text)
    .normalize() // replace polish letters
    .execute(); // return Promise
}

function displayResult(result) {
  console.log('smsApi info:\n', result, '\n');
}

function displayError(err) {
  console.error(err);
}