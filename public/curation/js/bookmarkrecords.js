var bookmarkCount = 0;
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
window.Node = new NodeList();
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
window.NodeView = Backbone.View.extend({
	tagName:  "tr",
	template : _.template($('#tpl-node').html()),
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
		Node.bind('reset', this.addNode, this);
	},
	addBookmarkNodes : function(node){
		$("#bookmarkAjaxLoader").hide();
		$("#bookmarknodes").html($("#tpl-thBookmark").html());
		BookmarkNodes.each(function(node){
			var view = new BookmarkListView({model:node});
			$("#bookmarknodes").append(view.render().el);
		});
	},
	addNode : function(node){
		Node.each(function(node){
			var view = new NodeView({model:node});
			$("#bookmarkNode").append(view.render().el);
		});
	}
});
window.App = new AppView();
start()

function start(){
	$("#bookmarkAjaxLoader").show();
	bookmarkrecord(1,10);
}

function bookmarkrecord(pageIndex,numPerPage){
	$.ajax( {
        type: 'GET',
		url: apiURL + "/node/" + $("#nodeid").html(),	
        success: function(data) {
			console.log(data);
			Node.reset(data);
			console.log(Node);
			bookmarkCount = parseInt(data.bookmark_num);
			createPagenationStr(bookmarkCount,numPerPage,pageIndex)
			getBookmark(pageIndex,numPerPage);
        },
        dataType: "json",
        async: false,
        complete: function(jqHXR, status ) {
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
		$(".pagination ul").append("<li class='prev "+prevActive+"'><a onclick='getBookmark("+(pageIndex-1)+","+numPerPage+")'>Prev</a></li>");
	}
	for(var i=0;i<10;i++){
		if(index*10+i+1 > Math.ceil(count/numPerPage)) { break; }
		if((index*10+i+1) == pageIndex){
			$(".pagination ul").append("<li class='active'><a onclick='getBookmark("+(index*10+i+1)+","+numPerPage+")'>"+(index*10+i+1)+"</a></li>");
		}else{
			$(".pagination ul").append("<li><a onclick='getBookmark("+(index*10+i+1)+","+numPerPage+")'>"+(index*10+i+1)+"</a></li>");
		}
	}
	if(nextActive == "disabled"){
		$(".pagination ul").append("<li class='next "+nextActive+"'><a onclick=''>Next</a></li>");
	}else{
		$(".pagination ul").append("<li class='next "+nextActive+"'><a onclick='getBookmark("+(pageIndex+1)+","+numPerPage+")'>Next</a></li>");
	}
}
function getBookmark(pageIndex,numPerPage){
	var start = (pageIndex-1)*numPerPage;
	var end = start + numPerPage;
	$.ajax({
		type: 'GET',
		url: apiURL + "/node/"+$("#nodeid").html()+"/bookmark/start/" +start+ "/rows/" + numPerPage, 
		success: function(data) {
			BookmarkNodes.reset(data);			
		},
		dataType: "json",
		async: false,
		complete: function(jqHXR, status ) {
		}
	});	
}