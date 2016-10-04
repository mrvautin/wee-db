var expect = require('chai').expect;
var uuid = require('uuid');
var wee_db = require('../index');
var db = wee_db('test/test-db.json');

// remove everything to start
db.remove('blog', {});

describe('Database Insert', function(){
    describe('Sync Insert - With ID', function(){
        var randomID = uuid();
        it('Should insert a document with supplying own ID', function(){
            var data = db.insert('blog', {id: randomID, title: 'A title', body: 'Some body'});
            expect(data.count).to.be.at.least(1);
            expect(data.documents[0].body).to.equal('Some body');
            expect(data.documents[0].id).to.equal(randomID);
        });
    });

    describe('Async Insert - With ID', function(){
        it('Should insert a document even if doesn\'t exist', function(){
            var randomID = uuid();
            db.insert('blog', {id: randomID, title: 'A title', body: 'Some body'}, function(err, data){
                if(err){
                    expect(err).to.be.null;
                    return;
                }
                expect(data.count).to.be.at.least(1);
                expect(data.documents[0].body).to.equal('Some body');
                expect(data.documents[0].id).to.equal(randomID);
            });
        });
    });

    describe('Sync Insert - With duplicated ID', function(){
        it('Should return ID supplied is a duplicate', function(){
            // insert doc
            db.insert('blog', {body: 'Duplicate ID', id: 1234});

            // insert doc again
            var data = db.insert('blog', {body: 'Some body', id: 1234});
            expect(data.count).to.equal(0);
            expect(data.documents.length).to.equal(0);
        });
    });

    describe('Sync Insert - Without ID', function(){
        it('Should insert a document and auto generate ID', function(){
            var data = db.insert('blog', {body: 'Some body'});
            expect(data.count).to.be.at.least(1);
            expect(data.documents[0].body).to.equal('Some body');
        });
    });

    describe('Async Insert - Without ID', function(){
        it('Should insert a document and auto generate ID', function(){
            db.insert('blog', {body: 'Some body'}, function(err, data){
                if(err){
                    expect(err).to.be.null;
                    return;
                }
                expect(data.count).to.be.at.least(1);
                expect(data.documents[0].body).to.equal('Some body');
            });
        });
    });

    describe('Async Insert - With ID', function(){
        it('Should return error: Duplicate "id" key found', function(){
            var randomID = uuid();
            db.insert('blog', {id: randomID, title: 'A title'}, function(err, data){
                db.insert('blog', {id: randomID, title: 'A title'}, function(err, data){
                    expect(err).to.equal('Duplicate "id" key found');
                });
            });
        });
    });
});

describe('Database Upsert', function(){
    describe('Sync Upsert', function(){
        var randomID = uuid();
        it('Should insert a document even if doesn\'t exist', function(){
            var data = db.upsert('blog', {title: randomID}, {body: 'Some body'});
            expect(data.count).to.be.at.least(1);
            expect(data.documents[0].body).to.equal('Some body');
            expect(data.documents[0].title).to.equal(randomID);
        });
    });

    describe('Async Upsert', function(){
        it('Should insert a document even if doesn\'t exist', function(){
            var randomID = uuid();
            db.upsert('blog', {title: randomID}, {body: 'Some body'}, function(err, data){
                if(err){
                    expect(err).to.be.null;
                    return;
                }
                expect(data.count).to.be.at.least(1);
                expect(data.documents[0].body).to.equal('Some body');
                expect(data.documents[0].title).to.equal(randomID);
            });
        });
    });

    describe('Sync Upsert - Supply ID', function(){
        it('Should return error if ID field is supplied on an upsert', function(){
            expect(testThrow).to.throw('Cannot update ID field');
        });

        function testThrow(){
            db.upsert('blog', {body: 'Some body'}, {id: '1234'});
        }
    });
});

describe('Database Updates', function(){
    describe('Sync Update', function(){
        it('Should update at least one document', function(){
            var data = db.update('blog', {body: 'Some body'}, {body: 'Some body1'});
            expect(data.count).to.be.at.least(1);
            expect(data.documents[0].body).to.equal('Some body1');
        });
    });

    describe('Async Update', function(){
        it('Should return at least one document', function(){
            db.update('blog', {body: 'Some body1'}, {body: 'Some body2'}, function(err, data){
                if(err){
                    expect(err).to.be.null;
                    return;
                }
                expect(data.count).to.be.at.least(1);
                expect(data.documents[0].body).to.equal('Some body2');
            });
        });
    });

    describe('Sync Update - Supply ID', function(){
        it('Should return error if ID field is supplied on an update', function(){
            expect(testThrow).to.throw('Cannot update ID field');
        });

        function testThrow(){
            db.update('blog', {body: 'Some body'}, {id: '1234'});
        }
    });
});

describe('Database Finds', function(){
    describe('Sync find', function(){
        it('Should return at least one document', function(){
            var data = db.find('blog', {body: 'Some body2'});
            expect(data.count).to.be.at.least(1);
        });
    });

    describe('Sync find - No records', function(){
        it('Should return at least one document', function(){
            var data = db.find('blog', {body: 'Some body which should not be found when running this "find"'});
            expect(data.count).to.equal(0);
        });
    });

    describe('Async find', function(){
        it('Should return at least one document', function(){
            db.find('blog', {body: 'Some body2'}, function(err, data){
                if(err){
                    expect(err).to.be.null;
                    return;
                }
                expect(data.count).to.be.at.least(1);
            });
        });
    });

    describe('lowdb find', function(){
        it('Should return at least one document', function(){
            var data = db._find('blog')
            .filter({title: 'A title'})
            .take(5)
            .value();

            expect(data.length).to.be.at.least(1);
        });
    });
});

describe('Database Insert/Find/Remove', function(){
    var randomID = uuid();

    describe('Sync Insert', function(){
        it('Should insert a document', function(){
            var data = db.insert('blog', {title: randomID, body: 'Some body'});
            expect(data.count).to.be.at.least(1);
            expect(data.documents[0].body).to.equal('Some body');
            expect(data.documents[0].title).to.equal(randomID);
        });
    });

    describe('Sync Update', function(){
        it('Should update document inserted before', function(){
            var data = db.update('blog', {title: randomID}, {body: 'Some body2'});
            expect(data.count).to.equal(1);
            expect(data.documents[0].title).to.equal(randomID);
            expect(data.documents[0].body).to.equal('Some body2');
        });
    });

    describe('Sync Find', function(){
        it('Should return document inserted before', function(){
            var data = db.findOne('blog', {title: randomID});
            expect(data.count).to.equal(1);
            expect(data.documents.title).to.equal(randomID);
        });
    });

    describe('Sync Remove', function(){
        it('Should remove document inserted before', function(){
            var data = db.remove('blog', {title: randomID});
            expect(data.count).to.equal(1);
        });
    });

   describe('Sync Remove', function(){
        it('Should find 6 documents', function(){
            var data = db.find('blog', {body: 'Some body2'});
            expect(data.count).to.equal(6);
        });
    });
});
