var express = require('express')
  , passport = require('passport')
  , async = require('async')
  , LocalStrategy = require('passport-local').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy
  , config = require("./config/config.js")
  , request = require('request')
  , readability = require('node-readability')
  , util= require('util')
  , https = require("https")
  , querystring = require('querystring')
  , http = require('http');
var db = config.db;
var db_oep2 = config.db_oep2;
var ObjectID = db.db.bson_serializer.ObjectID;
var serverURL=config.host;
var solrSrvHost=config.solr_host;
var solrSrvPort=config.solr_port;
var FACEBOOK_APP_ID = config.facebook_app_id;
var FACEBOOK_APP_SECRET = config.facebook_app_secret;
var TWITTER_CONSUMER_KEY = config.twitter_consumer_key;
var TWITTER_CONSUMER_SECRET = config.twitter_consumer_secret;
var BING_KEY = config.bing_key;
var searchCon = "privacy:public";

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    process.nextTick(function () {
      findByUsernameOrEmail(username, function(err, user) {
	  console.log(user);
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unkown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
		user.exist = true;
        return done(null, user);
      })
    });
  }
));
passport.use(new FacebookStrategy({
		clientID: FACEBOOK_APP_ID,
		clientSecret: FACEBOOK_APP_SECRET,
		callbackURL: serverURL+"/auth/facebook/callback"
	},
	function(accessToken, refreshToken, profile, done) {
		process.nextTick(function () {
			async.waterfall([
				function(callback){
					findByProvideId(profile.id,profile.provider,callback);
				},
				function(user,callback){					
					if(user){
						user.exist = true;
						return done(null, user);
					}else{
						return done(null, profile);
					}
				}
			]);
		});
	}
));
passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: serverURL+"/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    process.nextTick(function () {
		async.waterfall([
			function(callback){
				findByProvideId(String(profile.id),profile.provider,callback);
			},
			function(user,callback){
				if(user){
					user.exist = true;
					return done(null, user);
				}else{
					return done(null, profile);
				}
			}
		]);
    });
  }
));

