var mongo = require('mongoskin');
var db = mongo.db('localhost:27017/curation');
var db_oep2 = mongo.db('http://133.164.60.235:27017/OEP2');
var HOST = "http://10.167.228.170:9090";
var HOST_PORT="9090";
var SOLR_HOST = "133.164.60.235";
var SOLR_PORT = "8080";
var FACEBOOK_APP_ID = "416376311716114";
var FACEBOOK_APP_SECRET = "e9a3b2a7df86bc779093fe3349e4ce5a";
var TWITTER_CONSUMER_KEY = "TPcUBn8nigLD7kkpajQL3A";
var TWITTER_CONSUMER_SECRET = "MwVnd90780U6wzyFq4Z18ygBmNLiSEfaT4MktwHnkBE";
var BING_KEY = "xXZmf6wh4iQPEpMAiHPKCh5nHfpkkFqGajHOMAHgA5Q=";
exports.db = db;
exports.db_oep2 = db_oep2;
exports.host = HOST;
exports.host_port = HOST_PORT;
exports.solr_host = SOLR_HOST;
exports.solr_port = SOLR_PORT;
exports.facebook_app_id = FACEBOOK_APP_ID;
exports.facebook_app_secret = FACEBOOK_APP_SECRET;
exports.twitter_consumer_key = TWITTER_CONSUMER_KEY;
exports.twitter_consumer_secret = TWITTER_CONSUMER_SECRET;
exports.bing_key = BING_KEY;