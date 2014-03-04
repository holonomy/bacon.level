var Bacon = require('bacon.model');

var get = require('./get');
var put = require('./put');

module.exports = function (db) {

  return function Collection (initialValue) {
    // default initial value to empty array
    initialValue = initialValue || [];
    
    // create database stream
    var readStream = require('../stream')(db);

    // create collection from stream
    var collection = readStream.toProperty(initialValue);

    // store objects
    collection.readStream = readStream;
    collection.db = db;
    collection.Model = require('../model')(db);

    // methods
    collection.get = get(collection);
    collection.put = put(collection);

    return collection;
  };
};