var path = require('path');
var fs = require('fs');

var tailed = require(__dirname + '/../lib');

var writeText = function(path, text) {
  fs.writeFileSync(path, text, 'utf8');
}

describe('tailed', function() {
  describe('tailing text file', function(){

    var file = path.join(__dirname, 'temp.txt');
    afterEach(function() {
      try{ fs.unlinkSync(file); } catch(e) { }
    });

    
    it('emits new text added', function(done) {
      var tail = tailed(file, 'utf8');
      tail.on('data', function(data) {
        data.should.equal('hi');
        done();
      });
      writeText(file, 'hi');
    });
  });
});
