var config = require('./config');
var express = require('express');
var helmet = require('helmet');

var myApp = express();
myApp.use(helmet());

myApp.listen(process.env.PORT || 8080);
