module.exports = function (collection) {
  // store value for sync get
  var value;
  collection.subscribeInternal(function (event) {
    if (event.hasValue()) {
      value = event.value();
    }
  });

  // without id, get value of collection
  // with id, get value of model by id
  return function get (id) {
    if (!id) { return value; }
    return value[id];
  };
}