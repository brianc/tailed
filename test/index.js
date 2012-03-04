var path = require('path');
var fs = require('fs');

var tailed = require(__dirname + '/../lib');

var writeText = function(path, text) {
  var fd = fs.openSync(path, 'a');
  fs.writeSync(fd, text, fs.fstatSync(fd).size);
  fs.closeSync(fd);
};

var file = path.join(__dirname, 'temp.txt');

var check = function(text, cb) {
  var t = tailed(file, 'utf8', function(err) {
    if(err) cb(err);
    t.once('data', function(data) {
      data.should.equal(text);
      cb();
    });
    writeText(file, text);
  });
}


describe('tailed', function() {
  beforeEach(function() {
    //ensure file exists
    writeText(file, '');
  });

  afterEach(function(done) {
    //delete the file
    process.nextTick(function() {
      try{ fs.unlinkSync(file); } catch(e) { console.error(e) }
      done();
    })
  });

  describe('canary test', function(){

    it('emits data', function(done) {
      check('hi', done);
    });
  });

  describe('multiple messages', function() {

    it('should all be emitted', function(done) {
      var tail = tailed(file, 'utf8', function(err) {
        if(err) done(err);
        tail.once('data', function(data) {
          data.should.equal('one');
          tail.once('data', function(data) {
            data.should.equal('two');
            done();
          });
          writeText(file, 'two');
        });
      });

      writeText(file, 'one');
    });

  });

  describe('huge message', function() {
    it('is emitted', function(done) {
      done();
    });
  });
});
