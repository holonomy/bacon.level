var Bacon = require('bacon.model');
var _ = require('lodash');

Bacon.Level = function (db) {
  
  var list = Bacon.Model([]);
  list.db = db;

  var dbStream = Bacon.fromBinder(function (sink) {
    var createStream = db.createLiveStream || db.createReadStream;

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
  list.apply(dbStream);

  return list;
}

module.exports = Bacon;