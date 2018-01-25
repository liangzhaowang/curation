window.Node = Backbone.Model.extend({
	defaults: function() {
		return {
			title:	"",
			author:	"",
			updatedate:	"",
			view:	0
		};
	}
});
window.NodeList = Backbone.Collection.extend({
	model:	Node,
	localStorage:new Store()
});
window.LatestNodes = new NodeList();
window.ByViewsNodes = new NodeList();
window.ByBookmarksNodes = new NodeList();
window.BookmarkNodes = new NodeList();
window.NodeListView = Backbone.View.extend({
	tagName:  "tr",
	template : _.template($('#tpl-nodelist').html()),
	events : {
	},
	initialize : function(){
		this.model.bind('change', this.render, this);
	},
	render: function() {	
		$(this.el).html(this.template(this.model.toJSON())); 
		return this;
	}
});
window.BookmarkListView = Backbone.View.extend({
	tagName:  "tr",
	template : _.template($('#tpl-bookmarklist').html()),
	events : {
	},
	initialize : function(){
		this.model.bind('change', this.render, this);
	},
	render: function() {	
		$(this.el).html(this.template(this.model.toJSON())); 
		return this;
	}
});
window.AppView = Backbone.View.extend({
	events : {
	},
	initialize: function() {
		LatestNodes.bind('reset', this.addLatestNodes, this);
		ByViewsNodes.bind('reset', this.addByViewsNodes, this);
		ByBookmarksNodes.bind('reset', this.addByBookmarksNodes, this);
		BookmarkNodes.bind('reset', this.addBookmarkNodes, this);
	},
	addLatestNodes : function(node){
		$("#byUpdateAjaxLoader").hide();
		$("#latestnodes").html("");
		LatestNodes.each(function(node){
			var view = new NodeListView({model:node});
			$("#latestnodes").append(view.render().el);
		});
	},
	addByViewsNodes : function(node){
		$("#byViewsAjaxLoader").hide();
		$("#byviewsnodes").html("");
		ByViewsNodes.each(function(node){
			var view = new NodeListView({model:node});
			$("#byviewsnodes").append(view.render().el);
		});
	},
	addByBookmarksNodes : function(node){
		$("#byBookmarksAjaxLoader").hide();
		$("#bybookmarksnodes").html("");
		ByBookmarksNodes.each(function(node){
			var view = new NodeListView({model:node});
			$("#bybookmarksnodes").append(view.render().el);
		});
	},
	addBookmarkNodes : function(node){
		$("#bookmarkAjaxLoader").hide();
		$("#bookmarknodes").html("");
		BookmarkNodes.each(function(node){
			var view = new BookmarkListView({model:node});
			$("#bookmarknodes").append(view.render().el);
		});
	}
});
window.App = new AppView();
$(".userhome").addClass("active");
start()

function start(){
	$("#byUpdateAjaxLoader").show();
	$("#byViewsAjaxLoader").show();
	$("#byBookmarksAjaxLoader").show();	
	$("#bookmarkAjaxLoader").show();
	var isSelf=$("#isSelf").html();
	$.ajax( {
		type: 'GET',
		url: apiURL + "/count/nodes/"+$("#nodeAuthor").html(),
		data:{ "isSelf":$("#isSelf").html() },
		dataType: "json",
		success: function(data) {
			$("#nodeCount").html(data.numCount);
		}
	});
	$.ajax( {
		type: 'GET',
		url: apiURL + "/count/bookmarks/"+$("#nodeAuthor").html(),
		dataType: "json",
		success: function(data) {
			$("#bookmarksCount").html(data.numCount);
		}
	});
	$.ajax( {
		type: 'GET',
		url: apiURL + "/nodes/user/"+$("#nodeAuthor").html()+"/sort/updateDate/start/0/rows/10",
		data:{ "isSelf":$("#isSelf").html() },
		dataType: "json",
		success: function(data) {
			LatestNodes.reset(data); 
		}
	}); 	
	$.ajax( {
		type: 'GET',
		url: apiURL + "/nodes/user/"+$("#nodeAuthor").html()+"/sort/view_total/start/0/rows/10",
		data:{ "isSelf":$("#isSelf").html() },
		dataType: "json",
		success: function(data) {
			ByViewsNodes.reset(data); 
		}
	}); 
	$.ajax( {
		type: 'GET',
		url: apiURL + "/nodes/user/"+$("#nodeAuthor").html()+"/sort/bookmark_num/start/0/rows/10",
		data:{ "isSelf":$("#isSelf").html() },
		dataType: "json",
		success: function(data) {
			ByBookmarksNodes.reset(data); 
		}
	}); 
	$.ajax( {
		type: 'GET',
		url: apiURL + "/nodes/bookmark/user/"+$("#nodeAuthor").html()+"/start/0/rows/10",
		data:{ isSelf:$("#isSelf").html() },
		dataType: "json",
		success: function(data) {
			BookmarkNodes.reset(data); 
		}
	});	
}

function switchPrivacy(obj){
	var privacy = $(obj).attr("value");
	$(obj).siblings("button").removeClass("active").attr("disabled",false);
	$(obj).addClass("active").attr("disabled",true);
	$.ajax({
		type: 'PUT',
		url: apiURL + "/nodes",
		data: { "id":$(obj).parent().attr("id"),"privacy":privacy },
		dataType: "json",
		success: function(data) {		
        }
    });
}
function deleteNode(nodeid){
	if(!confirm("Are you sure to delete the node?")){
		return;
	}
	$.ajax({
		type: 'DELETE',
		url: apiURL + "/nodes/" + nodeid,
		success: function(data) {
			location.reload();
        },
        dataType: "json",
        async: false,
        complete: function(jqHXR, status ) {
        }
    });
}
function removeBookmark(nodeid){
	$.ajax({
		type: 'DELETE',
		url: apiURL + "/bookmark/" + nodeid,
		success: function(data) {	
			location.reload();
        },
        dataType: "json",
        async: false,
        complete: function(jqHXR, status ) {
        }
    });	
}