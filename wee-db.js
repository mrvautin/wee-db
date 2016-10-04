var _ = require('lodash');
var uuid = require('uuid');

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
