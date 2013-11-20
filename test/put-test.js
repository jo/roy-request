'use strict';

var couch = process.env.COUCH || 'http://localhost:5984';

var adapter = require('../lib/roy-request');

var request = require('request').defaults({ jar: false, json: true });

exports.put = {
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

  'simple put': function(test) {
    var api = this.api;

    var doc = {
      _id: 'mydoc',
      foo: 'bar'
    };

    api.put(doc, function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.equal(typeof response, 'object', 'response should be an object');
      test.ok(response.ok, 'response should be ok');
      test.equal(response.id, 'mydoc', 'response should include id');
      test.done();
    });
  }
};
