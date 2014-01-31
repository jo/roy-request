'use strict';

var couch = process.env.COUCH || 'http://localhost:5984';

var adapter = require('..');

var request = require('request').defaults({ jar: false, json: true });

exports.changes = {
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
    this.api.changes(function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.equal(typeof response, 'object', 'response should be an object');
      test.ok(typeof response.last_seq === 'number' || typeof response.last_seq === 'string', 'last_sec should be string or number');
      test.equal(typeof response.results, 'object', 'results should be an object');
      test.equal(response.results.length, 0, 'results should be empty');
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

    'simple': function(test) {
      var doc = this.doc;

      this.api.changes(function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.equal(response.results.length, 1, 'results should contain one entry');
        test.equal(response.results[0].id, doc._id, 'result should contain doc id');
        test.ok(typeof response.results[0].seq === 'number' || typeof response.results[0].seq === 'string', 'result.seq should be string or number');
        test.equal(typeof response.results[0].changes, 'object', 'result.changes should be an object');
        test.equal(response.results[0].changes.length, 1, 'result.changes should contain one entry');
        test.equal(typeof response.results[0].changes[0], 'object', 'result.changes should contain object');
        test.equal(response.results[0].changes[0].rev, doc._rev, 'result.changes should contain doc rev');
        test.done();
      });
    }
  },

  'database contains single doc with two revisions': {
    setUp: function(done) {
      var db = this.db;

      var doc = this.doc = {
        _id: 'mydoc',
        foo: 'bar'
      };

      request.put(db + '/' + doc._id, { body: doc }, function() {
        doc._rev = '1-asd';
        request.put(db + '/' + doc._id, { body: doc, qs: { new_edits: false } }, function() {
          done();
        });
      });
    },

    'basics': function(test) {
      this.api.changes(function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.equal(response.results.length, 1, 'results should contain one entry');
        test.equal(response.results[0].changes.length, 1, 'changes should contain one entry');
        test.done();
      });
    },

    'style: all_docs': function(test) {
      this.api.changes({ style: 'all_docs' }, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.equal(response.results[0].changes.length, 2, 'changes should contain all revisions');
        test.done();
      });
    },
  },

  'database contains two docs': {
    setUp: function(done) {
      var docs = this.docs = [
        {
          _id: '_design/myfilter',
          filters: {
            bar: 'function(doc) { return doc.foo === "bar"; }',
            foo: 'function(doc, req) { return doc.foo && doc.foo === req.query.foo; }'
          }
        },
        {
          _id: 'mydoc',
          foo: 'bar'
        },
        {
          _id: 'otherdoc',
          foo: 'baz'
        }
      ];

      request.post(this.db + '/_bulk_docs', { body: { docs: this.docs } }, function(err, resp, bodies) {
        bodies.forEach(function(body, i) {
          docs[i]._rev = body.rev;
        });

        done();
      });
    },

    'basics': function(test) {
      var docs = this.docs;

      this.api.changes(function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.equal(response.results.length, docs.length, 'results should contain correct # of entries');
        test.done();
      });
    },

    'limit': function(test) {
      this.api.changes({ filter: 'myfilter/bar', limit: 1 }, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.equal(response.results.length, 1, 'results should contain one entry');
        test.done();
      });
    },

    'filter': function(test) {
      this.api.changes({ filter: 'myfilter/bar' }, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.equal(response.results.length, 1, 'results should contain one entry');
        test.equal(response.results[0].id, 'mydoc', 'results should include mydoc');
        test.done();
      });
    },

    'filter with query_params': function(test) {
      this.api.changes({ filter: 'myfilter/foo', foo: 'baz' }, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.equal(response.results.length, 1, 'results should contain one entry');
        test.equal(response.results[0].id, 'otherdoc', 'results should include otherdoc');
        test.done();
      });
    },

    'doc_ids': function(test) {
      this.api.changes({ doc_ids: ['mydoc'] }, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        if (response.error) {
          console.warn('WARNING: replication filter `_doc_ids` not supported');
        } else {
          test.equal(response.results.length, 1, 'results should contain one entry');
          test.equal(response.results[0].id, 'mydoc', 'results should include mydoc');
        }
        test.done();
      });
    }
  }

  // todo: test continuous feed option
};
