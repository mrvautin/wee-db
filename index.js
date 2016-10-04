var low = require('lowdb');
var index = require('./wee-db');

module.exports = function weeDB(source){
    return index(low(source));
};
