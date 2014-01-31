'use strict';

var couch = process.env.COUCH || 'http://localhost:5984';

var adapter = require('..');

var request = require('request').defaults({ jar: false, json: true });

exports.info = {
  setUp: function(done) {
    var db = this.db = couch + '/roy-test-adapter';
    var that = this;

    request.del(db, function() {
      adapter(db, function(err, api) {
        that.api = api;
        done();
      });
    });
  },

  tearDown: function(done) {
    request.del(this.db, done);
  },

  'wrong url produces error': function(test) {
    adapter('http://nobody.unknown/nowhere', function(err, api) {
      api.info(function(err, response) {
        test.ok(err, 'an error should have been occured');
        test.equal(response, undefined, 'response should be undefined');
        test.done();
      });
    });
  },

  'database does not exist': function(test) {
    this.api.info(function(err, response) {
      test.ok(err, 'an error should have been occured');
      test.equal(err.error, 'not_found', 'error should be not_found');
      test.equal(response, undefined, 'response should be undefined');
      test.done();
    });
  },

  'get database information': function(test) {
    var api = this.api;

    request.put(this.db, function() {
      api.info(function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.equal(typeof response, 'object', 'response should be an object');
        test.ok(typeof response.update_seq === 'number' || typeof response.update_seq === 'string', 'update_seq should be a number or a string');
        test.equal(typeof response.instance_start_time, 'string', 'instance_start_time should be a string');
        test.done();
      });
    });
  }
};
