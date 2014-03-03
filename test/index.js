var expect = require('chai').expect;
var Bacon = require('baconjs');
require('../');

var fixture = require('./fixture.json');

var level = require('level-test')();
var liveStream = require('level-live-stream');

var db = level('testdb', { encoding: 'json' });
liveStream.install(db);

describe('#Bacon.Level', function () {
  var baconLevel;

  it('constructor should create a new bacon level', function () {
    baconLevel = Bacon.Level(db);
    expect(baconLevel).to.exist;
  });

  it('onValue should get new values', function (done) {
    baconLevel.onValue(function (values) {
      if (Object.keys(values).length == '2') {
        expect(values['0'].get()).to.deep.equal(fixture['0']);
        expect(values['0'].id).to.equal('0');
        expect(values['1'].get()).to.deep.equal(fixture['1']);
        expect(values['1'].id).to.equal('1');
        done();
        return Bacon.noMore;
      }
    });
    db.put('0', fixture['0']);
    db.put('1', fixture['1']);
  });

  it('onValue should get existing values', function (done) {
    baconLevel.onValue(function (values) {
      if (Object.keys(values).length == 2) {
        expect(values['0'].get()).to.deep.equal(fixture['0']);
        expect(values['0'].id).to.equal('0');
        expect(values['1'].get()).to.deep.equal(fixture['1']);
        expect(values['1'].id).to.equal('1');
        done();
        return Bacon.noMore;
      }
    });
  });

  it('onValue should get even more new values', function (done) {
    baconLevel.onValue(function (values) {
      if (Object.keys(values).length == 3) {
        expect(values['0'].id).to.equal('0');
        expect(values['0'].get()).to.deep.equal(fixture['0']);
        expect(values['1'].get()).to.deep.equal(fixture['1']);
        expect(values['1'].id).to.equal('1');
        expect(values['2'].get()).to.deep.equal(fixture['2']);
        expect(values['2'].id).to.equal('2');
        done();
        return Bacon.noMore;
      }
    });
    baconLevel.db.put('2', fixture['2']);
  });

  it('constructor should create another bacon level', function () {
    baconLevel = Bacon.Level(db);
    expect(baconLevel).to.exist;
  });


  it('onValue should get existing values from last session', function (done) {
    baconLevel.onValue(function (values) {
      if (Object.keys(values).length == 3) {
        expect(values['0'].get()).to.deep.equal(fixture['0']);
        expect(values['0'].id).to.equal('0');
        expect(values['1'].get()).to.deep.equal(fixture['1']);
        expect(values['1'].id).to.equal('1');
        expect(values['2'].get()).to.deep.equal(fixture['2']);
        expect(values['2'].id).to.equal('2');
        done();
        return Bacon.noMore;
      }
    });
  });

  it('get without id should return items', function () {
    var values = baconLevel.get();
    expect(values['0'].get()).to.deep.equal(fixture['0']);
    expect(values['0'].id).to.equal('0');
    expect(values['1'].get()).to.deep.equal(fixture['1']);
    expect(values['1'].id).to.equal('1');
    expect(values['2'].get()).to.deep.equal(fixture['2']);
    expect(values['2'].id).to.equal('2');
  });


  it('get with id should return item model', function (done) {
    baconLevel.get('2').onValue(function (value) {
      expect(value).to.have.property('value', "test object 2");
      done();
      return Bacon.noMore;
    });
  });

  it('set should set item model', function (done) {
    var item = baconLevel.get('2');
    var newValue = {
      value: "crazy new test object 2",
    };
    item.set(newValue);
    item.onValue(function (value) {
      expect(value).to.deep.equal(newValue);
      done();
      return Bacon.noMore;
    });
  });

  it('put should persist item model to the db', function (done) {
    var item = baconLevel.get('2');
    item.put(function (err) {
      expect(err).to.not.exist;

      db.get(item.id, function (err, result) {
        expect(err).to.not.exist;
        expect(result).to.have.property('value', "crazy new test object 2");
        done();
      });
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