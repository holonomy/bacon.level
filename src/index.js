var Bacon = require('bacon.model');
require('bacon.nodestream');
require('array.prototype.find');
require('array.prototype.findindex');

Bacon.Level = function (db) {

  var level = Bacon.Model([]);
  level.db = db;
  
  var createReadStream = db.createLiveStream || db.createReadStream;
  var readStream = createReadStream.call(db);
  var eventStream = Bacon.fromNodeStream(readStream);
  var applyStream = eventStream.flatMap(function (change) {
    // debug
    console.log("db change:", change);

    switch (change.type) {
      case undefined:
      case 'put':
        return function put (items) {
          console.log("put", items);

          var keyIndex = items.findIndex(function (item) {
            return item.get().id === change.key;
          });

          if (keyIndex !== -1) {
            items[keyIndex].set(change.value);
          } else {
            items.push(Bacon.Model(change.value));
          }
          return items;
        };
        break;

      case 'del':
        return function del (items) {
          console.log("del", items);
          return items.filter(function (item) {
            return item.get().id !== change.key;
          });
        };
        break;
    }

    return function get (items) { return items; };
  });

  // debug
  applyStream.onValue(function (changeF) {
    console.log("db change fn:", changeF);
  })

  level.apply(applyStream);

  var originalGet = level.get;
  level.get = function byId (id) {
    if (!id) { return originalGet(); }

    // optimize
    return level.flatMap(function (values) {
      return values.find(function (item) {
        return item.get().id === 2;
      });
    });
  };

  return level;
}

module.exports = Bacon;