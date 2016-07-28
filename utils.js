var utils = {};

utils.padString = function(num, length) {
  var numStr = num.toString();
  while (numStr.length < length)
    numStr = '0' + numStr;
  return numStr;
};

utils.currentDate = function() {
  var dateObj = new Date();
  var year = dateObj.getFullYear().toString();
  var month = utils.padString(dateObj.getMonth() + 1, 2);
  var day = utils.padString(dateObj.getDate(), 2);
  return year + month + day;
}

utils.randomChoice = function(arr) {
  return arr[Math.floor(Math.random()*(arr.length - 1))];
};

utils.randomAlphanum = function() {
  var alphanums = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  alphanums = alphanums.split('');
  return utils.randomChoice(alphanums);
};

utils.randomAlphanums = function() {
  var ret = '';
  for (var i = 0; i < length; i++)
    ret += utils.randomAlphanum();
  return ret;
};

utils.onError = function (err) {
  console.error(err.stack);
}

utils.gotoError = function(req, res, errText) {
  req.session.errText = errText;
  res.redirect('/error');
  req.mongo.db.close();
  res.end();
}

utils.apiError = function(req, res, errText) {
  if (req.mongo)
    req.mongo.close();
  res.writeHead(500, {'Content-Type': 'text/json; charset=UTF-8'});
  res.end(JSON.stringify({status: 'error', msg: errText}));
}

utils.apiSuccess = function(req, res, statusObj) {
  if (req.mongo)
    req.mongo.close();
  res.writeHead(200, {'Content-Type': 'text/json; charset=UTF-8'});
  res.end(JSON.stringify({status: 'success', msg: statusObj}));
}

module.exports = utils;
