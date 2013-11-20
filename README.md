# roy-request
[CouchDB](http://couchdb.apache.org/) HTTP adapter for [roy](https://github.com/jo/roy) based on
[request](https://github.com/mikeal/request).

## Getting Started
Install the module with: `npm install roy-request`

```js
var adapter = require('roy-request')('http://localhost:5984/mydb');
adapter.info(function(err, info) {
  console.log(info);
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code using [Grunt](http://gruntjs.com/).

## License
Copyright (c) 2013 Johannes J. Schmidt, TF

Licensed under the MIT license.