var app = express.createServer();

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.register('.html', require('ejs'));
	app.use(express.logger());
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.session({ secret: 'keyboard cat' }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
	res.render('index',{user:req.user});
});
app.get('/users/:username/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});
app.get('/users/:username',function(req, res){
	var user = {};
	if(req.isAuthenticated() && req.params.username == req.user.username){
		user = req.user;
		user.nodeAuthor = req.params.username;
		user.isSelf = "true";
	}
	else if(req.isAuthenticated()){
		user = req.user;
		user.nodeAuthor = req.params.username;
		user.isSelf = "false";
	}else{
		user.username = "publicuser";
		user.nodeAuthor = req.params.username;
		user.isSelf = "false";		
	}
	res.render('userhome',{ user: user });
});
app.get('/nodes/:nodeid', function(req, res){
	res.render('multipleshow',{nodetype:"normal", user:req.user,nodeid:req.params.nodeid});
});
app.get('/nodes/unlisted/:unlistedcode', function(req, res){
	res.render('multipleshow',{nodetype:"unlisted", user:req.user,nodeid:req.params.nodeid});
});
app.get('/createnode', ensureAuthenticated,function(req, res){
	res.render('multipleshow',{nodetype:"normal", user:req.user,nodeid:"newid"});
});
app.get('/users/:username/tags', function(req, res){
	var user = req.user;
	user.isPublic = "false";
	res.render('alltags',{user:req.user});
});
app.get('/users/:username/nodes', function(req, res){
	var user = {};
	if(req.isAuthenticated() && req.params.username == req.user.username){
		user = req.user;
		user.nodeAuthor = req.params.username;
		user.isSelf = "true";
	}
	else if(req.isAuthenticated()){
		user = req.user;
		user.nodeAuthor = req.params.username;
		user.isSelf = "false";
	}else{
		user.username = "publicuser";
		user.nodeAuthor = req.params.username;
		user.isSelf = "false";		
	}
    res.render('allmynodes', { user: user, message: req.flash('error') });
});
app.get('/users/:username/bookmarks', function(req, res){
	var user = {};
	if(req.isAuthenticated() && req.params.username == req.user.username){
		user = req.user;
		user.nodeAuthor = req.params.username;
		user.isSelf = "true";
	}
	else if(req.isAuthenticated()){
		user = req.user;
		user.nodeAuthor = req.params.username;
		user.isSelf = "false";
	}else{
		user.username = "publicuser";
		user.nodeAuthor = req.params.username;
		user.isSelf = "false";		
	}
    res.render('allmybookmarks', { user: user, message: req.flash('error') });
});
app.get('/nodes', function(req, res){
	var user = req.user;
	if(user){
		user.isPublic = "true";
	}
    res.render('allpublicnodes', { user: user });
});
app.get('/node/:nodeid/bookmarks', function(req, res){
	var user = req.user;
    res.render('bookmarkrecords', { user:user,nodeid:req.params.nodeid });
});
app.get('/tags', function(req, res){
	var user = req.user;
	if(user){
		user.isPublic = "true";
	}
    res.render('alltags', { user: user });
});
app.get('/solrData', function(req, res){
	searchCon = req.param('fq','privacy:public');
	var mltCon = "";	
	if(req.param('mlt','')!=""){
		mltCon = "&mlt=" + req.param('mlt','');
	}
	res.redirect('/searchpage?q=' + req.param('q','') + mltCon);
});

app.get('/jumpToSearchPage', ensureAuthenticated,function(req, res){
    res.render('searchDataPage', { user:req.user,condition: { 'privacy' : 'oerPrivacy'}});
});

app.get('/searchpage', function(req, res){
	var user = req.isAuthenticated() ? req.user:{username:"publicuser"};
    res.render('solrData', { user: user, condition: { 'privacy' : searchCon }});
});
app.get('/searchpage/mlt/:nodeid', function(req, res){
	var user = req.isAuthenticated() ? req.user:{username:"publicuser"};
    res.render('solrData', { user: user, condition: { 'privacy' : 'privacy:public', 'mlt' : 'true', 'nodeid':req.params.nodeid }});
});
app.get('/searchpage/tag/:tagName', function(req, res){
	var user = req.isAuthenticated() ? req.user:{username:"publicuser"};
    res.render('solrData', { user: user, condition: { 'privacy' : 'privacy:public', 'tag' : req.params.tagName }});
});
app.get('/searchpage/username/:username/tag/:tagName', function(req, res){
	var user = req.isAuthenticated() ? req.user:{username:"publicuser"};
    res.render('solrData', { user: user, condition: { 'privacy' : 'author:' + req.params.username, 'tag' : req.params.tagName }});
});

/////////////////////login or logout///////////////
app.get('/login', function(req, res){
    res.render('login', { user: req.user, message: req.flash('error') });
});
app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), function(req, res) {
    res.redirect('/users/'+req.user.username);
});

app.get('/auth/twitter', function(req, res){
	action = "login";
	res.redirect("/auth/twitter/login");
});
app.get('/auth/facebook', function(req, res){
	action = "login";
	res.redirect("/auth/facebook/login");
});

app.get('/signup/twitter', function(req, res){
	action = "signup";
	res.redirect("/auth/twitter/login");
});
app.get('/signup/facebook', function(req, res){
	action = "signup";
	res.redirect("/auth/facebook/login");
});

app.get('/auth/twitter/login', passport.authenticate('twitter'), function(req, res){
});
app.get('/auth/facebook/login', passport.authenticate('facebook'), function(req, res){
});

app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
	if(req.user.exist){
		res.redirect('/users/'+req.user.username);		
	}else{
		if(action == "login"){
			res.redirect("/signup");
		}else{
			res.redirect("/signupwithother");
		}
	}
});
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), function(req, res) {
	if(req.user.exist){
		res.redirect('/users/'+req.user.username);
	}else{
		if(action == "login"){
			res.redirect("/signup");
		}else{
			res.redirect("/signupwithother");
		}
	}
});


