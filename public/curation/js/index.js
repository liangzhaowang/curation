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
window.NodeListView = Backbone.View.extend({
	tagName:  "tr",
	template : _.template($('#tpl-nodelist').html()),
	initialize : function(){
		this.model.bind('change', this.render, this);
	},
	render: function() {	
		$(this.el).html(this.template(this.model.toJSON())); 
		return this;
	}
});
window.NodeListPinView = Backbone.View.extend({
	tagName:  "li",
	template : _.template($('#tpl-nodelist-pin').html()),
	initialize : function(){
		this.model.bind('change', this.render, this);
	},
	render: function() {	
		$(this.el).html(this.template(this.model.toJSON())); 
		return this;
	}
});
window.AppView = Backbone.View.extend({
	initialize: function() {
		LatestNodes.bind('reset', this.addLatestNodes, this);
		ByViewsNodes.bind('reset', this.addByViewsNodes, this);
		ByBookmarksNodes.bind('reset', this.addByBookmarksNodes, this);
	},
	addLatestNodes : function(node){
		$("#byUpdateAjaxLoader").hide();
		$("#latestnodes").html("");
		$("#latestnodes-pin").html("");
		LatestNodes.each(function(node){
			var view = new NodeListView({model:node});
			$("#latestnodes").append(view.render().el);
		});
	},
	addByViewsNodes : function(node){
		$("#byViewsAjaxLoader").hide();
		$("#byviewsnodes").html("");
		$("#byviewsnodes-pin").html("");
		ByViewsNodes.each(function(node){
			var view = new NodeListView({model:node});
			$("#byviewsnodes").append(view.render().el);
		});
	},
	addByBookmarksNodes : function(node){
		$("#byBookmarksAjaxLoader").hide();
		$("#bybookmarknodes").html("");
		$("#bybookmarknodes-pin").html("");
		ByBookmarksNodes.each(function(node){
			var view = new NodeListView({model:node});
			$("#bybookmarknodes").append(view.render().el);
		});
	}
});
window.AppPinView = Backbone.View.extend({
	initialize: function() {
		LatestNodes.bind('reset', this.addLatestNodes, this);
		ByViewsNodes.bind('reset', this.addByViewsNodes, this);
		ByBookmarksNodes.bind('reset', this.addByBookmarksNodes, this);
	},
	addLatestNodes : function(node){
		$("#byUpdateAjaxLoader").hide();
		$("#latestnodes-pin").html("");
		$("#latestnodes").html("");
		LatestNodes.each(function(node){
			var view = new NodeListPinView({model:node});
			$("#latestnodes-pin").append(view.render().el);
		});
	},
	addByViewsNodes : function(node){
		$("#byViewsAjaxLoader").hide();
		$("#byviewsnodes-pin").html("");
		$("#byviewsnodes").html("");
		ByViewsNodes.each(function(node){
			var view = new NodeListPinView({model:node});
			$("#byviewsnodes-pin").append(view.render().el);
		});
	},
	addByBookmarksNodes : function(node){
		$("#byBookmarksAjaxLoader").hide();
		$("#bybookmarknodes-pin").html("");
		$("#bybookmarknodes").html("");
		ByBookmarksNodes.each(function(node){
			var view = new NodeListPinView({model:node});
			$("#bybookmarknodes-pin").append(view.render().el);
		});
	}
});

$(document).ready(function(){
	window.App = new AppView();
	$(".home").addClass("active");
	start();
});


function start(){
	$("#byUpdateAjaxLoader").show();
	$("#byViewsAjaxLoader").show();
	$("#byBookmarksAjaxLoader").show();	
	$.ajax( {
		type: 'GET',
		url: apiURL + "/count/nodes/public",
		data:{ "isSelf":"false" },
		dataType: "json",
		success: function(data) {
			$("#nodeCount").html(data.numCount);
		}
	});
	$.ajax( {
        type: 'GET',
		url: apiURL + "/nodes/sort/updateDate/start/0/rows/10",
        success: function(data) {
			LatestNodes.reset(data);			
        },
        dataType: "json",
        async: false,
        complete: function(jqHXR, status ) {
        }
    });
	$.ajax( {
        type: 'GET',
		url: apiURL + "/nodes/sort/view_total/start/0/rows/10",
        success: function(data) {
			ByViewsNodes.reset(data);			
        },
        dataType: "json",
        async: false,
        complete: function(jqHXR, status ) {
        }
    });
	$.ajax( {
        type: 'GET',
		url: apiURL + "/nodes/sort/bookmark_num/start/0/rows/10",
        success: function(data) {
			ByBookmarksNodes.reset(data);			
        },
        dataType: "json",
        async: false,
        complete: function(jqHXR, status ) {
        }
    });
}
function changeView(obj){
	$(obj).addClass("active");
	$(obj).attr("disabled","true");
	if($(obj).attr("value") == "list"){
		$(obj).parent().find(".grid").removeAttr("disabled");
		window.App = new AppView();
		start();
	}else{
		$(obj).parent().find(".list").removeAttr("disabled");
		window.App = new AppPinView();
		start();
		$('.masonry').masonry({
			itemSelector:'.masonry li',
			columnWidth:240
		});
	}
}