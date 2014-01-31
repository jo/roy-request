'use strict';

var couch = process.env.COUCH || 'http://localhost:5984';

var adapter = require('..');

var request = require('request').defaults({ jar: false, json: true });

exports.create = {
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
      api.create(function(err, response) {
        test.ok(err, 'an error should have been occured');
        test.equal(response, undefined, 'response should be undefined');
        test.done();
      });
    });
  },

  'database can be created': function(test) {
    this.api.create(function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.ok(response.ok, 'response should be ok');
      test.done();
    });
  },

  'database already exist': function(test) {
    var api = this.api;

    request.put(this.db, function() {
      api.create(function(err, response) {
        test.ok(err, 'an error should have been occured');
        test.equal(response, undefined, 'response should be undefined');
        test.done();
      });
    });
  }
};
