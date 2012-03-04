var path = require('path');
var fs = require('fs');
var should = require('should');

var tailed = require(__dirname + '/../lib');

var writeText = function(path, text) {
  var fd = fs.openSync(path, 'a');
  fs.writeSync(fd, text, fs.fstatSync(fd).size);
  fs.closeSync(fd);
};

var file = path.join(__dirname, 'temp.txt');

describe('tailed', function() {
  beforeEach(function() {
    //ensure file exists
    writeText(file, '');
    console.log('created ', file);
  });


  afterEach(function(done) {
    //delete the file

    process.nextTick(function() {
      try{
        fs.unlinkSync(file); 
        console.log('deleted %s', file);
      } catch(e) { console.error(e) }
      done();
    })
  });

  describe('ctor args', function() {

    it('requires valid filename', function() {
      tailed('asdf', 'utf8', function(err) {
        err.should.not.equal(null);
      });
    });

    it('defaults to utf8 encoding', function() {
      var tail = tailed(file, function(err) {
        should.equal(null);
      });
    });
  });

  describe('canary test', function(){

    it('emits data', function(done) {

      tailed(file, function(err, tail) {
        if(err) done(err);
        tail.close();
        done();
      })

    });
  });

});
