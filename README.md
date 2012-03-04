#tailed

[![Build Status](https://secure.travis-ci.org/brianc/node-ami.png)](http://travis-ci.org/brianc/node-ami])

## _under development_

## example

```js
var tailed = require('tailed');

var logFilePath = require('path').join(__dirname, 'logs', 'debug.log');
require('tailed')(logFilePath, function(err, tail){
  if(err) { /*HANDLE ERROR*/ }
  tail.on('data', function(data){
    console.log(data);
  });
});
```
note: API is still in flux
