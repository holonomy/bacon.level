var Bacon = require('bacon.model');
require('bacon.nodestream');

module.exports = function (db) {
  
  if (typeof db.createReadStream === 'undefined') {
    return Bacon.never();
  }

  var readStream = db.createReadStream();
  var eventStream = Bacon.fromNodeStream(readStream);
  var valueStream = Bacon.fromBinder(function (sink) {
    var list = [];
    eventStream.onValue(function (obj) {
      // debug
      console.log("db object:", obj);

      list.push(Bacon.Model(obj.value));
    });
    eventStream.onEnd(function () {
      sink(list);
    });
  });

  return valueStream;
}