(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("_"));
	else if(typeof define === 'function' && define.amd)
		define(["_"], factory);
	else if(typeof exports === 'object')
		exports["wee_db"] = factory(require("_"));
	else
		root["wee_db"] = factory(root["_"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_6__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var low = __webpack_require__(1);
	var index = __webpack_require__(5);

	module.exports = function weeDB(source){
	    return index(low(source));
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var index = __webpack_require__(2);
	var storage = __webpack_require__(4);

	module.exports = function low(source) {
	  var opts = arguments.length <= 1 || arguments[1] === undefined ? { storage: storage } : arguments[1];

	  return index(source, opts, window._);
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var isPromise = __webpack_require__(3);

	module.exports = function (source) {
	  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	  var _ref$format = _ref.format;
	  var format = _ref$format === undefined ? null : _ref$format;
	  var _ref$storage = _ref.storage;
	  var storage = _ref$storage === undefined ? null : _ref$storage;
	  var _ref$writeOnChange = _ref.writeOnChange;
	  var writeOnChange = _ref$writeOnChange === undefined ? true : _ref$writeOnChange;
	  var lodash = arguments[2];

	  // Create a fresh copy of lodash
	  var _ = lodash.runInContext();

	  var db = _.chain({});

	  if (source) {
	    if (format) {
	      if (format.serialize) {
	        db.serialize = format.serialize;
	      }
	      if (format.deserialize) {
	        db.deserialize = format.deserialize;
	      }
	    }

	    if (storage) {
	      if (storage.read) {
	        db.read = function () {
	          var s = arguments.length <= 0 || arguments[0] === undefined ? source : arguments[0];

	          var res = storage.read(s, db.deserialize);
	          var init = function init(obj) {
	            db.__wrapped__ = obj;
	            db._checksum = JSON.stringify(db.__wrapped__);
	          };

	          if (isPromise(res)) {
	            return res.then(function (obj) {
	              init(obj);
	              return db;
	            });
	          }

	          init(res);
	          return db;
	        };
	      }

	      if (storage.write) {
	        db.write = function () {
	          var dest = arguments.length <= 0 || arguments[0] === undefined ? source : arguments[0];
	          return storage.write(dest, db.__wrapped__, db.serialize);
	        };
	      }
	    }
	  }

	  // Persist database state
	  function persist() {
	    if (db.source && db.write && writeOnChange) {
	      var str = JSON.stringify(db.__wrapped__);

	      if (str !== db._checksum) {
	        db._checksum = str;
	        db.write(db.source);
	      }
	    }
	  }

	  // Modify value function to call save before returning result
	  _.prototype.value = _.wrap(_.prototype.value, function (value) {
	    var v = value.apply(this);
	    persist();
	    return v;
	  });

	  // Get or set database state
	  db.getState = function () {
	    return db.__wrapped__;
	  };
	  db.setState = function (state) {
	    db.__wrapped__ = state;
	    persist();
	  };

	  db._ = _;
	  db.source = source;

	  // Read
	  if (db.read) {
	    return db.read();
	  } else {
	    return db;
	  }
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = isPromise;

	function isPromise(obj) {
	  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
	}


/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	/* global localStorage */

	module.exports = {
	  read: function read(source) {
	    var deserialize = arguments.length <= 1 || arguments[1] === undefined ? JSON.parse : arguments[1];

	    var data = localStorage.getItem(source);
	    if (data) {
	      return deserialize(data);
	    } else {
	      localStorage.setItem(source, '{}');
	      return {};
	    }
	  },
	  write: function write(dest, obj) {
	    var serialize = arguments.length <= 2 || arguments[2] === undefined ? JSON.stringify : arguments[2];
	    return localStorage.setItem(dest, serialize(obj));
	  }
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(6);
	var uuid = __webpack_require__(7);

	module.exports = function (source){
	    var db = source;
	    var wee_db = {};

	    wee_db.update = function(collection, query, value, cb){
	        // validate
	        if(typeof collection !== 'string'){ throw new Error('Collection not supplied'); }
	        if(typeof query !== 'object'){ throw new Error('Query not supplied'); }
	        if(typeof value !== 'object'){ throw new Error('Value not supplied'); }

	        // check for callback
	        var callback = typeof cb === 'function';

	        // creates collection if doesn't exist
	        checkCollection(collection, db);

	        // check for document
	        var check = db.get(collection)
	            .filter(query)
	            .value();

	        // check for an ID in insert object
	        if('id' in value){
	            throw new Error('Cannot update ID field');
	        }

	        // update all matched documents
	        _.forEach(check, function (document){
	            db.get(collection)
	            .filter(_.merge(document, value))
	            .value();
	        });

	        // check for document again
	        var afterCheck = db.get(collection)
	        .filter(_.merge(query, value))
	        .value();

	        var returnObj = {
	            count: _.size(afterCheck),
	            documents: afterCheck
	        };

	        // return
	        if(callback === true){
	            cb(null, returnObj);
	        }else{
	            return returnObj;
	        }
	        return'';
	    };
	    wee_db.upsert = function(collection, query, value, cb){
	        // validate
	        if(typeof collection !== 'string'){ throw new Error('Collection not supplied'); }
	        if(typeof query !== 'object'){ throw new Error('Query not supplied'); }
	        if(typeof value !== 'object'){ throw new Error('Value not supplied'); }

	        // check for callback
	        var callback = typeof cb === 'function';

	        // creates collection if doesn't exist
	        checkCollection(collection, db);

	        // check for existing document
	        var check = db.get(collection)
	            .filter(query)
	            .value();

	        // check for an ID in insert object
	        if('id' in value){
	            throw new Error('Cannot update ID field');
	        }

	        // document doesn't exist
	        if(_.size(check) === 0){
	            // insert the non existent document
	            this.insert(collection, _.merge(query, value));
	        }else{
	            // document does exist, lets update
	             _.forEach(check, function(document){
	                db.get(collection)
	                .filter(_.merge(document, value))
	                .value();
	            });
	        }

	        // check for document again
	        var afterCheck = db.get(collection)
	            .filter(_.merge(query, value))
	            .value();

	        var returnObj = {
	            count: _.size(afterCheck),
	            documents: afterCheck
	        };

	        // return
	        if(callback === true){
	            cb(null, returnObj);
	        }else{
	            return returnObj;
	        }
	        return'';
	    };
	    wee_db.insert = function(collection, value, cb){
	        // validate
	        if(typeof collection !== 'string'){ throw new Error('Collection not supplied'); }
	        if(typeof value !== 'object'){ throw new Error('Value not supplied'); }

	        // check for callback
	        var callback = typeof cb === 'function';

	        // creates collection if doesn't exist
	        checkCollection(collection, db);

	        // check for an ID in insert object
	        if('id' in value){
	            // has ID, check for duplicates and fail if exists
	            var check = db.get(collection)
	            .find({'id': value.id})
	            .value();

	            var returnObj = {};
	            if(_.size(check) === 0){
	                // ID doesn't exists so insert
	                db.get(collection)
	                .push(_.merge(value))
	                .value();

	                // get inserted document
	                var afterCheck = db.get(collection)
	                .filter({id: value.id})
	                .value();

	                returnObj = {
	                    count: 1,
	                    documents: afterCheck
	                };

	                // return
	                if(callback === true){
	                    cb(null, returnObj);
	                }else{
	                    return returnObj;
	                }
	            }else{
	                // duplicate ID so return a "fail"
	                returnObj = {
	                    count: 0,
	                    documents: []
	                };

	                // return
	                if(callback === true){
	                    cb('Duplicate "id" key found', null);
	                }else{
	                    return returnObj;
	                }
	            }
	        }else{
	            // generate and ID as one wasn't supplied
	            var uid = uuid();

	            // insert document
	            db.get(collection)
	            .push(_.merge({id: uid}, value))
	            .value();

	            // get inserted document
	            var GenIDafterCheck = db.get(collection)
	            .filter({id: uid})
	            .value();

	            returnObj = {
	                count: _.size(GenIDafterCheck),
	                documents: GenIDafterCheck
	            };

	            // return
	            if(callback === true){
	                cb(null, returnObj);
	            }else{
	                return returnObj;
	            }
	        }
	        return'';
	    };
	    wee_db.findOne = function(collection, query, cb){
	        // validate
	        if(typeof collection !== 'string'){ throw new Error('Collection not supplied'); }
	        if(typeof query !== 'object'){ throw new Error('Query not supplied'); }

	        // check for callback
	        var callback = typeof cb === 'function';

	        // finds the first matched document
	        var find = db.get(collection)
	        .find(query)
	        .value();

	        var dataReturn = find;
	        if(!dataReturn){
	            dataReturn = {};
	        }

	        var returnObj = {
	            count: find ? 1 : 0,
	            documents: dataReturn
	        };

	        // return
	        if(callback === true){
	            cb(null, returnObj);
	        }else{
	            return returnObj;
	        }
	        return'';
	    };
	    wee_db.find = function(collection, query, cb){
	        // validate
	        if(typeof collection !== 'string'){ throw new Error('Collection not supplied'); }
	        if(typeof query !== 'object'){ throw new Error('Query not supplied'); }

	        // check for callback
	        var callback = typeof cb === 'function';

	        // finds all matched documents
	        var find = db.get(collection)
	        .filter(query)
	        .value();

	        var returnObj = {
	            count: _.size(find),
	            documents: find
	        };

	        // return
	        if(callback === true){
	            cb(null, returnObj);
	        }else{
	            return returnObj;
	        }
	        return'';
	    };
	    wee_db._find = function(collection){
	        // validate
	        if(typeof collection !== 'string'){ throw new Error('Collection not supplied'); }
	        return db.get(collection);
	    };
	    wee_db.remove = function(collection, query, cb){
	        // validate
	        if(typeof collection !== 'string'){ throw new Error('Collection not supplied'); }
	        if(typeof query !== 'object'){ throw new Error('Query not supplied'); }

	        // check for callback
	        var callback = typeof cb === 'function';

	        // get documents to remove
	        var check = db.get(collection)
	        .filter(query)
	        .value();

	        var returnObj = {};

	        // if documents matched
	        if(_.size(check) > 0){
	            // remove documents
	            db.get(collection)
	            .remove(query)
	            .value();

	            // return how many were removed
	            returnObj = {
	                count: _.size(check),
	                documents: []
	            };

	            // return
	            if(callback === true){
	                cb(null, returnObj);
	            }else{
	                return returnObj;
	            }
	        }else{
	            // return blank/error
	            returnObj = {
	                count: 0,
	                documents: []
	            };

	            // return
	            if(callback === true){
	                cb(null, returnObj);
	            }else{
	                return returnObj;
	            }
	        }
	        return'';
	    };

	    return wee_db;
	};

	function checkCollection(collection, db){
	    var coll = db.get(collection).value();

	    if(typeof coll === 'undefined'){
	        var collObj = {};
	        collObj[collection] = [];

	        // setup collection
	        db.defaults(collObj).value();
	    }
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	//     uuid.js
	//
	//     Copyright (c) 2010-2012 Robert Kieffer
	//     MIT License - http://opensource.org/licenses/mit-license.php

	// Unique ID creation requires a high quality random # generator.  We feature
	// detect to determine the best RNG source, normalizing to a function that
	// returns 128-bits of randomness, since that's what's usually required
	var _rng = __webpack_require__(8);

	// Maps for number <-> hex string conversion
	var _byteToHex = [];
	var _hexToByte = {};
	for (var i = 0; i < 256; i++) {
	  _byteToHex[i] = (i + 0x100).toString(16).substr(1);
	  _hexToByte[_byteToHex[i]] = i;
	}

	// **`parse()` - Parse a UUID into it's component bytes**
	function parse(s, buf, offset) {
	  var i = (buf && offset) || 0, ii = 0;

	  buf = buf || [];
	  s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
	    if (ii < 16) { // Don't overflow!
	      buf[i + ii++] = _hexToByte[oct];
	    }
	  });

	  // Zero out remaining bytes if string was short
	  while (ii < 16) {
	    buf[i + ii++] = 0;
	  }

	  return buf;
	}

	// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
	function unparse(buf, offset) {
	  var i = offset || 0, bth = _byteToHex;
	  return  bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]];
	}

	// **`v1()` - Generate time-based UUID**
	//
	// Inspired by https://github.com/LiosK/UUID.js
	// and http://docs.python.org/library/uuid.html

	// random #'s we need to init node and clockseq
	var _seedBytes = _rng();

	// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
	var _nodeId = [
	  _seedBytes[0] | 0x01,
	  _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
	];

	// Per 4.2.2, randomize (14 bit) clockseq
	var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

	// Previous uuid creation time
	var _lastMSecs = 0, _lastNSecs = 0;

	// See https://github.com/broofa/node-uuid for API details
	function v1(options, buf, offset) {
	  var i = buf && offset || 0;
	  var b = buf || [];

	  options = options || {};

	  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

	  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
	  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
	  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
	  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
	  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

	  // Per 4.2.1.2, use count of uuid's generated during the current clock
	  // cycle to simulate higher resolution clock
	  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

	  // Time since last uuid creation (in msecs)
	  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

	  // Per 4.2.1.2, Bump clockseq on clock regression
	  if (dt < 0 && options.clockseq === undefined) {
	    clockseq = clockseq + 1 & 0x3fff;
	  }

	  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
	  // time interval
	  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
	    nsecs = 0;
	  }

	  // Per 4.2.1.2 Throw error if too many uuids are requested
	  if (nsecs >= 10000) {
	    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
	  }

	  _lastMSecs = msecs;
	  _lastNSecs = nsecs;
	  _clockseq = clockseq;

	  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
	  msecs += 12219292800000;

	  // `time_low`
	  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
	  b[i++] = tl >>> 24 & 0xff;
	  b[i++] = tl >>> 16 & 0xff;
	  b[i++] = tl >>> 8 & 0xff;
	  b[i++] = tl & 0xff;

	  // `time_mid`
	  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
	  b[i++] = tmh >>> 8 & 0xff;
	  b[i++] = tmh & 0xff;

	  // `time_high_and_version`
	  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
	  b[i++] = tmh >>> 16 & 0xff;

	  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
	  b[i++] = clockseq >>> 8 | 0x80;

	  // `clock_seq_low`
	  b[i++] = clockseq & 0xff;

	  // `node`
	  var node = options.node || _nodeId;
	  for (var n = 0; n < 6; n++) {
	    b[i + n] = node[n];
	  }

	  return buf ? buf : unparse(b);
	}

	// **`v4()` - Generate random UUID**

	// See https://github.com/broofa/node-uuid for API details
	function v4(options, buf, offset) {
	  // Deprecated - 'format' argument, as supported in v1.2
	  var i = buf && offset || 0;

	  if (typeof(options) == 'string') {
	    buf = options == 'binary' ? new Array(16) : null;
	    options = null;
	  }
	  options = options || {};

	  var rnds = options.random || (options.rng || _rng)();

	  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	  rnds[6] = (rnds[6] & 0x0f) | 0x40;
	  rnds[8] = (rnds[8] & 0x3f) | 0x80;

	  // Copy bytes to buffer, if provided
	  if (buf) {
	    for (var ii = 0; ii < 16; ii++) {
	      buf[i + ii] = rnds[ii];
	    }
	  }

	  return buf || unparse(rnds);
	}

	// Export public API
	var uuid = v4;
	uuid.v1 = v1;
	uuid.v4 = v4;
	uuid.parse = parse;
	uuid.unparse = unparse;

	module.exports = uuid;


/***/ },
/* 8 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {
	var rng;

	var crypto = global.crypto || global.msCrypto; // for IE 11
	if (crypto && crypto.getRandomValues) {
	  // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
	  // Moderately fast, high quality
	  var _rnds8 = new Uint8Array(16);
	  rng = function whatwgRNG() {
	    crypto.getRandomValues(_rnds8);
	    return _rnds8;
	  };
	}

	if (!rng) {
	  // Math.random()-based (RNG)
	  //
	  // If all else fails, use Math.random().  It's fast, but is of unspecified
	  // quality.
	  var  _rnds = new Array(16);
	  rng = function() {
	    for (var i = 0, r; i < 16; i++) {
	      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
	      _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
	    }

	    return _rnds;
	  };
	}

	module.exports = rng;


	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }
/******/ ])
});
;