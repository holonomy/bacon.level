var Bacon = require('bacon.model');
var _ = require('lodash');

module.exports = function (db) {
  var dbStream = Bacon.fromBinder(function (sink) {
    var stream = db.liveStream()
    .on('data', function (change) {
      console.log("db change:", change);

      var f;

      switch (change.type) {
        case undefined:
        case 'put':
          f = function (data) {
            var index = _.indexOf(_.pluck(data, 'id'), change.key);
            if (index !== -1) {
              data[index] = change.value;
            } else {
              data.push(change.value);
            }
            return data;
          }
          break;

        case 'del':
          f = function (data) {
            return _.filter(data, function (item) {
              return item.id !== change.key;
            })
          }
          break;
        default:
          f = function (data) { return data; }
          break;
      }

      sink(f);
    })
    .on('error', function (err) {
      sink(new Bacon.Error(function () { return err; }));
    })

    return function unsubscribe () {
      delete stream;
    }
  });

  dbStream.onValue(function (changeF) {
    console.log("db change fn:", changeF);
  })

  var list = Bacon.Model([]);
  list.apply(dbStream);
  list.db = db;

  return list;
}