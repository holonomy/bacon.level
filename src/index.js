var Bacon = require('bacon.model');
require('bacon.nodestream');

Bacon.Level = function (db) {

  var stream = require('./stream')(db);
  var level = stream.toProperty();
  level.stream = stream;

  // store value for sync get
  var value;
  level.subscribeInternal(function (event) {
    if (event.hasValue()) {
      value = event.value();
    }
  });

  // define sync get of value
  // or get item model by id
  level.get = function byId (id) {
    if (!id) { return value; }
    return value[id];
  };

  level.db = db;

  return level;
};

module.exports = Bacon;
