'use strict';

var couch = process.env.COUCH || 'http://localhost:5984';

var adapter = require('..');

var request = require('request').defaults({ jar: false, json: true });

exports.revsDiff = {
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

  'empty response':  function(test) {
    this.api.revsDiff({}, function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.equal(typeof response, 'object', 'response should be an object');
      test.deepEqual(response, {}, 'response should be empty');
      test.done();
    });
  },

  'database contains single doc': {
    setUp: function(done) {
      var doc = this.doc = {
        _id: 'mydoc',
        foo: 'bar'
      };

      request.put(this.db + '/' + this.doc._id, { body: this.doc }, function(err, resp, body) {
        doc._rev = body.rev;
        done();
      });
    },

    'empty': function(test) {
      this.api.revsDiff({}, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.equal(typeof response, 'object', 'response should be an object');
        test.deepEqual(response, {}, 'response should be empty');
        test.done();
      });
    },

    'all present': function(test) {
      this.api.revsDiff({ mydoc: [ this.doc._rev ] }, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.equal(typeof response, 'object', 'response should be an object');
        test.deepEqual(response, {}, 'response should be empty');
        test.done();
      });
    },

    'missing': function(test) {
      this.api.revsDiff({ mydoc: [ '1-unknwon' ] }, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.equal(typeof response, 'object', 'response should be an object');
        test.equal(typeof response.mydoc, 'object', 'response should include mydoc object');
        test.equal(typeof response.mydoc.missing, 'object', 'response should include mydoc.missing object');
        test.equal(response.mydoc.missing.indexOf('1-unknwon'), 0, 'response should include missing rev');
        test.done();
      });
    }
  }
};
