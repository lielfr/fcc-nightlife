var config = require('./config');
var utils = require('./utils');
var passport_twitter = require('passport-twitter').Strategy;
var mongo = require('mongodb').MongoClient;
var co = require('co');

var authHelper = {};
authHelper.onAuthSuccess = function(token, tokenSecret, profile, cb) {
  co(function* () {
    var db = yield mongo.connect(config.dbURL);
    yield db.collection('users').findAndModify(
      {_id: profile.id},
      [],
      {
        $setOnInsert: {
          username: profile.username,
          displayName: profile.displayName,
          photo: profile.photos[0].value
        }
      },
      {new: true, upsert: true}
    );
    db.close();
  }).catch(utils.onError);
  return cb(null, profile);
};

authHelper.onSerialize = function(user, cb) {
  cb(null, user.id);
};

authHelper.onDeserialize = function(obj, cb) {
  co(function* () {
    var db = yield mongo.connect(config.dbURL);
    var profile = yield db.collection('users').find({_id: obj}).toArray();
    db.close();
    cb(null, {id: obj, name: profile[0].displayName});
  }).catch(utils.onError);
};

module.exports = authHelper;