app.get('/signup/facebook', passport.authenticate('facebook'), function(req, res){
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});
app.get('/signup', function(req, res){
    res.render('signup', { user: req.user, message: req.flash('error') });
});
app.get('/signupwithother', function(req, res){
	var user = req.user;
	user.signup=true;
    res.render('signupwithother', { user:user });
});
app.get('/resetpssword', function(req, res){
    res.render('resetpssword', { user: req.user, message: req.flash('error') });
});
/////////////////////login or logout///////////////
app.post('/api/1/nodes',function(req,res){
	if(!req.isAuthenticated()){
		res.send({"error":"not login"});
		return;
	}
	async.waterfall([
		function(callback){
			createNode(req.body.data,req.body.toptitle,req.body.content,req.body.category,req.body.privacy,req.body.thumbnail,req.body.fullcontent,req.user,callback);
		},
		function(newnode,callback){
			createSolrIndex(newnode,callback)
		},
		function(newnode,callback){
			res.send(newnode);
		}
	]);
});
app.put('/api/1/nodes',function(req,res){
	if(!req.isAuthenticated()){
		res.send({"error":"not login"});
		return;
	}
	async.waterfall([
		function(callback){
			editNode(req.body.id,req.body,callback);
		},
		function(nodeid,callback){
			getNodeDataById(nodeid,callback);
		},
		function(newnode,callback){
			createSolrIndex(newnode,callback)
		},
		function(newnode,callback){
			res.json({status:1, msg: 'success'});
		}
	]);
});
app.post('/api/1/register',function(req,res){
	async.waterfall([
		function(callback){
			signup(JSON.parse(req.body.data),callback);
		},
		function(callback){
			res.send(JSON.parse(req.body.data));
		}
	]);
});
app.post('/api/1/checkEmail',function(req,res){
	async.waterfall([
		function(callback){			
			findByEmail(req.body.data,callback);
		},
		function(user,callback){			
			res.send(user);		
		}
	]);
});
app.post('/api/1/checkName',function(req,res){
	async.waterfall([
		function(callback){			
			findByUsername(req.body.data,callback);
		},
		function(user,callback){			
			res.send(user);		
		}
	]);
});
app.post('/api/1/view',function(req,res){
	var nodeid=req.body.id,userid="",username="";	
	var author=req.body.author;
	if(req.isAuthenticated()){
		if(req.user.username == author) { res.send(null); return; }		
		userid=req.user._id;
		username=req.user.username;
	}
	async.waterfall([
		function(callback){			
			IncreaseView(nodeid,userid,username,callback);
		},
		function(callback){
			res.json({status:1, msg: 'success'});
		}
	]);
});
app.post('/api/1/bookmark',function(req,res){
	if(!req.user){ res.send(null); return; }	
	var nodeid=req.body.nodeid;
	var action=req.body.action;
	async.waterfall([
		function(callback){			
			switchBookmark(nodeid,req.user._id,req.user.username,action,callback);
		},
		function(callback){
			res.json({status:1, msg: 'success'});
		}
	]);
});

app.post('/api/1/bufferItem',function(req,res){
    async.waterfall([
        function(callback){
            bufferItemData(req.body.source,req.body.href,req.user,callback);
        },
        function(callback){
            res.json({msg: 'success'});
        }
    ]);
});

app.delete('/api/1/nodes/:nodeid',function(req,res){
	if(!req.user){ return; }
	async.parallel([
		function(callback){
			deleteNodeById(req.params.nodeid,callback);
		},
		function(callback){
			deleteNodeIndexById(req.params.nodeid,callback);
		}],
	function(nodeid,callback){
		res.json({status:1, msg: 'success'});
	});
});
app.delete('/api/1/bookmark/:nodeid',function(req,res){
	if(!req.user){ return; }
	async.waterfall([
		function(callback){			
			deleteBookmarkByNodeIdUserId(req.params.nodeid,req.user._id,callback);
		},
		function(callback){
			res.json({status:1, msg: 'success'});
		}
	]);
});

app.delete('/api/1/bufferItem',function(req,res){
    if(!req.user){ return; }
    var bufferId = req.body.id;
    async.waterfall([
        function(callback){         
            deleteItemBufferById(bufferId,callback);
        },
        function(callback){
            res.json({status:1, msg: 'success'});
        }
    ]);
});

