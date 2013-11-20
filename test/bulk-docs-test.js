'use strict';

var couch = process.env.COUCH || 'http://localhost:5984';

var adapter = require('../lib/roy-request');

var request = require('request').defaults({ jar: false, json: true });

exports.bulkDocs = {
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

  'upload a batch of docs': function(test) {
    var docs = [
      { _id: 'mydoc', foo: 'bar' },
      { _id: 'otherdoc', foo: 'baz' },
    ];

    this.api.bulkDocs({ docs: docs }, function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.equal(typeof response, 'object', 'response should be an object');
      test.equal(response.length, docs.length, 'response should have correct # of entries');
      response.forEach(function(resp, i) {
        test.equal(resp.id, docs[i]._id, 'resp should include doc id');
      });
      test.done();
    });
  },

  'upload with noFullCommit': function(test) {
    var docs = [
      { _id: 'mydoc', foo: 'bar' },
      { _id: 'otherdoc', foo: 'baz' },
    ];

    this.api.bulkDocs({ docs: docs }, { noFullCommit: true }, function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.equal(typeof response, 'object', 'response should be an object');
      test.equal(response.length, docs.length, 'response should have correct # of entries');
      response.forEach(function(resp, i) {
        test.equal(resp.id, docs[i]._id, 'resp should include doc id');
      });
      test.done();
    });
  },

  'upload with new_edits false': function(test) {
    var docs = [
      { _id: 'mydoc', _rev: '1-asd', foo: 'bar' },
      { _id: 'otherdoc', _rev: '1-def', foo: 'baz' },
    ];

    this.api.bulkDocs({ docs: docs, new_edits: false }, function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.equal(typeof response, 'object', 'response should be an object');
      test.equal(response.length, 0, 'response should be empty');
      test.done();
    });
  }
};
