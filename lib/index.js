var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Tailer = function() {
  EventEmitter.call(this);
}

util.inherits(Tailer, EventEmitter);

var tailed = module.exports = function() {
  return new Tailer();
}
