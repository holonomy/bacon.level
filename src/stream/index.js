var Bacon = require('bacon.model');
require('bacon.nodestream');

var Model = require('../model');
var put = require('./put');
var del = require('./del');

module.exports = function (db) {
  return Bacon.fromBinder(function (sink) {
    
    var readStream;
    if (db.createLiveStream) {
      readStream = db.createLiveStream({
        notifyOnSync: true
      });
    } else {
      readStream = db.createReadStream();
    }
    var eventStream = Bacon.fromNodeStream(readStream);

    // TODO split changes into buses
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

        case 'sync':
          sink(models);
          break;
      }
    });

    eventStream.onEnd(function (data) {
      sink(models);
      sink(new Bacon.End());
    });

    return function () {
    }
  });
};