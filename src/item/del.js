
module.exports = function (model) {
  return function del (cb) {
    return model.db.del(model.id, cb);
  };
};