var config = require('../config');
var utils = require('../utils');
var rp = require('request-promise');
var body_parser = require('body-parser');
var express = require('express');
var co = require('co');

var root = express.Router();
root.use(body_parser.json());
root.use(body_parser.urlencoded({extended: true}));

root.post('/s/', function(req, res) {
  req.session.lastSearch = req.body.keyword;
  var apiRequest = {
    uri: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
    qs: {
      key: config.apiKey,
      query: 'bars near ' + req.body.keyword
    },
    json: true
  };
  rp(apiRequest).then(function (data) {
    res.writeHead(200, {'Content-type': 'text/json; charset=UTF-8'});
    res.end(JSON.stringify(data.results.map(function(item) {
      var ret = {
        id: item.place_id,
        name: item.name,
        address: item.formatted_address
      };
      if (item.hasOwnProperty('photos'))
        ret.photo = '/api/p/?ref=' + item.photos[0].photo_reference;
      return ret;
    })));
  }).catch(utils.onError);
});

root.get('/p/', function(req, res) {
  var apiRequest = {
    uri: 'https://maps.googleapis.com/maps/api/place/photo',
    qs: {
      key: config.apiKey,
      photoreference: req.query.ref,
      maxheight: 100
    },
    resolveWithFullResponse: true
  };
  rp(apiRequest).then(function(data) {
    res.redirect(data.request.uri.href);
  }).catch(utils.onError);
});

module.exports = root;
