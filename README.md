# bacon.level

a leveldb plugin for bacon.json

## install

`npm install --save holonomy/bacon.level`

## usage

```
var level = require('level')
var levelLiveStream = require('level-live-stream');

var List = require('../').List;

var db = level('testdb', { encoding: 'json' });
levelLiveStream.install(db);

list = List(db);
list.db.put(0, { id: 0, value: "my favorite object" });

list.onValue(console, 'log');

list.db.put(1, { id: 1, value: "my other favorite object" });
```