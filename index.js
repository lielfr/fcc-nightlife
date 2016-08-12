var config = require('./config');
var utils = require('./utils');
var auth = require('./auth');
var express = require('express');
var helmet = require('helmet');
var passport = require('passport');
var passport_twitter = require('passport-twitter').Strategy;
var session = require('express-session');
var session_mongoStore = require('connect-mongo')(session);
var mongo = require('mongodb').MongoClient;
var co = require('co');
var pug = require('pug');

var controller_api = require('./controllers/api');
var controller_places = require('./controllers/places');

var middleware_mongo = require('./middleware/mongo');

var myApp = express();
myApp.set('view engine', 'pug');
myApp.set('views', './views');
myApp.use(helmet());
myApp.use(session({
  secret: config.sessionSecret,
  store: new session_mongoStore({url: config.dbURL}),
  resave: false,
  saveUninitialized: false
}));
myApp.use('/static', express.static(__dirname + '/static'));
myApp.use('/api', controller_api);
myApp.use('/places', controller_places);
passport.use(new passport_twitter(
  config.twitterAuth,
  auth.onAuthSuccess
));
passport.serializeUser(auth.onSerialize);
passport.deserializeUser(auth.onDeserialize);
myApp.use(passport.initialize());
myApp.use(passport.session());

myApp.get('/auth', passport.authenticate('twitter'));
myApp.get('/auth/cb', passport.authenticate('twitter', {failureRedirect: '/error'}),
  function(req, res) {
    res.redirect('/');
});
myApp.get('/auth/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
  res.end();
});
myApp.get('/', middleware_mongo, function(req, res) {
  if (req.user)
    req.session.user = req.user;
  co(function* () {
    var lastSearch, userName;
    if (req.session.user) {
      var userProfile = yield req.mongo.users.find({
        _id: req.session.user.id
      }).toArray();
      lastSearch = userProfile[0].lastSearch;
      userName = userProfile[0].displayName;
    }
    req.mongo.db.close();
    res.render('index', {
      lastSearch: lastSearch,
      userName: userName
    });
    res.end();
  }).catch(utils.onError);

});

myApp.listen(process.env.PORT || 8080);