app.get('/api/1/username/:provider/:providerid',function(req,res){
	async.waterfall([
		function(callback){
			findByProvideId(req.params.providerid,req.params.provider,callback);
		},
		function(user,callback){
			if(user){
				res.send(user);
			}else{
				res.send(null);
			}
		}
	]);
});
app.get('/api/1/users/:username/nodes/:nodeid',function(req,res){
	if (req.isAuthenticated() && req.user.username == req.params.username) {
		async.waterfall([
			function(callback){
				getNodeDataById(req.params.nodeid,callback);
			},
			function(node,callback){
				res.send(node);
			}
		]);
	}else{
		res.send(null);
	}
});
app.get('/api/1/nodes/sort/:sort/start/:start/rows/:rows',function(req,res){
	var sort = "updateDate", start=0, rows=0;
	if(req.params.sort){
		sort = req.params.sort;		
	}
	if(req.params.start){
		start = req.params.start;
	}
	if(req.params.rows){
		rows = req.params.rows;
	}
	
	async.waterfall([
		function(callback){
			getNodes(sort,start,rows,callback);
		},
		function(node,callback){
			res.send(node);
		}
	]);
});
app.get('/api/1/nodes/user/:username/sort/:sort/start/:start/rows/:rows',function(req,res){
	var sort = "updateDate", start=0, rows=0;
	if(req.params.sort){
		sort = req.params.sort;		
	}
	if(req.params.start){
		start = req.params.start;
	}
	if(req.params.rows){
		rows = req.params.rows;
	}

	async.waterfall([
		function(callback){
			getUserNodes(req.params.username,sort,start,rows,req.query.isSelf,callback);
		},
		function(node,callback){
			res.send(node);
		}
	]);
});
app.get('/api/1/nodes/bookmark/user/:username/start/:start/rows/:rows',function(req,res){
	var start=0, rows=0;
	if(req.params.start){
		start = req.params.start;
	}
	if(req.params.rows){
		rows = req.params.rows;
	}
	var username = "publicuser";
	if(req.isAuthenticated()){
		username=req.user.username;
	}
	async.waterfall([
		function(callback){
			getBookmarkNodes(username,req.params.username,start,rows,callback);
		},
		function(node,callback){
			res.send(node);
		}
	]);
});
app.get('/api/1/node/:nodeid/bookmark/start/:start/rows/:rows',function(req,res){
	var nodeid="",start=0, rows=0;
	if(req.params.nodeid){
		nodeid = req.params.nodeid;
	}
	if(req.params.start){
		start = req.params.start;
	}
	if(req.params.rows){
		rows = req.params.rows;
	}
	async.waterfall([
		function(callback){
			getBookmarkRecords(nodeid,start,rows,callback);
		},
		function(bookmarks,callback){
			res.send(bookmarks);
		}
	]);
});
app.get('/api/1/node/:nodeid',function(req,res){
	async.waterfall([
		function(callback){
			getPublicNodeDataById(req.params.nodeid,callback);
		},
		function(node,callback){
			res.send(node);
		}
	]);
});

app.get('/api/1/nodeType',function(req,res){
    async.waterfall([
        function(callback){
            getNodeTypeById(req.query.nodeid,callback);
        },
        function(node,callback){
            res.send(node);
        }
    ]);
});

app.get('/api/1/node/unlisted/:unlistedcode',function(req,res){
	async.waterfall([
		function(callback){
			getunlistedNodeDataByCode(req.params.unlistedcode,callback);
		},
		function(node,callback){
			res.send(node);
		}
	]);
});
app.get('/api/1/count/nodes/:username',function(req,res){
	async.waterfall([
		function(callback){
			getCountOfUserNodes(req.params.username,req.query.isSelf,callback);
		},
		function(num,callback){
			res.send({"numCount":num});
		}
	]);
});
app.get('/api/1/count/bookmarks/:username',function(req,res){
	async.waterfall([
		function(callback){
			getCountOfUserBookmarks(req.params.username,callback);
		},
		function(num,callback){
			res.send({"numCount":num});
		}
	]);
});

