var _ = require('lodash');
var expect = require('chai').expect;
var Bacon = require('baconjs');
require('../');

var level = require('level-test')();
var liveStream = require('level-live-stream');

var db = level('testdb', { encoding: 'json' });
liveStream.install(db);

describe('#Bacon.Level', function () {
  var baconLevel;

  before(function () {
    // add two values to db before we create baconLevel
    db.put(0, { id: 0, value: "test object 0" });
    db.put(1, { id: 1, value: "test object 1" });
  });

  it('constructor should create a new bacon level', function () {
    baconLevel = Bacon.Level(db);
    expect(baconLevel).to.exist;
  });

  it('onValue should get existing values', function (done) {
    baconLevel.onValue(function (values) {
      if (values.length == 2) {
        done();
        return Bacon.noMore;
      }
    });
  });

  it('onValue should get new values', function (done) {
    baconLevel.onValue(function (values) {
      if (values.length == 3) {
        done();
        return Bacon.noMore;
      }
    });
    baconLevel.db.put(2, { id: 2, value: "test object 2" });
  });

  it('later onValue should get existing values', function (done) {
    baconLevel.onValue(function (values) {
      if (values.length == 3) {
        done();
        return Bacon.noMore;
      }
    });
  });

  it("get with id should return item model", function (done) {
    baconLevel.get(2).onValue(function (value) {
      expect(value).to.have.property('id', 2);
      expect(value).to.have.property('value', "test object 2");
      done();
      return Bacon.noMore;
    });
  });

  after(function (done) {
    // del all objects in db
    db.createKeyStream()
    .on('data', function (k) {
      db.del(k);
    })
    .on('close', function () {
      done();
    });
  });
});