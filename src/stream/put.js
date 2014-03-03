var Bacon = require('bacon.model');

module.exports = function (change) {

  var Model = require('../model')(change.db);

  return function put (items) {

    var item = items[change.key];

    if (item) {
      item.set(change.value);
    } else {
      item = Model(change.key, change.value);
      items[change.key] = item;
    }

    return items;
  };
};