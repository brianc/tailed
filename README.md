#tailed

[![Build Status](https://secure.travis-ci.org/brianc/node-ami.png)](http://travis-ci.org/brianc/node-ami])

## _under development_

## example

```js
var tailed = require('tailed');

var logFilePath = __dirname + '/logs/development.log';

tailed(logFilePath, function(err, tail){
  if(err) { /* error handling code */ }

  tail.on('data', function(data){
    console.log(data);
  });
});
```
note: API is still in flux

## things _tailed_ handles
 - any encoding supported by node buffers
 - tailed files getting truncated while being tailed
 - tailed files getting deleted while being tailed (_tailed_ emits error for now)
