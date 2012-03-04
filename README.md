#tailed

## _under development_

## example

```js
var tailed = require('tailed');

var tail = tailed(__dirname__ + '/logs/somelog.txt', 'utf8', function(err) {
  if(err) {
    return console.error('Error tailing file %j', err)
  }
  //tail successfully established
  tail.on('data', function(data) {
    console.log(data);
  })
});

```

note: I think that API is kinda nasty.  It's going to change.
