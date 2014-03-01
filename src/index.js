var Bacon = require('bacon.model');
require('bacon.nodestream');
require('array.prototype.find');
require('array.prototype.findindex');

Bacon.Level = function (db) {

  var level = Bacon.Model([]);
  level.db = db;
  
  var modFnStream = require('./live-stream')(db);
  var valueStream = require('./read-stream')(db);

  // debug
  valueStream.onValue(function (objects) {
    console.log("db objects:", objects);
  });
  modFnStream.onValue(function (changeF) {
    console.log("db change fn:", changeF);
  });

  level.addSource(valueStream);
  level.apply(modFnStream);

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