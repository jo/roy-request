# roy-request
[CouchDB](http://couchdb.apache.org/) HTTP adapter for [roy-replicator](https://github.com/jo/roy-replicator) based on
[request](https://github.com/mikeal/request).

## Getting Started
Install the module with: `npm install roy-request`

```js
var adapter = require('roy-request')('http://localhost:5984/mydb');
adapter.info(function(err, info) {
  console.log(info);
});
```

## License
Copyright (c) 2013 Johannes J. Schmidt, TF

Licensed under the MIT license.
