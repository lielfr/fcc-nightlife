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

var controller_places = require('./controllers/places');

var myApp = express();
myApp.use(helmet());
myApp.use(session({
  secret: config.sessionSecret,
  store: new session_mongoStore({url: config.dbURL}),
  resave: false,
  saveUninitialized: false
}));
myApp.use('/static', express.static(__dirname + '/static'))
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

myApp.listen(process.env.PORT || 8080);
