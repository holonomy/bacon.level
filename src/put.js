var Bacon = require('bacon.model');

module.exports = function (change) {
  return function put (items) {

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
};