var Bacon = require('bacon.model');

module.exports = function (change) {
  return function del (items) {

    delete items[change.key];

    return items;
  };
};