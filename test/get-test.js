'use strict';

var couch = process.env.COUCH || 'http://localhost:5984';

var adapter = require('..');

var request = require('request').defaults({ jar: false, json: true });

exports.get = {
  setUp: function(done) {
    var db = this.db = couch + '/roy-test-adapter';
    var that = this;

    request.del(db, function() {
      adapter(db, function(err, api) {
        that.api = api;
        request.put(db, done);
      });
    });
  },

  tearDown: function(done) {
    request.del(this.db, done);
  },

  'doc does not exist': function(test) {
    this.api.get('mydoc', function(err, response) {
      test.ok(err, 'an error should have been occured');
      test.equal(err.error, 'not_found', 'error should be not_found');
      test.equal(response, undefined, 'response should be undefined');
      test.done();
    });
  },

  'doc does exist': function(test) {
    var api = this.api;

    var doc = {
      _id: 'mydoc',
      foo: 'bar'
    };

    request.put(this.db + '/' + doc._id, { body: doc }, function() {
      api.get(doc._id, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.equal(typeof response, 'object', 'response should be an object');
        test.equal(response.foo, 'bar', 'foo should be bar');
        test.done();
      });
    });
  }
};
