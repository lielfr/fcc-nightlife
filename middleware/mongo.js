var config = require('../config');
var mongodb = require('mongodb').MongoClient;


function mongoMiddleware(req, res, next) {
  mongodb.connect(config.dbURL, function(err, db) {
    if (err) return console.error(err);

    var mongoObj = {
      db: db,
      accomodations: db.collection('accomodations'),
      rating: db.collection('rating'),
      users: db.collection('users')
    };

    req.mongo = mongoObj;
    next();
  });
}

module.exports = mongoMiddleware;
