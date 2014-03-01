var Bacon = require('bacon.model');
require('bacon.nodestream');

Bacon.Level = function (db) {

  var stream = require('./stream')(db);
  var level = stream.toProperty();
  level.stream = stream;

  // store value for sync get
  var value;
  level.onValue(function (val) {
    value = val;
  });

  // define sync get of value
  // or get item model by id
  level.get = function byId (id) {
    if (!id) { return value; }
    // TODO optimize
    return level.flatMap(function (values) {
      return values[id];
    });
  };
  level.db = db;

  return level;
};

module.exports = Bacon;
