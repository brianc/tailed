var path = require('path');
var fs = require('fs');
var should = require('should');

var tailed = require(__dirname + '/../lib');

var create = function(path) {
  var fd = fs.openSync(path, 'w');
  fs.writeSync(fd, '', 0);
  fs.closeSync(fd);
  console.log('created %s', path);
}

var write = function(path, text) {
  var fd = fs.openSync(path, 'a');
  console.log('writing %s to %s', text, path);
  fs.writeSync(fd, text, fs.fstatSync(fd).size);
  fs.closeSync(fd);
};

var rm = function(path) {
  fs.unlinkSync(path); 
  console.log('deleted %s', path);
}

var file = path.join(__dirname, 'temp.txt');

describe('tailed', function() {
  describe('ctor args', function() {

    it('requires valid filename', function() {
      tailed('asdf', 'utf8', function(err) {
        should.exist(err);
        err.should.not.equal(null);
      });
    });

    it('defaults to utf8 encoding', function(done) {
      var path = __dirname + '/x';
      create(path);
      tailed(path, function(err, tail) {
        should.not.exist(err);
        should.exist(tail);
        tail.should.not.equal(null)
        tail.close();
        rm(path);
        done();
      });
    });
  });

});

describe('tailed', function() {
  describe('canary tests', function() {
    beforeEach(function() {
      create(file);
    });

    afterEach(function() {
      rm(file);
    });

    it('single message', function(done) {
      tailed(file, function(err, tail) {
        if(err) done(err);
        tail.once('data', function(data) {
          tail.close();
          data.should.equal('hi');
          done();
        });
        write(file, 'hi');
      });
    });

    it('multiple messages', function(done) {
      tailed(file, function(err, tail) {
        if(err) done(err);
        tail.once('data', function(data) {
          data.should.equal('one');
          tail.once('data', function(data) {
            data.should.equal('two');
            tail.once('data', function(data) {
              tail.close();
              data.should.equal('three');
              done();
            });
            write(file, 'three');
          });
          write(file, 'two');
        });
        write(file, 'one');
      })
    });
  });
});