app.get('/api/1/bookmark/:nodeid',function(req,res){
    async.waterfall([
        function(callback){
            getBookmark(req.params.nodeid,req.user._id,callback);
        },
        function(bookmark,callback){
            res.send(bookmark);
        }
    ]);	
});
app.get('/api/1/authorstat/count',function(req,res){
	async.waterfall([
        function(callback){
			db_oep2.collection('author_stat').count({},function(err,num){
				return callback(null,num);
			});
        },
        function(num,callback){
            res.send({'num':num});
        }
    ]);	
});
app.get('/api/1/authorstat/start/:start/rows/:rows',function(req,res){
	var start = req.params.start;
	var rows = req.params.rows;
	async.waterfall([
        function(callback){
		db_oep2.collection('author_stat').find({},{"author" : 1, "total_num" : 1, "video_num" : 1,"playlist_num" : 1,"course_num" : 1,"lecturenote_num" : 1},{"skip":start,"limit":rows, "sort":[['total_num', -1]]}).toArray(function(err,authorStat){
				if(authorStat.length>0){
					return callback(null,authorStat);
				}else{
					return callback(null,null);
				}
			});
        },
        function(authorStat,callback){
            res.send(authorStat);
        }
    ]);	
});
app.get('/api/1/updatedDateStat/days/:days',function(req,res){
	var days = req.params.days;
	var condition = {limit:days,sort:[['updated_date', -1]]};
	if(days==0){
		condition = {sort:[['updated_date', -1]]};
	}
	async.waterfall([
        function(callback){
			db_oep2.collection('updated_date_stat').find({},condition).toArray(function(err,updatedDateStat){
				if(updatedDateStat && updatedDateStat.length>0){
					return callback(null,updatedDateStat);
				}else{
					return callback(null,null);
				}
			});
        },
        function(updatedDateStat,callback){
            res.send(updatedDateStat);
        }
    ]);	
});
app.get('/api/1/getContentByURL',function(req,res){
	var url = req.query.url;
	try{
		readability.read(url, function(err, article) {
			if(!article){ res.send(null); return; } 
			res.send({"title":article.getTitle(),"content":article.getContent()});
		});
	}catch(e){
		res.send(null);
	}
});
app.get('/api/1/searchFromBing',function(req,res){
	try{
		var path = req.query.path;
		https_options = {
			"host": "api.datamarket.azure.com",
			"path": path,
			"port": 443,
			"headers": {
				"Authorization": "Basic " + new Buffer(BING_KEY + ":" + BING_KEY, "utf8").toString("base64")
			}
		};
		request = https.get(https_options, function(respon) {
			respon.on('data', function(d) {
				res.send(d);
			});
		}).on('error', function(e) {
			res.send(null);
		});

	}catch(e){
		res.send(null);
	}
});
app.post('/api/1/saveNotesForPage',function(req,res){
	try{
	console.log(req.user);
		db.collection('notes4page').insert({ "userid":req.user._id,"pageurl":req.body.pageurl,"text":req.body.text }, function(err,item){
			res.send(item);
		});
	}catch(e){
		res.send(null);
	}
});
app.get('/api/1/getNotesByUrl',function(req,res){
	try{
		db.collection('notes4page').find({ "userid":req.user._id,"pageurl":req.query.pageurl}).toArray(function(err,item){
			res.send(item);
		});
	}catch(e){
		res.send(null);
	}
});

app.get('/api/1/showUserBuffer',function(req,res){
    var start = req.query.page;
    var pageSize = req.query.pageSize;
    async.waterfall([
        function(callback){
            db.collection('bufferItem').find({user_id:req.user._id},{"skip":start,"limit":pageSize}).toArray(function(err,bufferItems){
               if(bufferItems.length>0){
                    return callback(null,bufferItems);
                }else{
                    return callback(null,null);
                }
          });
        },
        function(bufferItems,callback){
            res.send(bufferItems);
        }
    ]); 
});


app.get('/api/1/userBuffer/count',function(req,res){
    async.waterfall([
        function(callback){
            db.collection('bufferItem').count({},function(err,num){
                return callback(null,num);
            });
        },
        function(num,callback){
            res.send({'num':num});
        }
    ]); 
});

app.get('/api/1/bufferItem',function(req,res){
    var href = req.query.href;
    var userId = req.user._id;
    async.waterfall([
        function(callback){
            getItemBufferByHref(href,userId,callback);
        },
        function(bufferItem,callback){
            res.send(bufferItem);
        }
    ]);
});
//////////////////

