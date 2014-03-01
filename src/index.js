var Bacon = require('bacon.model');
require('bacon.nodestream');
require('array.prototype.find');
require('array.prototype.findindex');

Bacon.Level = function (db) {

  var stream = require('./stream')(db);
  var level = stream.toProperty();
  level.stream = stream;

  // store value for sync get
  var value;
  level.onValue(function (val) {
    level.value = val;
  });

  // define sync get of value
  // or get item model by id
  level.get = function byId (id) {
    if (!id) { return value; }
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