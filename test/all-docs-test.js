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

  'basic': function(test) {
    var api = this.api;

    var doc = {
      _id: 'mydoc',
      foo: 'bar'
    };

    request.put(this.db + '/' + doc._id, { body: doc }, function() {
      api.allDocs(function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.equal(typeof response, 'object', 'response should be an object');
        test.equal(typeof response.rows, 'object', 'rows should be an object');
        test.equal(response.rows.length, 1, 'rows should have length of 1');
        test.equal(response.rows[0].id, 'mydoc', 'rows should include mydoc');
        test.done();
      });
    });
  },

  'with keys': function(test) {
    var api = this.api;

    var doc = {
      _id: 'mydoc',
      foo: 'bar'
    };

    request.put(this.db + '/' + doc._id, { body: doc }, function() {
      api.allDocs({ keys: ['mydoc'] }, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.equal(typeof response, 'object', 'response should be an object');
        test.equal(typeof response.rows, 'object', 'rows should be an object');
        test.equal(response.rows.length, 1, 'rows should have length of 1');
        test.equal(response.rows[0].id, 'mydoc', 'rows should include mydoc');
        test.done();
      });
    });
  }
};