app.listen(config.host_port);
console.log("Server running at " + serverURL); 
process.on('uncaughtException', function (err) {
	console.error('uncaughtException:', err.message)
	console.error(err.stack)
	process.exit(1)
});
  

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
function findByUsername(username, callback) {
	db.collection('user').find({'username':username}).toArray(function(err, user){
		if(user && user.length>0){
			return callback(null, user[0]);
		}
		return callback(null, null);
	});
}
function findByUsernameOrEmail(username, callback) {
	db.collection('user').find({$or:[{'email':username},{'username':username}]}).toArray(function(err, user){
		if(user && user.length>0){
			return callback(null, user[0]);
		}
		return callback(null, null);
	});
}
function findByProvideId(id,provider, callback) {
	db.collection('user').find({'provider_id':id,'provider':provider}).toArray(function(err, user){
		if(user && user.length>0){
			return callback(null, user[0]);
		}
		return callback(null, null);
	});
}

///////////////database Operate function//////////////////
function signup(user,callback){
	db.collection('user').insert({
		"username":user.username,"provider":user.provider,"provider_id":user.provider_id,
		"displayName":user.displayname,"email":user.email,"password":user.password,"photo":user.photo},function(err){		
		return callback(null);
	});
}

function bufferItemData(source,href,user,callback){
    db.collection('bufferItem').insert({
        user_id:user._id,username:user.username,source:source,href:href},function(err){       
        return callback(null);
    });
}
function findByEmail(email, fn) { 
	db.collection('user').find({'email':email}).toArray(function(err, user){
		if(user && user.length>0){
			return fn(null, user[0]);
		}
		return fn(null, null);		
	});
}

function getNodeListByUserName(username,callback){
	db.collection('curation_node').find({'author':username},{"username":1, "title":1, "content":1, "category":1, "node_data":1, "thumbnail":1, "fullcontent":1, "privacy":1, "updateDate":1,"bookmark_num":1,"view_total":1,"comments":1,"comment_num":1}).toArray(function(err, nodes){
		if(nodes && nodes.length>0){
			return callback(null,nodes);
		}
		return callback(null,null);
	});
}
function getNodeDataById(nodeid,callback){
	db.collection('curation_node').find({'_id':ObjectID.createFromHexString(nodeid)},{"username":1, "title":1, "content":1, "category":1, "node_data":1, "thumbnail":1, "fullcontent":1, "privacy":1, "updateDate":1,"bookmark_num":1,"view_total":1,"comments":1,"comment_num":1}).toArray(function(err, node){
		if(node  && node.length>0){
			return callback(null,node[0]);
		}
		return callback(null,null);
	});
}
function getNodes(sort,start,rows,callback){
	db.collection('curation_node').find({'privacy':'public'}, {"username":1, "title":1, "content":1, "category":1, "node_data":1, "thumbnail":1, "fullcontent":1, "privacy":1, "updateDate":1,"bookmark_num":1,"view_total":1,"comments":1,"comment_num":1},{"skip": start,"limit": rows,"sort": [[sort,-1]]}).toArray(function(err, nodes){
		if(nodes && nodes.length>0){
			return callback(null,nodes);			
		}
		return callback(null,null);
	});
}
function getUserNodes(username,sort,start,rows,isSelf,callback){
	var condition = { 'username':username };
	if(isSelf=="false"){
		condition.privacy="public";
	}

	db.collection('curation_node').find(condition,{"username":1, "title":1, "content":1, "category":1, "node_data":1, "thumbnail":1, "fullcontent":1, "privacy":1, "updateDate":1,"bookmark_num":1,"view_total":1,"comments":1,"comment_num":1},{"skip": start,"limit": rows,"sort": [[sort,-1]]}).toArray(function(err, nodes){
		if(nodes && nodes.length>0){
			return callback(null,nodes);
		}
		return callback(null,null);
	});
}
function getPublicNodeDataById(nodeid,callback){
	db.collection('curation_node').find({'_id':ObjectID.createFromHexString(nodeid),'privacy':'public'},{"username":1, "title":1, "content":1, "category":1, "node_data":1, "thumbnail":1, "fullcontent":1, "privacy":1, "updateDate":1,"bookmark_num":1,"view_total":1,"comments":1,"comment_num":1}).toArray(function(err, node){
		if(node && node.length>0){
			return callback(null,node[0]);
		}
		return callback(null,null);
	});
}

