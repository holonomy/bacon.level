var Bacon = require('bacon.model');
var _ = require('lodash');
var wrap = require('streams2');

module.exports = function (db) {
  
  var level = Bacon.Model([]);
  level.db = db;

  var dbStream = Bacon.fromBinder(function (sink) {
    var createReadStream = db.createLiveStream || db.createReadStream;
    var readStream = wrap(createReadStream.call(db));

    var stream = createStream.call(db)
    .on('data', function (change) {
      console.log("db change:", change);

      switch (change.type) {
        case undefined:
        case 'put':
          sink(function (data) {
            var index = _.indexOf(_.pluck(data, 'id'), change.key);
            if (index !== -1) {
              data[index] = change.value;
            } else {
              data.push(change.value);
            }
            return data;
          });
          break;

        case 'del':
          sink(function (data) {
            return _.filter(data, function (item) {
              return item.id !== change.key;
            })
          });
          break;
      }
    })
    .on('error', function (err) {
      sink(new Bacon.Error(function () { return err; }));
    })
    .on('close', function () {
      sink(new Bacon.End());
    })
    .on('end', function () {
      sink(new Bacon.End());
    })

    return function unsubscribe () {
      delete stream;
    }
  });
  dbStream.onValue(function (changeF) {
    console.log("db change fn:", changeF);
  })
  level.apply(dbStream);

  return level;
}