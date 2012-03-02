var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Tailer = function(file, encoding, cb) {
  EventEmitter.call(this);
  this.encoding = encoding || 'utf8';
  this._file = file;
  var self = this;
  self._getSizeDelta(function(err, newSize) {
    if(!err) {
      self._watch(file);
    }
    cb(err);
  });
  this._offset = 0;
};

util.inherits(Tailer, EventEmitter);

Tailer.prototype._getSize = function(cb) {
  var self = this;
  fs.stat(self._file, function(err, stat) {
    if(err) return cb(err);
    return cb(null, stat.size);
  });
};

Tailer.prototype._getSizeDelta = function(cb) {
  var self = this;
  this._getSize(function(err, newSize) {
    if(err) return cb(err);
    var delta = newSize - (self._lastSize || 0);
    self._lastSize = newSize;
    cb(null, delta);
  });
};

var readBytes = function(filePath, start, length, cb) {
  fs.open(filePath, 'r', function(err, fd) {
    if(err) return cb(err);
    var buffer = Buffer(length);
    fs.read(fd, buffer, 0, length, start, function(err, bytesRead, buffer) {
      if(bytesRead < length) throw new Error("BytesRead less than length. Not yet handled");
      cb(null, buffer);
    })
  })
};

Tailer.prototype._watch = function(file) {
  var self = this;
  console.log('watching %s', file);
  this.watcher = fs.watch(file, function(event) {
    console.log('watch event');
    self._getSizeDelta(function(err, delta) {
      if(err) throw err; //TODO handle errors
      if(!delta) return; //no change
      console.log('changed %d bytes', delta);
      readBytes(file, 0, delta, function(err, data) {
        if(err) throw err; //TODO handle errors
        self.emit('data', data.toString(self.encoding));
      });
    })
  });
};

Tailer.prototype.close = function() {
  this.watcher.close();
}


var tailed = module.exports = function(file, encoding, cb) {
  return new Tailer(file, encoding, cb);
};
