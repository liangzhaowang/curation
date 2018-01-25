var configSingleton = function () {
    //private variables
    var HOST = "http://10.167.228.170:9090";
    var SOLR_HOST = "http://133.164.60.235:8080";
    var SOLR_INSTANCE = "/solr";	
	var API_VERSION = "/api/1";
	var EMBEDLY_KEY = "08fe38aab69511e1b9d24040aae4d8c9";
	var SOLR_API = "http://133.164.60.100:8080/solr/browse?fq=type:video&wt=json";
	var YOUTUBE_API = "https://gdata.youtube.com/feeds/api/videos?q=@key&alt=json-in-script&start-index=@start&max-results=@iCPP&callback=@callback@orderby";
	var TWITTER_API = "http://search.twitter.com/search.json";
	var YAHOO_API = "http://search.twitter.com/search.json";
	var FLICKR_API = "http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=83178e53b8e975df6e3eb87b0bfde300&format=json&sort=relevance";
	var BING_API = "https://api.datamarket.azure.com/Data.ashx/Bing/Search/v1/@type?Query=%27@key%27&$skip=@skip&$top=@top&$format=json";
	
	var SOLR_VIDEOSEARCH_URL = "http://133.164.60.235:8080/solr/browse";
	var NODE_THUMNAIL_DEFAULT = "/curation/img/node_default.jpg";
	
    return {
        get_HOST: function () {
            return HOST;
        },
        get_SOLR_HOST: function () {
            return SOLR_HOST;
        },
        get_SOLR_INSTANCE: function () {
            return SOLR_INSTANCE;
        },
		get_SOLR_URL: function(){
			return SOLR_HOST + SOLR_INSTANCE;
		},
		get_API_URL: function(){
			return HOST + API_VERSION;
		},
		get_EMBEDLY_KEY: function(){
			return EMBEDLY_KEY;
		},
		get_SOLR_API: function(){
			return SOLR_API;
		},
		get_YOUTUBE_API: function(){
			return YOUTUBE_API;
		},
		get_TWITTER_API: function(){
			return TWITTER_API;
		},
		get_YAHOO_API: function(){
			return YAHOO_API;
		},
		get_FLICKR_API: function(){
			return FLICKR_API;
		},
		get_BING_API: function(){
			return BING_API;
		},
		get_SOLR_VIDEOSEARCH_URL: function(){
			return SOLR_VIDEOSEARCH_URL;
		},
		get_NODE_THUMNAIL_DEFAULT: function(){
			return NODE_THUMNAIL_DEFAULT;
		}
    }
}