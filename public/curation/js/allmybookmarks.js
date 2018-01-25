window.Node = Backbone.Model.extend({
	defaults: function() {
		return {
		};
	}
});
window.NodeList = Backbone.Collection.extend({
	model:	Node,
	localStorage:new Store()
});
window.BookmarkNodes = new NodeList();
window.BookmarkListView = Backbone.View.extend({
	tagName:  "tr",
	template : _.template($('#tpl-bookmarklist').html()),
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
		BookmarkNodes.bind('reset', this.addBookmarkNodes, this);
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
start();

function start(){
	$("#bookmarkAjaxLoader").show();
	initBookMarkData(1,10);
}

function initBookMarkData(pageIndex,numPerPage){
	getBookmarkData((pageIndex-1)*numPerPage,numPerPage);
	var pageDiv = "";		
	$.ajax( {
		type: 'GET',
		url: apiURL + "/count/bookmarks/"+$("#nodeAuthor").html(),
		dataType: "json",
		success: function(data) {
			$("#bookmarksCount").html(data.numCount);
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
		$(".pagination ul").append("<li class='prev "+prevActive+"'><a onclick='initBookMarkData("+(pageIndex-1)+","+numPerPage+")'>Prev</a></li>");
	}
	for(var i=0;i<10;i++){
		if(index*10+i+1 > Math.ceil(count/numPerPage)) { break; }
		if((index*10+i+1) == pageIndex){
			$(".pagination ul").append("<li class='active'><a onclick='initBookMarkData("+(index*10+i+1)+","+numPerPage+")'>"+(index*10+i+1)+"</a></li>");
		}else{
			$(".pagination ul").append("<li><a onclick='initBookMarkData("+(index*10+i+1)+","+numPerPage+")'>"+(index*10+i+1)+"</a></li>");
		}
	}
	if(nextActive == "disabled"){
		$(".pagination ul").append("<li class='next "+nextActive+"'><a onclick=''>Next</a></li>");
	}else{
		$(".pagination ul").append("<li class='next "+nextActive+"'><a onclick='initBookMarkData("+(pageIndex+1)+","+numPerPage+")'>Next</a></li>");
	}
}

function getBookmarkData(start,rows){
	$.ajax( {
		type: 'GET',
		url: apiURL + "/nodes/bookmark/user/"+$("#nodeAuthor").html()+"/start/" +start+ "/rows/" + rows, 
		success: function(data) {
			BookmarkNodes.reset(data); 
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