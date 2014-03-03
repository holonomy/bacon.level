var Bacon = require('bacon.model');

var put = require('./put');
var del = require('./del');

module.exports = function (db) {
  return function Model (key, value) {

    var model = Bacon.Model(value);
    model.id = key;

    model.db = db;
    model.del = del(model);
    model.put = put(model);
    
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
};