var path = require('path');
var fs = require('fs');

var tailed = require(__dirname + '/../lib');

var writeText = function(path, text) {
  fs.writeFileSync(path, text, 'utf8');
}

var file = path.join(__dirname, 'temp.txt');

describe('tailed', function() {
  beforeEach(function() {
    //ensure file exists
    writeText(file, '');
  });

  afterEach(function() {
    //delete the file
    try{ fs.unlinkSync(file); } catch(e) { }
  });

  describe('canary test', function(){

    it('emits data', function(done) {
      var tail = tailed(file, 'utf8', function(err) {
        if(err) done(err);
        tail.on('data', function(data) {
          data.should.equal('hi');
          tail.close();
          done();
        });
        writeText(file, 'hi');
      });
    });
  });

  describe('multiple messages', function() {

  });
});
