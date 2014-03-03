module.exports = function (model) {
  return function put (cb) {

    var key = model.id;
    var value = model.get();
    delete value.id;

    var callback = function (err, result) {
      if (err) { return cb(err); }

      model.set(result);

      return cb(null, model);
    }

    return model.db.put(key, value, callback);
  }
}