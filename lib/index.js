var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Tailer = function(file, encoding, cb) {
  EventEmitter.call(this);
  this.encoding = encoding || 'utf8';
  this._file = file;
  this._offset = 0;
  this._init(file, cb);
};

util.inherits(Tailer, EventEmitter);

var size = function(file, cb) {
  fs.stat(file, function(err, stat) {
    if(err) return cb(err);
    return cb(null, stat.size);
  });
};

var readBytes = function(filePath, start, length, cb) {
  fs.open(filePath, 'r', function(err, fd) {
    if(err) return cb(err);
    var buffer = Buffer(length);
    fs.read(fd, buffer, 0, length, start, function(err, bytesRead, buffer) {
      if(bytesRead < length) {
        throw new Error("BytesRead " + bytesRead +" less than length " + length + ". Not yet handled");
      }
      cb(null, buffer);
    })
  });
};

Tailer.prototype._onChange = function(event) {
  var self = this;
  size(self._file, function(err, newSize) {
    if(err) return self.emit('error', err);

    var delta = newSize - self._offset;
    if(!delta) return; //no change
    if(delta < 0) {
      self._offset = 0;
      delta = newSize;
    }

    readBytes(self._file, self._offset, delta, function(err, data) {
      if(err) return self.emit('error', err);

      self.emit('data', data.toString(self.encoding));
    });

    self._offset += delta;
  });
};

Tailer.prototype._init = function(file, cb) {
  var self = this;
  size(file, function(err, size) {
    if(err) return cb(err); //stat error, file might not exist
    self._offset = size;
    self.watcher = fs.watch(file, self._onChange.bind(self));
    return cb(null, self);
  });
};

Tailer.prototype.close = function() {
  this.watcher.close();
};


var tailed = module.exports = function(file, encoding, cb) {
  if('function' === typeof encoding) {
    cb = encoding;
    encoding = 'utf8';
  }
  return new Tailer(file, encoding, cb);
};
