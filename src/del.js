var Bacon = require('bacon.model');

module.exports = function (change) {
  return function del (items) {

    return items.filter(function (item) {
      return item.get().id !== change.key;
    });
  };
};