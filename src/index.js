var Bacon = require('bacon.model');
require('bacon.nodestream');
var _ = require('lodash');

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

          var itemIds = _.map(items, function (item) {
            return item.get().id;
          });
          var keyIndex = _.indexOf(itemIds, change.key);

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
          return _.filter(items, function (item) {
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

  return level;
}

module.exports = Bacon;