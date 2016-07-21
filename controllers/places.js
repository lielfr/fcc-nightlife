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
places.post('/:placeID/:action', function(req, res) {
  co(function* () {
    var collection = req.mongo.collection('accomodations');
    // Get rid of previous accomodations unless they were made today.
    yield collection.deleteMany({
      uid: req.session.user.id,
      date: {$neq: utils.currentDate}
    });
    switch(req.params.action) {
      case 'go':
        yield collection.findAndModify(
          {uid: req.session.user.id, place_id: req.params.placeID},
          [],
          {
            $setOnInsert: {
              uid: req.session.user.id,
              place_id: req.params.placeID,
              date: utils.currentDate()
            }
          },
          {new: true, upsert: true}
        );
        utils.apiSuccess(req, res, 'Marked successfully.');
      break;
      case 'delete':
        var query = yield collection.deleteOne({
          uid: req.session.user.id, place_id: req.params.placeID
        });
        if (query.result.n !== 1)
          utils.apiError(req, res, 'Could not delete the item.');
        else
          utils.apiSuccess(req, res, 'Successfully deleted.')
      break;
      case 'check':
        var result = yield collection.find({
          uid: req.session.user.id, place_id: req.params.placeID
        }).toArray();
        utils.apiSuccess(req, res, result.length==1?'Yes':'No');
    }
  }).catch(utils.onError);
});

module.exports = places;
