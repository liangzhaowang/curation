var key = "czaxnET2UJx3XLMRrxBfkHql9utvaitcj8w9F4ewbg8=",
 secret = "czaxnET2UJx3XLMRrxBfkHql9utvaitcj8w9F4ewbg8=",
https = require("https"),
https_options = {
	"host": "api.datamarket.azure.com",
	"path": "https://api.datamarket.azure.com/Data.ashx/Bing/Search/v1/Image?Query=\u0027Ye%20Shiwen\u0027&$skip=10&$top=1&$format=json",
	"port": 443,
	"headers": {
		"Authorization": "Basic " + new Buffer(key + ":" + secret, "utf8").toString("base64")
	}
};
request = https.get(https_options, function(res) {
	res.on('data', function(d) {
		process.stdout.write(d);
	});
}).on('error', function(e) {
	console.error(e);
});
