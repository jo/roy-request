'use strict';

var adapter = require('..');

exports.id = {
  'basics': function(test) {
    var url = 'http://nobody.unknown/nowhere';

    adapter(url, function(err, api) {
      test.equal(typeof api.id, 'function', 'should be a function');
      test.equal(api.id(), url, 'should return url');
      test.done();
    });
  }
};
