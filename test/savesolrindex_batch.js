var express = require('express')
  , config = require("./config/config.js")
  , querystring = require('querystring')
  , async = require('async')
  , http = require('http')
  , solr = require('solr');
var db = config.db;
var serverURL=config.host;
var solrSrvHost=config.solr_host;
var solrSrvPort=config.solr_port;
db.collection('curation_node').find().toArray(function(err, nodes){
	if(nodes.length>0){
		async.map(nodes,function(node,callback){
			var post_data = getPostData(node);
			createSolrIndex(post_data,callback);
		},function(err, Nodes){
			exit();
		});		
	}else{
		exit();
	}
});

function createSolrIndex(post_data,callback){
	var post_options = {
		host: solrSrvHost,
		port: solrSrvPort,
		path: '/solr/update/json?commit=true',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	};
	var req_data = "";
	var post_req = http.request(post_options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {	
			req_data += chunk;
			callback(null,null) 
		});
		res.on('end', function() {
			console.log("=============start=============");
			console.log(post_data);
			console.log('==Response==: ' + req_data);
			console.log("==============end==============");
		});
	});
	post_req.on('error', function(e) {
		console.log("Got error: " + e.message);
	});
	post_req.write(post_data);
	post_req.end();
}
function getPostData(node){
	var jsonData = [{}];
	jsonData[0].id = node._id;
	jsonData[0].type = "curation_node";
	jsonData[0].author = node.username;
	jsonData[0].uri = serverURL+ "/nodes/" + node._id;
	jsonData[0].title = node.title;
	jsonData[0].content = node.content;
	jsonData[0].category = node.category;
	jsonData[0].updatedDate = node.updateDate;
	jsonData[0].publishedDate = node.publishedDate;
	jsonData[0].privacy = node.privacy;
	jsonData[0].thumbnail = node.thumbnail;
	jsonData[0].fullcontent = node.fullcontent ;
	return JSON.stringify(jsonData); //.replace("\'","\\\'");
}