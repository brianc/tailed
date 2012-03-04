var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Tailer = function(file, encoding, cb) {
  EventEmitter.call(this);
  this.encoding = encoding || 'utf8';
  this._file = file;
  this._offset = 0;
  var self = this;
  self._watch(file, cb);
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

Tailer.prototype._watch = function(file, cb) {
  var self = this;
  fs.stat(file, function(err, stat) {
    if(err) return cb(err); //init error
    self._offset = stat.size;
    self.watcher = fs.watch(file, function(event) {
      self._getSizeDelta(function(err, delta) {
        if(err) return cb(err); 
        if(!delta) return; //no change
        readBytes(file, self._offset, delta, function(err, data) {
          if(err) return cb(err); 
          self.emit('data', data.toString(self.encoding));
        });
        self._offset += delta;
      });
    });
    return cb(null, self);
  });
};

Tailer.prototype.close = function() {
  this.watcher.close();
}


var tailed = module.exports = function(file, encoding, cb) {
  if('function' === typeof encoding) {
    cb = encoding;
    encoding = 'utf8';
  }
  return new Tailer(file, encoding, cb);
};
