var Bacon = require('bacon.model');
require('bacon.nodestream');

var Model = require('../model');
var put = require('./put');
var del = require('./del');

module.exports = function (db) {
  return Bacon.fromBinder(function (sink) {
    
    var createReadStream = db.createLiveStream || db.createReadStream;
    var readStream = createReadStream.call(db);
    var eventStream = Bacon.fromNodeStream(readStream);

    var bus = {
      seed: new Bacon.Bus(),
      put: new Bacon.Bus(),
      del: new Bacon.Bus(),
    };

    var models = {};
    eventStream.onValue(function (data) {

      data.db = db;

      switch (data.type) {
        case 'put':
          models = put(data)(models);
          sink(models);
          break;

        case 'del':
          models = del(data)(models);
          sink(models);
          break;

        case undefined:
          models = put(data)(models);
          break;
      }
    });

    eventStream.onEnd(function (data) {
      sink(models);
      sink(new Bacon.End());
    });
    var onSync = function () { sink(models); }
    readStream.addListener("sync", onSync);

    return function () {
      readStream.removeListener("sync", onSync);
    }
  });
};