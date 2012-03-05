var path = require('path');
var fs = require('fs');
var should = require('should');

var tailed = require(__dirname + '/../lib');

var log = console.log.bind(console);
var log = function() { };

var create = function(path) {
  var fd = fs.openSync(path, 'w');
  fs.writeSync(fd, '', 0);
  fs.closeSync(fd);
  log('created %s', path);
}

var write = function(path, text) {
  var fd = fs.openSync(path, 'a');
  log('writing %s to %s', text, path);
  fs.writeSync(fd, text, fs.fstatSync(fd).size);
  fs.closeSync(fd);
};

var rm = function(path) {
  fs.unlinkSync(path); 
  log('deleted %s', path);
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

describe('tailed', function() {

  var tail;
  beforeEach(function(done) {
    create(file);
    tailed(file, function(err, t) {
      if(err) done(err);
      tail = t;
      done();
    });
  });

  afterEach(function(done) {
    tail.close();
    rm(file);
    done();
  });

  describe('simple tailing', function() {
    it('works', function(done) {
      tail.on('data', function(data) {
        data.should.equal('ok');
        done();
      });
      write(file, 'ok');
    });
  });

  describe('multiple-write tailing', function() {
    it('receives all messages', function(done) {
      tail.once('data', function(data) {
        data.should.equal('one');
        tail.once('data', function(data) {
          data.should.equal('two');
          done();
        });
        write(file, 'two');
      });
      write(file, 'one');
    });
  });

  describe('tailing an existing file', function() {
    it('emits new data only', function(done) {
      write(file, 'one');
      write(file, 'two');
      //bah...ugly - need to let any potential OS events fire off
      setTimeout(function() {
        tail.once('data', function(data) {
          data.should.equal('three');
          done();
        });
        write(file, 'three');
      }, 1000);
    });
  });

  describe('tailing a file which receives a large write', function() {
    it('emits all written data', function() {
      var hugeData = '';
      for(var i =0; i < 1000; i++) {
        hugeData += [
          'you say you\'ve got a real solution?',
          'well you know, we\'d all love to see the plan',
          'you ask me for my contribution?',
          'well, you know, we\'re all doin\' what we can',
          'but if you want money for people with minds that hate',
          'all I can tell you is, brother, you have to wait'
        ].join('\n');
      }
      tail.once('data', function(data) {
        data.should.equal(hugeData);
      });

      write(file, hugeData);
    });
  });

  describe('tailing a log file which gets deleted', function() {
    var file = __dirname + '/deltorted.txt';

    it('emits error', function(done) {
      create(file);
      tailed(file, function(err, tail) {
        should.not.exist(err);
        tail.once('data', function(data) {
          data.should.equal('her');
          log('received ' + data + '..deleting file');
          tail.once('error',function(err) {
            should.exist(err);
            tail.close();
            done();
          });
          rm(file);
        });
        write(file, 'her');
      });
    });
  });

  describe('tailing a log file which gets truncated', function() {

    it('emits data before and after truncation', function(done) {
      create(file);
      tailed(file, function(err, tail) {
        should.not.exist(err);
        tail.once('data', function(data) {
          data.should.equal('before');
          create(file);
          var stat = fs.statSync(file);
          stat.size.should.equal(0);
          tail.once('data', function(data) {
            data.should.equal('after');
            tail.close();
            done();
          });
          write(file, 'after');
        });
        write(file, 'before');
      });
    });
  });
});