function getNodeTypeById(nodeid,callback){
    db.collection('curation_node').find({'_id':ObjectID.createFromHexString(nodeid)},{}).toArray(function(err, node){
        if(node && node.length>0){
            return callback(null,node[0]);
        }
        return callback(null,null);
    });
}

function getunlistedNodeDataByCode(unlistedcode,callback){
	db.collection('curation_node').find({'_id':ObjectID.createFromHexString(unlistedcode),'privacy':'unlisted'},{"username":1, "title":1, "content":1, "category":1, "node_data":1, "thumbnail":1, "fullcontent":1, "privacy":1, "updateDate":1,"bookmark_num":1,"view_total":1, "_id" :1,"comments":1,"comment_num":1}).toArray(function(err, node){
		if(!node.length>0){
			return callback(null,null);
		}
		return callback(null,node[0]);
	});
}
function getCountOfUserNodes(username,isSelf,callback){
	var condition = username == "public" ? {} :  {'username':username};
	if(isSelf=="false"){
		condition.privacy="public";
	}

	db.collection('curation_node').count(condition,function(err, num){
		return callback(null,num);
	});
}
function getCountOfUserBookmarks(username,callback){
	db.collection('bookmark').count({'username':username},function(err, num){
		return callback(null,num);
	});
}
function createNode(nodedata,toptitle,content,category,privacy,thumbnail,fullcontent,user,callback){
	var nodeid = db.collection('curation_node').insert({
		user_id:user._id,username:user.username,title:toptitle,content:content,category:category,node_data:JSON.parse(nodedata),
		thumbnail:thumbnail,fullcontent:fullcontent,privacy:privacy,updateDate:new Date(),publishedDate:new Date(),
		bookmark_num:0, view_today:0,view_lastweek:0,view_lastmonth:0,view_total:0},function(err,newnode){

		return callback(null,newnode[0]);
	});	
}
function createSolrIndex(newnode,callback){			
	var jsonData = [{}];
	var annotationsText = "";
	for(var nodeObj in newnode.node_data.flexEmbeds){
		for(var annotationsObj in newnode.node_data.flexEmbeds[nodeObj].annotations){
			annotationsText += newnode.node_data.flexEmbeds[nodeObj].annotations[annotationsObj].notes + " ";
		}
	}
	console.log(annotationsText);
	jsonData[0].id = newnode._id;
	jsonData[0].type = "curation_node";
	jsonData[0].author = newnode.username;
	jsonData[0].uri = serverURL+ "/nodes/" + newnode._id;
	jsonData[0].title = newnode.title;
	jsonData[0].content = newnode.content;
	jsonData[0].category = newnode.category;
	jsonData[0].updatedDate = newnode.updateDate;
	jsonData[0].publishedDate = newnode.publishedDate;
	jsonData[0].privacy = newnode.privacy;
	jsonData[0].thumbnail = newnode.thumbnail;
    jsonData[0].fullcontent = newnode.fullcontent + annotationsText;

	var post_data = JSON.stringify(jsonData);
	var req_data = "";
	var post_options = {
		host: solrSrvHost,
		port: solrSrvPort,
		path: '/solr/update/json?commit=true',
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json'
		}
	};
	var post_req = http.request(post_options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			req_data += chunk;
		});
		res.on('end', function (chunk) {
			return callback(null,newnode);
		});
	});
	post_req.on('error', function(e) {
		console.log("Got error: " + e.message);
	});
	post_req.write(post_data);
	post_req.end();
}
function editNode(nodeid,data,callback){
	delete data.id;
	if(!data.comments){
		data.updateDate=new Date();
	}	
	if(data.node_data){
		data.node_data = JSON.parse(data.node_data);
	}
	
	db.collection('curation_node').update({'_id':ObjectID.createFromHexString(nodeid)},{$set:data},{upsert:false},function(err){
		return callback(null,nodeid);
	});
}
function deleteNodeById(nodeid,callback){
	db.collection('curation_node').remove({_id:ObjectID.createFromHexString(nodeid)},function(err){
		db.collection('bookmark').remove({curation_node_id:nodeid},function(err){
			db.collection('view_log').remove({curation_node_id:nodeid},function(err){
				return callback(null);
			});
		});
	});
}
function deleteNodeIndexById(nodeid,callback){
	var node_data = {"delete": { "id":nodeid }};
	var options = {
		uri: solrSrvHost + ":" + solrSrvPort +'/solr/update/json?commit=true',
		method: 'POST',
		body: JSON.stringify(node_data)
	};
	try	{
		request(options, function (error, response, body) {
			console.log("errr: "+response.statusCode);
			console.log(error);
			console.log(response);
			console.log(body);
			if (!error && response.statusCode == 200) {
				return callback(null,nodeid); 
			}
		});
	}catch(e){
		console.log(e);
		return callback(null,nodeid); 
	}	
}
function deleteBookmarkByNodeIdUserId(nodeid,userid,callback){
	db.collection('bookmark').remove({curation_node_id:nodeid,user_id:userid},function(err){
		return callback(null);
	});
}

