var Bacon = require('bacon.model');
require('bacon.nodestream');

module.exports = function (db) {
  
  if (typeof db.createLiveStream === 'undefined') {
    return Bacon.never();
  }

  var liveStream = db.createLiveStream({
    old: false,
  });
  var eventStream = Bacon.fromNodeStream(liveStream);
  var modFnStream = eventStream.flatMap(function (change) {
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
  });

  return modFnStream;
}