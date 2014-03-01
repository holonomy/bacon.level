var Bacon = require('bacon.model');

module.exports = function Item (key, value) {
  var item = value
  item.id = key;

  var model = Bacon.Model(item);
  
  // if in development or testing
  if (process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test") {
    // name the model with
    // JSON.stringify(value)
    model.onValue(function (val) {
      model.name(JSON.stringify(val));
    });
  }

  return model;
};