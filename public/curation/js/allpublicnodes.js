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
	}
});

$(document).ready(function(){
	window.App = new AppView();
	start();
});

function start(){
	$("#byUpdateAjaxLoader").show();
	$("#byViewsAjaxLoader").show();
	$("#byBookmarksAjaxLoader").show();
	initPublicNodeData(1,10);
}

function initPublicNodeData(pageIndex,numPerPage){
	getByUpdatetimeData((pageIndex-1)*numPerPage,numPerPage);
	getByViewsData((pageIndex-1)*numPerPage,numPerPage);
	getByBookmarkData((pageIndex-1)*numPerPage,numPerPage);
	$.ajax( {
		type: 'GET',
		url: apiURL + "/count/nodes/public",
		data: {"isSelf":"false"},
		dataType: "json",
		success: function(data) {
			$("#nodeCount").html(data.numCount);
			createPagenationStr(data.numCount,numPerPage,pageIndex);
			if(data.numCount == 0){	
				$("#Pagination_Search").html("");
				return;
			}				
		}
	}); 
}

function createPagenationStr(count,numPerPage,pageIndex){
	$(".pagination").html("");
	$(".pagination").append("<ul></ul>");
	var index = Math.ceil(pageIndex/10) -1;
	var prevActive = pageIndex>1 ? "":"disabled";
	var nextActive = pageIndex<Math.ceil(count/numPerPage) ? "":"disabled";			
	if(prevActive == "disabled"){
		$(".pagination ul").append("<li class='prev "+prevActive+"'><a onclick=''>Prev</a></li>");
	}else{
		$(".pagination ul").append("<li class='prev "+prevActive+"'><a onclick='initPublicNodeData("+(pageIndex-1)+","+numPerPage+")'>Prev</a></li>");
	}
	for(var i=0;i<10;i++){
		if(index*10+i+1 > Math.ceil(count/numPerPage)) { break; }
		if((index*10+i+1) == pageIndex){
			$(".pagination ul").append("<li class='active'><a onclick='initPublicNodeData("+(index*10+i+1)+","+numPerPage+")'>"+(index*10+i+1)+"</a></li>");
		}else{
			$(".pagination ul").append("<li><a onclick='initPublicNodeData("+(index*10+i+1)+","+numPerPage+")'>"+(index*10+i+1)+"</a></li>");
		}
	}
	if(nextActive == "disabled"){
		$(".pagination ul").append("<li class='next "+nextActive+"'><a onclick=''>Next</a></li>");
	}else{
		$(".pagination ul").append("<li class='next "+nextActive+"'><a onclick='initPublicNodeData("+(pageIndex+1)+","+numPerPage+")'>Next</a></li>");
	}
}

function getByUpdatetimeData(start,rows){
	$.ajax( {
        type: 'GET',
		url: apiURL + "/nodes/sort/updateDate/start/"+start+"/rows/" + rows,
        success: function(data) {
			LatestNodes.reset(data);			
        },
        dataType: "json",
        async: false,
        complete: function(jqHXR, status ) {
        }
    });
}
function getByViewsData(start,rows){
	$.ajax( {
        type: 'GET',
		url: apiURL + "/nodes/sort/view_total/start/"+start+"/rows/" + rows,
        success: function(data) {
			ByViewsNodes.reset(data);			
        },
        dataType: "json",
        async: false,
        complete: function(jqHXR, status ) {
        }
    });
}
function getByBookmarkData(start,rows){
	$.ajax( {
        type: 'GET',
		url: apiURL + "/nodes/sort/bookmark_num/start/"+start+"/rows/" + rows,
        success: function(data) {
			ByBookmarksNodes.reset(data);			
        },
        dataType: "json",
        async: false,
        complete: function(jqHXR, status ) {
        }
    });
}

function customPagination(page,hasNex,iCPP){
	var pagePrev = page - 1;
	var pageNext = page + 1;
	$("#Pagination_Search").html($("#tpl-pageNation").html().replace(/@pagePrev/g,pagePrev).replace(/@pageNext/g,pageNext).replace(/@iCPP/g,iCPP));
	$("#Pagination_Search").find(".currentIndex").html(page);
	if(page==1){	
		$("#Pagination_Search").find(".prevlink").hide();
		$("#Pagination_Search").find(".prevspan").show();		
	}else{		
		$("#Pagination_Search").find(".prevlink").show();
		$("#Pagination_Search").find(".prevspan").hide();
	}
	if(hasNex){
		$("#Pagination_Search").find(".nextspan").hide();
		$("#Pagination_Search").find(".nextlink").show();			
	}else{
		$("#Pagination_Search").find(".nextspan").show();
		$("#Pagination_Search").find(".nextlink").hide();
	}
}