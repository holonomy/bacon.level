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
        return function put (data) {
          var index = _.indexOf(_.pluck(data, 'id'), change.key);
          if (index !== -1) {
            data[index] = change.value;
          } else {
            data.push(change.value);
          }
          return data;
        };
        break;

      case 'del':
        return function del (data) {
          return _.filter(data, function (item) {
            return item.id !== change.key;
          });
        };
        break;
    }

    return function get (data) { return data; };
  });

  // debug
  applyStream.onValue(function (changeF) {
    console.log("db change fn:", changeF);
  })

  level.apply(applyStream);

  return level;
}

module.exports = Bacon;