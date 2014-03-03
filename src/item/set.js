
module.exports = function (model) {

  var originalSet = model.set.bind(model);

  return function set (value) {
    value.id = model.id;

    return originalSet(value);
  };
};