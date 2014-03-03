var stream = require('../stream');
var Model = require('../model');
var get = require('./get');

module.exports = function (db) {

  var _stream = stream(db);

  var collection = _stream.toProperty();

  // objects
  collection.stream = _stream;
  collection.db = db;
  collection.Model = Model(db);

  // methods
  collection.get = get(collection);

  return collection;
};