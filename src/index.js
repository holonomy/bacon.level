var Bacon = require('bacon.model');
require('bacon.nodestream');
require('array.prototype.find');
require('array.prototype.findindex');

var put = require('./put');
var del = require('./del');

Bacon.Level = function (db) {

  var levelStream = Bacon.fromBinder(function (sink) {
  
    var createReadStream = db.createLiveStream || db.createReadStream;
    var readStream = createReadStream.call(db);
    var eventStream = Bacon.fromNodeStream(readStream);

    var bus = {
      seed: new Bacon.Bus(),
      put: new Bacon.Bus(),
      del: new Bacon.Bus(),
    };

    var items = [];
    eventStream.onValue(function (data) {
      console.log("data", data);

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
          items.push(Bacon.Model(data));
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

  var level = levelStream;

  level.get = function byId (id) {
    // TODO optimize
    return level.flatMap(function (values) {
      return values.find(function (item) {
        return item.get().id === 2;
      });
    });
  };
  level.db = db;

  return level;
};

module.exports = Bacon;