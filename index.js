/*
 * roy-request
 * https://github.com/jo/roy-request
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(url, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  // TODO: support authentication: session and basic auth
  // options.auth


  var request = require('request').defaults({ jar: false, json: true });


  var api = {
    // Return the url.
    id: function() {
      return url;
    },

    // Check if database exists.
    exists: function(callback) {
      request.head(url, function(err, response) {
        if (err) {
          return callback(err);
        }

        if (response.statusCode === 200) {
          return callback(null, { ok: true });
        }
        if (response.statusCode === 404) {
          return callback(null, { ok: false });
        }
        
        callback({ error: 'unknown', reason: 'unknown response' }, { ok: false });
      });
    },

    // Create database (target only)
    create: function(callback) {
      request.put(url, function(err, response, body) {
        if (err) {
          return callback(err);
        }

        if (response.statusCode === 201) {
          return callback(null, { ok: true });
        }

        callback(body);
      });
    },

    // Retrieve information about database
    info: function(callback) {
      request.get(url, function(err, response, body) {
        if (err) {
          return callback(err);
        }

        if (response.statusCode === 200) {
          return callback(null, body);
        }

        callback(body);
      });
    },

    // Ensure full commit (target only)
    ensureFullCommit: function(callback) {
      request.post({
        url: url + '/_ensure_full_commit',
        // manually set Content-Type, json: true only sets it when there is a
        // post body
        headers: {
          'Content-Type': 'application/json'
        }
      }, function(err, response, body) {
        if (err) {
          return callback(err);
        }

        if (response.statusCode === 201) {
          return callback(null, body);
        }

        callback(body);
      });
    },

  
    // Fetch document
    get: function(id, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }

      request.get(url + '/' + encodeURIComponent(id), { qs: options }, function(err, response, body) {
        if (err) {
          return callback(err);
        }

        if (response.statusCode === 200) {
          return callback(null, body);
        }

        callback(body);
      });
    },
    
    // Update single document
    put: function(doc, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }

      request.put({
        url: url + '/' + encodeURIComponent(doc._id),
        qs: options,
        body: doc
      }, function(err, response, body) {
        if (err) {
          return callback(err);
        }

        if (response.statusCode === 201) {
          return callback(null, body);
        }

        callback(body);
      });
    },
    

    // Retrieve bulk documents (source only)
    allDocs: function(options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }

      var keys = options.keys;
      delete options.keys;

      request({
        method: keys ? 'POST' : 'GET',
        url: url + '/_all_docs',
        qs: options,
        body: keys ? { keys: keys } : null
      }, function(err, resp, body) {
        if (err) {
          return callback(err);
        }

        if (resp.statusCode === 200) {
          return callback(err, body);
        }

        callback(body);
      });
    },

    // Update batch of documents (target only)
    bulkDocs: function(docs, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }

      var headers = {};
      if (options.noFullCommit) {
        headers['X-Couch-Full-Commit'] = false;
      }

      request.post({
        url: url + '/_bulk_docs',
        body: docs,
        headers: headers
      }, function(err, resp, body) {
        if (err) {
          return callback(err);
        }

        if (resp.statusCode === 201) {
          return callback(err, body);
        }

        callback(body);
      });
    },


    // Compare docs revisions (target only)
    revsDiff: function(revs, callback) {
      request.post({
        url: url + '/_revs_diff',
        body: revs
      }, function(err, resp, body) {
        if (err) {
          return callback(err);
        }

        callback(err, body);
      });
    },


    // Listen to changes (source only)
    changes: function(options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }

      var docIds = options.doc_ids;
      delete options.doc_ids;
      if (docIds) {
        options.filter = '_doc_ids';
      }

      request({
        method: docIds ? 'POST' : 'GET',
        url: url + '/_changes',
        qs: options,
        body: docIds ? { doc_ids: docIds } : null
      }, function(err, resp, body) {
        if (err) {
          return callback(err);
        }
        if (resp.statusCode === 200) {
          return callback(err, body);
        }

        callback(err, body);
      });
    }
  };


  // return callback
  callback(null, api);
};
