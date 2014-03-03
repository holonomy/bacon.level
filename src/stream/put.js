var Bacon = require('bacon.model');

var Item = require('../item');

module.exports = function (change) {
  return function put (items) {

    var item = items[change.key];

    if (item) {
      item.set(change.value);
    } else {
      item = Item(change.key, change.value, change.db);
      items[change.key] = item;
    }

    return items;
  };
};