var Bacon = require('bacon.model');
var expect = require('chai').expect;
var List = require('../').List;

var level = require('level-test')();
var levelLiveStream = require('level-live-stream');


var db = level('testdb', { encoding: 'json' });
levelLiveStream.install(db);

describe('#list', function () {
  var list;

  before(function () {
    // add two values to db before we create list
    db.put(0, { id: 0, value: "test object 0" });
    db.put(1, { id: 1, value: "test object 1" });
  });

  it('constructor should create a new list', function () {
    list = List(db);
    expect(list).to.exist;
  });

  it('onValue should get existing values', function (done) {
    list.onValue(function (values) {
      if (values.length == 2) {
        done();
        return Bacon.noMore;
      }
    });
  });

  it('onValue should get new values', function (done) {
    list.onValue(function (values) {
      if (values.length == 3) {
        done();
        return Bacon.noMore;
      }
    });
    list.db.put(2, { id: 2, value: "test object 2" });
  });

  it('later onValue should get existing values', function (done) {
    list.onValue(function (values) {
      if (values.length == 3) {
        done();
        return Bacon.noMore;
      }
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