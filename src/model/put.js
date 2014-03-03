module.exports = function (model) {
  return function put (cb) {

    var key = model.id;
    var value = model.get();

    return model.db.put(key, value, cb);
  }
}