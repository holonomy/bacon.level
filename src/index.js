var Bacon = require('bacon.model');
require('bacon.nodestream');
require('array.prototype.find');
require('array.prototype.findindex');

var put = require('./put');
var del = require('./del');

Bacon.Level = function (db) {

  var levelStream = Bacon.fromBinder(function (sink) {
    
    var eventStream = require('./stream')(db);

    var bus = {
      seed: new Bacon.Bus(),
      put: new Bacon.Bus(),
      del: new Bacon.Bus(),
    };

    var items = [];
    var seeded = false;
    eventStream.onValue(function (data) {
      if (!data.type) {
        items.push(Bacon.Model(data));
      } else {
        if (!seeded) {
          sink(items);
          seeded = true;
        }

        switch (data.type) {
          case 'put':
            items = put(data)(items);
            sink(items);
            break;

          case 'del':
            items = del(data)(items);
            sink(items);
            break;
        }
      }
    });

    return function () {}
  });

  var level = levelStream.toProperty();

  level.get = function byId (id) {
    // TODO optimize
    return level.flatMap(function (values) {
      return values.find(function (item) {
        return item.get().id === 2;
      });
    });
  };
  level.db = db;

  return level;
};

module.exports = Bacon;