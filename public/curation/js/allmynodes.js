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
window.App = new AppView();
start();

function start(){
	$("#byUpdateAjaxLoader").show();
	$("#byViewsAjaxLoader").show();
	$("#byBookmarksAjaxLoader").show();		
	initData(1,10);
}

function initData(pageIndex,numPerPage){
	getByUpdatetimeData((pageIndex-1)*numPerPage,numPerPage);
	getByViewsData((pageIndex-1)*numPerPage,numPerPage);
	getByBookmarkData((pageIndex-1)*numPerPage,numPerPage);
	$.ajax( {
		type: 'GET',
		url: apiURL + "/count/nodes/"+$("#nodeAuthor").html(),
		data:{ "isSelf":$("#isSelf").html() },
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
		$(".pagination ul").append("<li class='prev "+prevActive+"'><a onclick='initData("+(pageIndex-1)+","+numPerPage+")'>Prev</a></li>");
	}
	for(var i=0;i<10;i++){
		if(index*10+i+1 > Math.ceil(count/numPerPage)) { break; }
		if((index*10+i+1) == pageIndex){
			$(".pagination ul").append("<li class='active'><a onclick='initData("+(i+1)+","+numPerPage+")'>"+(index*10+i+1)+"</a></li>");
		}else{
			$(".pagination ul").append("<li><a onclick='initData("+(i+1)+","+numPerPage+")'>"+(index*10+i+1)+"</a></li>");
		}
	}
	if(nextActive == "disabled"){
		$(".pagination ul").append("<li class='next "+nextActive+"'><a onclick=''>Next</a></li>");
	}else{
		$(".pagination ul").append("<li class='next "+nextActive+"'><a onclick='initData("+(pageIndex+1)+","+numPerPage+")'>Next</a></li>");
	}
}

function getByUpdatetimeData(start,rows){
	$.ajax( {
		type: 'GET',
		url: apiURL + "/nodes/user/"+$("#nodeAuthor").html()+"/sort/updateDate/start/"+start+"/rows/" + rows,
		data:{ "isSelf":$("#isSelf").html() },
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
		url: apiURL + "/nodes/user/"+$("#nodeAuthor").html()+"/sort/view_total/start/"+start+"/rows/" + rows,
		data:{ "isSelf":$("#isSelf").html() },
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
		url: apiURL + "/nodes/user/"+$("#nodeAuthor").html()+"/sort/bookmark_num/start/"+start+"/rows/" + rows,
		data:{ "isSelf":$("#isSelf").html() },
		success: function(data) {
			ByBookmarksNodes.reset(data);
		},
		dataType: "json",
		async: false,
		complete: function(jqHXR, status ) {
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
		success: function(data) {		
        },
        dataType: "json",
        async: false,
        complete: function(jqHXR, status ) {
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