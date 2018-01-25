var mongo = require('mongoskin');
var db = mongo.db('localhost:27017/curation');
var ObjectID = db.db.bson_serializer.ObjectID;

console.log("=========start============");
console.log(db);
console.log("--------------------------");
console.log(ObjectID);
console.log("==========end=============");