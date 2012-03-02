var path = require('path');
var fs = require('fs');

var tailed = require(__dirname + '/../lib');

var writeText = function(path, text) {
  fs.writeFileSync(path, text, 'utf8');
}

describe('tailed', function() {
  describe('tailing text file', function(){

    var file = path.join(__dirname, 'temp.txt');
    beforeEach(function() {
      writeText(file, '');
    });

    afterEach(function() {
      try{ fs.unlinkSync(file); } catch(e) { }
    });

    
    it('emits data', function(done) {
      console.log('beginning to tail');
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
});