function deleteItemBufferById(bufferId,callback){
    db.collection('bufferItem').remove({'_id':ObjectID.createFromHexString(bufferId)},function(err){
        return callback(null);
    });
}

function switchBookmark(nodeid,userid,username,action,callback){
	if(action == "1"){
		db.collection('bookmark').insert({curation_node_id:nodeid,user_id:userid,username:username,datetime:new Date()},function(err){
			db.collection('curation_node').update({'_id':ObjectID.createFromHexString(nodeid)},{$inc:{bookmark_num:1}},function(err){
				return callback(null);
			});
		});
	}else{
		db.collection('bookmark').remove({curation_node_id:nodeid,user_id:userid},function(err){
			db.collection('curation_node').update({'_id':ObjectID.createFromHexString(nodeid)},{$inc:{bookmark_num:-1}},function(err){
				return callback(null);
			});
		});
	}
}
function IncreaseView(nodeid,userid,username,callback){
	db.collection('view_log').insert({curation_node_id:nodeid,user_id:userid,username:username,datetime:new Date()},function(err){
		db.collection('curation_node').update({'_id':ObjectID.createFromHexString(nodeid)},{$inc:{view_total:1}},function(err){
			return callback(null);
		});
	});
}
function getBookmarkNodes(username,author,start,rows,callback){	
	db.collection('bookmark').find({'username':author}, { skip:start,limit:rows,sort:[['datetime', -1]]}).toArray(function(err, bookmarks){
		if(bookmarks.length>0){
			async.map(bookmarks,function(bookmark,callback){
				var con = {'_id':ObjectID.createFromHexString(bookmark.curation_node_id)};
				if(username != author){
					con.privacy = "public";
				}
				db.collection('curation_node').find(con,{"username":1, "title":1, "content":1, "category":1, "node_data":1, "thumbnail":1, "fullcontent":1, "privacy":1, "updateDate":1,"bookmark_num":1,"view_total":1,"comments":1,"comment_num":1}).toArray(function(err, bookmarkNode){
					if(bookmarkNode.length>0){
						bookmarkNode[0].bookmarkDate = bookmark.datetime;
						callback(null,bookmarkNode[0]);
					}else{
						callback(null,null);
					}
				});
				
			},function(err, Nodes){
				return callback(null,Nodes);
			});		
		}else{
			return callback(null,null);
		}
	});
}

function getItemBufferByHref(href,userId,callback){
    console.log(href);
    db.collection('bufferItem').find({'href':href,'user_id':userId}).toArray(function(err, itemBuffer){
        if(!itemBuffer.length>0){
            return callback(null,null);
        }
        return callback(null,itemBuffer[0]);
    });
}

function getBookmark(nodeid,userid,callback){
	db.collection('bookmark').find({curation_node_id:nodeid,user_id:userid}).toArray(function(err,bookmark){
		if(bookmark.length>0){
			return callback(null,bookmark);
		}else{
			return callback(null,null);
		}
	});
}

function getBookmarkRecords(nodeid,start,rows,callback) {
	db.collection('bookmark').find({curation_node_id:nodeid},{ skip:start,limit:rows,sort:[['datetime', -1]]}).toArray(function(err, bookmarks){
		if(bookmarks && bookmarks.length>0){
			return callback(null, bookmarks);
		}
		return callback(null, null);
	});
}
//////////////////////database Operate function////////////////////