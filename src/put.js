var Bacon = require('bacon.model');

var Item = require('./item');

module.exports = function (change) {
  return function put (items) {

    items[change.key] = Item(change.key, change.value);

    return items;
  };
};