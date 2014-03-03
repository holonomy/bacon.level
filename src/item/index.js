var Bacon = require('bacon.model');

var put = require('./put');
var del = require('./del');
var set = require('./set');

module.exports = function Item (key, val, db) {
  var item = val;
  item.id = key;

  var model = Bacon.Model(item);
  model.id = key;

  model.db = db;
  model.del = del(model);
  model.put = put(model);
  model.set = set(model);
  
  // if in development or testing
  if (process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test") {
    // name the model with
    // JSON.stringify(value)
    model.onValue(function (value) {
      model.name(JSON.stringify(value));
    });
  }

  return model;
};