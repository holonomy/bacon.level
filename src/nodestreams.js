var Bacon = require('bacon.model');
var _ = require('lodash');

module.exports = function (stream) {
  return Bacon.fromBinder(function (sink) {

    var listeners = {}
    var addListener = function (event, listener) {
      listeners[event] = listener;
      stream.on(event, listener);
    }

    addListener("readable", function () {
      sink(stream.read());
    });
    addListener("end", function () {
      sink(new Bacon.End());
    });
    addListener("error", function (err) {
      sink(new Bacon.Error(err));
    });

    return function unsubscribe () {
      _.each(listeners, function (listener, event) {
         stream.removeListener(event, listener);
      });
    };
  });
};