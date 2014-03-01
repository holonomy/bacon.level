var Bacon = require('bacon.model');
require('bacon.nodestream');

module.exports = function (db) {
  
  var createReadStream = db.createLiveStream || db.createReadStream;
  var readStream = createReadStream.call(db);
  var eventStream = Bacon.fromNodeStream(readStream);

  return eventStream;
}