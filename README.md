# wee-db

`wee-db` is a 'wee' and simple embedded JSON database built on [lowdb](https://github.com/typicode/lowdb) with some traditional query benefits/syntax. `wee-db` is perfect
for projects which require a small, simple and embedded database without the over head of a full database.

## Features

`wee-db` has the following functionality:

- Insert documents (Allows for auto generate ID's)
- Update documents
- Upsert documents
- Find documents
- FindOne document
- Remove documents
- Simple lodash ([lowdb](https://github.com/typicode/lowdb)) syntax
- Runs in Node.js and in the browser

## Quick start

### Install

#### Node.js

```
npm install wee-db --save
```

Your script can then use `wee-db` by:

``` javascript
var wee_db = require('wee-db');
var db = wee_db('my-db.json');
```

This will create a DB file called `my-db.json` in the same directory as your calling script. 

#### In the browser

Running in the browser uses localStorage. It's as simple as:

``` html
<html>
    <head>
        <script src="https://unpkg.com/lodash@4/lodash.min.js"></script>
        <script src="dist/wee-db.min.js"></script>
        <script>
            var db = wee_db('db');
            db.insert('blog', {title: 'wee_db'}); 
            console.log(db.find('blog', {title: 'wee_db'}));
        </script>
    </head>
</html>
```

Note: You need to ensure you include `lodash` before `wee-db`.

**Check your browser console for the output**

### Interacting with your DB

You can query your DB using a Sync call or by using an Async callback. See `test/test.js` and examples for more info. You can choose to separate your DB into separate files
by creating individual `wee-db` instances or you can use `collections` and keep it all in one single DB file.

All queries take a `collection` as the first parameter and depending on the type of query, the other parameters will vary. See examples.

All queries will return an object with a `count` of documents which matched the criteria and a `documents` array (except `findOne` which returns an Object) containing
the matched document.

An example returned Object:

``` javascript
{ 
    count: 1,
    documents:
        [ 
            { 
                id: 'a8bcb689-52b3-42e9-8f9f-6913c974322e',
                title: 'A title',
                body: 'Some body' 
            } 
        ] 
}
```

### Inserting documents

Inserting a document into the `blog` collection and auto generate a ID is as simple as:

``` javascript
var data = db.insert('blog', {body: 'Some body'});
console.log(data);
```

Inserting a document with your own ID:

``` javascript
var random_id = '123456789';
var data = db.insert('blog', {id: random_id, body: 'Some body'});
console.log(data);
```

### Updating documents

Updates take 3 parameters. The first being the `collection`, the second being the `query` for which documents you are intending to update and the third is 
the `values` you wish to update.

Updating a document is a simple as:

``` javascript
var myid = '123456789';
var data = db.update('blog', {id: myid}, {body: "Some body - Updated"});
console.log(data);
```

### Upserting documents

Upserting will update a document if it matches the `query` criteria or insert that document if one is not found. 

Upserts take 3 parameters. The first being the `collection`, the second being the `query` for which documents you are intending to update and the third is 
the `values` you wish to update.

Updating a document is a simple as:

``` javascript
var data = db.upsert('blog', {title: "This will not be found"}, {body: "Some body"});
console.log(data);
```

### Find documents

Finding documents takes 2 parameters. The first is the `collection` followed by the `query`. 

The following `query` will check the `blog` collection and match all documents which have a `body` which is equal to `Some body data`.

``` javascript
var data = db.find('blog', {body: 'Some body data'});
console.log(data);
```

The query above will return an object with a count and an array of match documents.

### FindOne documents

Finding documents takes 2 parameters. The first is the `collection` followed by the `query`. 

The following `query` will check the `blog` collection and return the first matched document which has a `body` which is equal to `Some body data`.

``` javascript
var data = db.findOne('blog', {body: 'Some body data'});
console.log(data);
```

The query above will return an object with a count and an Object with the matched document.

### lowdb Find

`wee-db` is built on [lowdb](https://github.com/typicode/lowdb) and allows for the use and easy of finding documents based on the [lowdb](https://github.com/typicode/lowdb) syntax

``` javascript            
var data = db._find('blog')
    .filter({title: 'A title'})
    .take(5)
    .value();
console.log(data);
```

See the [lowdb](https://github.com/typicode/lowdb) documentation for more examples: [https://github.com/typicode/lowdb](https://github.com/typicode/lowdb)

### Document ID's

ID's are required for all documents. If and `id` value is supplied in the updating document it will be used provided there is not another document with that same ID.
If the document doesn't supply an `id` value, one will be generated when the insert is done.

### Tests

Tests can be performed using:

``` 
npm test
```

### Build for browser

Building can be done for the browser by running the `build` script:

``` 
npm run build
```

This will build a file for the browser using `Webpack` both normal and minified in the `dist` folder.