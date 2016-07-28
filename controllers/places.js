var config = require('../config');
var utils = require('../utils');
var express = require('express');
var co = require('co');
var mongo = require('mongodb').MongoClient;

function placesMongoMiddleware(req, res, next) {
  if (!req.session.user)
    return utils.apiError(req, res, 'Not logged in.');
  co(function* () {
    req.mongo = yield mongo.connect(config.dbURL);
  }).then(next).catch(utils.onError);
}

var places = express.Router();
places.use(placesMongoMiddleware);
places.get('/:action', function(req, res) {
  co(function* () {
    var accomodations = req.mongo.collection('accomodations');
    var rating = req.mongo.collection('rating');
    // Get rid of previous accomodations unless they were made today.
    yield accomodations.deleteMany({
      uid: req.session.user.id,
      date: {$neq: utils.currentDate}
    });
    switch(req.params.action) {
      case 'go':
        yield accomodations.findAndModify(
          {uid: req.session.user.id, place_id: req.query.placeID},
          [],
          {
            $setOnInsert: {
              uid: req.session.user.id,
              place_id: req.query.placeID,
              date: utils.currentDate()
            }
          },
          {new: true, upsert: true}
        );
        utils.apiSuccess(req, res, 'Marked successfully.');
      break;
      case 'delete':
        var query = yield accomodations.deleteOne({
          uid: req.session.user.id, place_id: req.query.placeID
        });
        if (query.result.n !== 1)
          utils.apiError(req, res, 'Could not delete the item.');
        else
          utils.apiSuccess(req, res, 'Successfully deleted.')
      break;
      case 'check':
        var isGoing = yield accomodations.find({
          uid: req.session.user.id, place_id: req.query.placeID
        }).toArray();
        var rank = yield rating.find({
          uid: req.session.user.id, place_id: req.query.placeID
        }).toArray();
        var returnObj = {
          isGoing: isGoing.length===1,
          rank: rank.length===1? rank[0].rank : 0
        };
        utils.apiSuccess(req, res, returnObj);
      break;
      case 'rate':
        if (!req.query.rank || req.query.rank.search(/^[1-5]$/g) < 0)
          return utils.apiError(req, res, 'Invalid rank.');
        yield rating.findAndModify(
          {uid: req.session.user.id, place_id: req.query.placeID},
          [],
          {
            $setOnInsert: {
              uid: req.session.user.id,
              place_id: req.query.placeID
            },
            $set: {rank: req.query.rank}
          },
          {new: true, upsert: true}
        );
        utils.apiSuccess(req, res, 'Rated successfully.');
    }
  }).catch(utils.onError);
});

module.exports = places;
