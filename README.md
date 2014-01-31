roy-request [![Build Status](https://secure.travis-ci.org/jo/roy-request.png?branch=master)](http://travis-ci.org/jo/roy-request)
===========
[CouchDB](http://couchdb.apache.org/) HTTP adapter for [roy-replicator](https://github.com/jo/roy-replicator) based on
[request](https://github.com/mikeal/request).

Usage
-----
Install the module with: `npm install roy-request`

```js
var adapter = require('roy-request')('http://localhost:5984/mydb');
adapter.info(function(err, info) {
  console.log(info);
});
```

Development
-----------
* Lint the code with `npm run jshint`
* Run the tests with `npm test`

License
-------
Copyright (c) 2013 Johannes J. Schmidt, TF

Licensed under the MIT license.
