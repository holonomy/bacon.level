var Bacon = require('bacon.model');
require('bacon.nodestream');

var Item = require('./item');
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

    var items = {};
    eventStream.onValue(function (data) {

      switch (data.type) {
        case 'put':
          items = put(data)(items);
          sink(items);
          break;

        case 'del':
          items = del(data)(items);
          sink(items);
          break;

        case undefined:
          items = put(data)(items);
          break;
      }
    });

    eventStream.onEnd(function (data) {
      sink(items);
      sink(new Bacon.End());
    });
    var onSync = function () { sink(items); }
    readStream.addListener("sync", onSync);

    return function () {
      readStream.removeListener("sync", onSync);
    }
  });
};