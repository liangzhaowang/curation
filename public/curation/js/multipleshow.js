var currentId = "";
var currentPageIndex=1;
var pageCount = 1;
var nodeId = "";
var showBlockCount=0;
var targetIndex = -1;
var nodeThumbnail = "";
var nodeFullContent = "";
var inputPathTitleNotice = "(Click to add the node title)";
var inputPathDescNotice = "(Click to add the node description)";
var inputContentTitleNotice = "(Click to add the content title)";
var inputContentDescriptionNotice = "(Click to add the content description)";
var hrNotice = "Please click the button or the bar to add a new item";
var sourceInputNotice = "Please input keywords or URL here...";
var htmlSourceInputNotice = 'Please input Embedded HTML soure code here, for example, there is a snippet of embedded code from a slide on scribd.com \n\n<a title="View Python Idioms on Scribd" href="http://www.scribd.com/doc/39946630/Python-Idioms" style="margin: 12px auto 6px auto; font-family: Helvetica,Arial,Sans-serif; font-style: normal; font-variant: normal; font-weight: normal; font-size: 14px; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none; display: block; text-decoration: underline;">Python Idioms</a><iframe class="scribd_iframe_embed" src="http://www.scribd.com/embeds/39946630/content?start_page=1&view_mode=slideshow&access_key=key-njjjz8kkl4wlve3joa5" data-auto-height="true" data-aspect-ratio="1.33333333333333" scrolling="no" id="doc_46012" width="100%" height="600" frameborder="0"></iframe><script type="text/javascript">(function() { var scribd = document.createElement("script"); scribd.type = "text/javascript"; scribd.async = true; scribd.src = "http://www.scribd.com/javascripts/embed_code/inject.js"; var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(scribd, s); })();</script>';
var consumer_Key_yahoo = "dj0yJmk9WlJKc09pNkZVdDNqJmQ9WVdrOVprSlpVRTVITkRJbWNHbzlORFkwTXpRMk9UWXkmcz1jb25zdW1lcnNlY3JldCZ4PTcz";
var consumer_Secret_yahoo = "55e3f45d98f0c69dcaf1760a65fe05e5f1313583";
var baseURL_yahoo = "http://yboss.yahooapis.com/ysearch/@type";
var searchIndex = 0;
var yellowBg;

//comments not use now
var commentList = new Array();


//configSingleton is defined in conf.js 
//to get config info 
var conf = configSingleton();
var solrAPI = conf.get_SOLR_API();
var youtubeAPI = conf.get_YOUTUBE_API();
var twitterAPI = conf.get_TWITTER_API();
var yahooAPI = conf.get_YAHOO_API();
var flickrAPI = conf.get_FLICKR_API();
var bingAPI = conf.get_BING_API();
var embedly_key = conf.get_EMBEDLY_KEY();
var node_default_thumnail = conf.get_NODE_THUMNAIL_DEFAULT();

//youtube player
var player;
//array for youtubeMarks collection
var allMarks = new Array();
var topNodeThumbnails = new Array();

//the model for item of node 
window.Item = Backbone.Model.extend({
	defaults: function() {
		return {
			id:				GuidGenerator(),
			order:			"",
			inputType:  	"",
			method:			"",
			text:			"",
			title: 			"",
			description:	"",
			thumbnail:		"",
			inputData:		"",
			embed:			"",
			annotations:	null
		};
	}
});


//the collection for item of node 
window.ItemList = Backbone.Collection.extend({
	model:	Item,
	localStorage:new Store()
});

window.Items = new ItemList();

//to display edit item tabs view
window.ItemView = Backbone.View.extend({
	tagName:  "div",
	template: _.template($('#tpl-item-details').html()),
	initialize : function(){
		this.model.bind('destroy', this.remove, this);
	},
	events: {
		"click .commitbtn"	: "saveItemData",
		"click .commitbtnEx"	: "saveItemDataEx",
		"click .editbtn"	: "editItemData",
		"click .deletebtn"	: "deleteItemData",
		"click .saveEditContent"	: "editYoutubeMark",
		"click .deleteYoutubeMark"	: "deleteYoutubeMark"
	},
	//fill data for item
	render: function(e) {
		$(this.el).html(this.template(this.model.toJSON())); 
		return this;
	},
	remove: function() {
		$(this.el).remove();
	},
	//the very import function,to click little ok button
	saveItemData: function(e){
		SaveItem(e.currentTarget,this.model);
	},
	saveItemDataEx: function(e){
		SaveItemEx(e.currentTarget,this.model);
	},
	//when click little edit button,to display the item edit view
	editItemData: function(e){
		$(e.currentTarget).parent().find(".oembedDiv").hide();
		$(e.currentTarget).parent().find(".editbtn").hide();
		$(e.currentTarget).parent().find(".dialog-createNew").show();
		$(e.currentTarget).parent().find(".commitbtn").show();
		$(e.currentTarget).parent().find("#showUrlDetailContent").remove();
		$(e.currentTarget).parent().find("#showUrlIframe").remove();
		$(e.currentTarget).parent().find("#changeImage").remove();
		
		var obj = this.model.toJSON();		
		if(obj.inputType=="Quiz"){
			var QuizData = JSON.parse(obj.inputData);
			var answerOption = QuizData.answerOption;
			$(e.currentTarget).parent().find("#quizQuestion").val(QuizData.question);
			for(var i=0;i<answerOption.length;i++){
				var tempObj = $(e.currentTarget).parent().find("#tbQuizOption tr").get(i);
				$(tempObj).find("input:first").val(answerOption[i].optionStr);
				if(answerOption[i].isCorrect == "true"){
					$(tempObj).find("input:last").attr("checked",true);
				}
			}
		}
	},
	//when click the X ,delete the item
	deleteItemData: function(e){
		var delIndex = getStringNumberId(e.currentTarget.id);
		var tempIndex = $("#blackBlocks .deletebtn").index($(e.currentTarget));
		this.model.destroy();
		initTopNodeThumbnail();
		$("#showHr_"+delIndex).parent().remove();
	},
	
	//when edit youtube mark,click the ok button,reset the item's youtube collection mark
	editYoutubeMark: function(e){
		var index = getStringNumberId($("#nodeIndexForMark").html());
		for(var i=0;i<allMarks.length;i++){
			if(allMarks[i][0] == index){
				this.model.attributes.annotations = allMarks[i][1].toJSON();
			}
		}		
	},
	
	//when delete youtube mark,click the X button,reset the item's youtube collection mark
	deleteYoutubeMark: function(e){
		var index = getStringNumberId($("#nodeIndexForMark").html());
		for(var i=0;i<allMarks.length;i++){
			if(allMarks[i][0] == index){
				console.log(allMarks[i][1]);
				this.model.attributes.annotations = allMarks[i][1].toJSON();
			}
		}		
	}
});

//to display edit item view,you can edit title ,description....etc
window.DisplayView = Backbone.View.extend({
	template : _.template($('#tpl-item-display').html()),
	events : {
		"blur #subTitle" : "saveTitle",
		"blur #subDescription" : "saveDesc",
		"click #addYoutubeMark" : "addYoutubeMark",
		"click #cancelAddYoutubeMark" : "cancelAddYoutubeMark"
	},
	initialize : function(){
		this.model.bind('change', this.render, this);
	},
	saveTitle: function(e){
		var obj = $(e.currentTarget).parent().parent().parent();
		var value = {};
		value.title = obj.find("#subTitle").val();
		value.fullcontent = value.title + " " + this.model.attributes.description + obj.parents(".oembedDiv").find(".DisplayBlock").text();
		this.model.save(value);
	},
	saveDesc: function(e){
		var obj = $(e.currentTarget).parent().parent().parent();
		var value = {};
		value.description =obj.find("#subDescription").val();
		value.fullcontent = this.model.attributes.title + " " + value.description + obj.parents(".oembedDiv").find(".DisplayBlock").text();
		this.model.save(value);
	},
	
	//click mark button
	addYoutubeMark: function(e){
		var obj = e.currentTarget;
		if($(obj).attr("action") == "mark"){
			var iframeId = "youtubePlayer" + $(obj).parents(".oembedDiv").attr("id").substr(9);
			
			if(!player || player.a.id != iframeId){
				$(obj).attr("disabled",true);
				$(obj).parents(".tbDisplay").find("iframe").attr("id",iframeId);
				player = new YT.Player(iframeId, {			
					events: {
						'onReady': function(event){
							$(obj).removeAttr("disabled");
							player.pauseVideo(); 
							$(obj).parent().find("#lblMarkTime").html(formatTime(player.getCurrentTime()).substr(0,8));
						}
					}
				});
			}else{
				player.pauseVideo();
				$(obj).parent().find("#lblMarkTime").html(formatTime(player.getCurrentTime()).substr(0,8));
			}	
			$(obj).attr("action","save");
			$(obj).parent().find("#cancelAddYoutubeMark").show();
			$(obj).parent().find("#nodeYoutubeMark").show();
			$(obj).parent().find("#lblMarkTime").show();
			
			$(obj).html("OK");			
		}else{
			var content = $(obj).parent().find("#nodeYoutubeMark").val();
			if(!content){
				alert("please input a mark content!");
				return;
			}
			var sec = player.getCurrentTime();
			var youtubeMark = new YoutubeMark({timestamp:sec,notes:content});
			
			var index = getStringNumberId($(e.currentTarget).parents(".oembedDiv").attr("id"));
			for(var i=0;i<allMarks.length;i++){
				if(allMarks[i][0] == index){
					allMarks[i][1].add(youtubeMark);
					this.model.attributes.annotations = allMarks[i][1].toJSON();
				}
			}
			//YoutubeMarks.add(youtubeMark);
			//this.model.attributes.annotations = YoutubeMarks.toJSON();
			var view = new YoutubeMarkView({model:youtubeMark});
			$(obj).parents(".tbDisplay").find("#youtubeMarkView").append(view.render().el);		
			$(obj).attr("action","mark");
			$(obj).html("Mark");
			$(obj).parent().find("#cancelAddYoutubeMark").hide();			
			$(obj).parent().find("#nodeYoutubeMark").hide();
			$(obj).parent().find("#lblMarkTime").hide();
			$(obj).parent().find("#nodeYoutubeMark").val("");	
			player.playVideo();
		}
	},
	cancelAddYoutubeMark: function(e){
		var obj = e.currentTarget;
		$(obj).parent().find("#addYoutubeMark").attr("action","mark");			
		$(obj).parent().find("#addYoutubeMark").html("Mark");
		$(obj).hide();			
		$(obj).parent().find("#nodeYoutubeMark").hide();
		$(obj).parent().find("#lblMarkTime").hide();
		$(obj).parent().find("#nodeYoutubeMark").val("");	
		player.playVideo();
	},
	changeThumbnail: function(e){
		var index = $(e.currentTarget).parent().parent().find('#currentIndex').html(); 
		index = eval(index)+1; 
		$(e.currentTarget).parent().parent().find('#currentIndex').html(index); 
		getCurrentPic(e.currentTarget,index);
	},
	close: function(e) {
	},
	render: function() {
		initTopNodeThumbnail();
		$(this.el).html(this.template(this.model.toJSON())); 
		$(this.el).find(".embedImage").css("max-height","200px");
		return this;
	}
});

//the item view mode,you can edit item by click big Edit Node button
window.DisplayBlockView = Backbone.View.extend({
	template : _.template($('#tpl-displayBlock').html()),
	initialize : function(){
		this.model.bind('change', this.render, this);
	},
	render: function() {
		$(this.el).html(this.template(this.model.toJSON())); 
		return this;
	}
});
window.HRView = Backbone.View.extend({
	template : _.template($('#tpl-HR').html()),
	render: function() {	
		$(this.el).html(this.template()); 
		return this;
	}
});

//the node view,to display the whole page
window.AppView = Backbone.View.extend({
	el : $("#frametab"),
	events : {
		"click #addNewItem, .hrClass" : "addNewItem",
		"click #tdDisplayDescription" : "editDesc",
		"blur #topDescription" : "close",
		"click #edit" : "showEdit"
	},
	initialize: function() {
		Items.bind('add', this.addOne, this);
		Items.bind('reset', this.addAll, this);
		Comments.bind('add', this.addOneComments, this);
		Comments.bind('reset', this.addAllComments, this);
		Array.prototype.S=String.fromCharCode(2);  
		Array.prototype.in_array=function(e){  
			var r=new RegExp(this.S+e+this.S);  
			return (r.test(this.S+this.join(this.S)+this.S));  
		};
		
		//make every item can move
		$("#blackBlocks").sortable();
		
		//when drag right video or img to left area 
		$('#blackBlocks').bind('sortreceive', function(event, ui) { 
			$(".hrClass").each(function(e){
				if(ui.offset.top - $(this).offset().top < 130 && ui.offset.top - $(this).offset().top > -130){
					$(this).click();
					$("#ShowBlock_" + showBlockCount).find("#tabsNew_" + showBlockCount + " .nav .url a").click();
					var receiveUrl = $(ui.item).find(".uri").attr("href");
					var sourceUrl = $(ui.item).find(".uri").attr("sourceUrl");
					$("#ShowBlock_" + showBlockCount).find("#resourceURL_" + showBlockCount).val(receiveUrl);
					var selected = $("#searchPanel .nav li").index($("#searchPanel .nav .active")); 
					if(selected==4){										
						var embed = $('#tpl-imageEmbed').html().replace(/#URL/g,receiveUrl).replace(/#SourceUrl/g,sourceUrl);
						var title = $(ui.item).find(".uri div").html();
						$("#ShowBlock_" + showBlockCount).find(".DisplayBlock").html(embed);
						$("#ShowBlock_" + showBlockCount).find("#subTitle").val(title);	
						$("#ShowBlock_" + showBlockCount).find("#commitbtnEx_" + showBlockCount).click();		
					}else{
						$("#ShowBlock_" + showBlockCount).find("#commitbtn_" + showBlockCount).click();
					}
					return;
				}
			});	
			$(ui.item).remove();
		});
		$('#blackBlocks').bind('sortstop', function(event, ui) { 
			if($(ui.item).find(".wysiwyg")){
				$(ui.item).find(".wysiwyg").remove();
				$(ui.item).find(".Textcontent").wysiwyg({controls:{undo:{visible:false},redo:{visible:false}} });
			}
		});
	},
	editDesc : function(e){
		$(e.currentTarget).addClass('editing').find('textarea').select();		
		if($("#trButton").css("display") == "block"){ return; }		
		var tempDesc = $("#divTopDescritionEdit").html()==inputPathDescNotice ? "" : $("#divTopDescritionEdit").html();		
		$(e.currentTarget).find("textarea").val(tempDesc);
		$("#trButton").css("display","block");
	},
	//after edit the description,when blur the textarea
	close: function(e) {
		$("#divTopDescritionEdit").html($("#topDescription").val()==""? inputPathDescNotice:$("#topDescription").val());
		$("#tdDisplayDescription").removeClass("editing");
		if($("#divTopDescritionEdit").html() == inputPathDescNotice){
			$("#divTopDescritionEdit").css("color","darkgray");
		}else{
			$("#divTopDescritionEdit").css("color","black");
		}
	},
	showEdit: function(){
		$("#searchPanel").show();
		$("#container").css("float","left");
		$("#container").css("width","750px");
		$("#container").css("bottom","10px");
		$("#container").css("position","absolute");
		$("#container").css("overflow-y","scroll");
		$("#displaytab").hide();
		$("#content").show();		
		$(".oembedDiv").show();
		$(".editbtn").show();
		$(".dialog-createNew").hide();
		$(".commitbtn").hide();
		$("#edit").hide();
		$("#btnDeleteNode").hide();
		$("#icoBookmark").hide();
	},
	//bind add with addOne function
	addNewItem : function(e) {
		targetIndex = getStringNumberId(e.currentTarget.id);
		var itemIndex = $("#blackBlocks hr").index($("#showHr_" +targetIndex)[0]);
		var item = new Item();
		Items.add(item,{at:itemIndex});
	},
	//fill the item script by item's data
	addOne : function(item){
		showBlockCount++;			
		var view = new ItemView({model:item});
		if(targetIndex == 0){				
			$("#showHr_0").parent().siblings("#blackBlocks").prepend(view.render().el);
		}else if(targetIndex > 0){
			$("#showHr_"+targetIndex).parent().parent().after(view.render().el);
		}else{
			$("#blackBlocks").append(view.render().el);
		}
		$(view.render().el)[0].scrollIntoView(true);		
		$(view.render().el).find(".Textcontent").wysiwyg({controls:{undo:{visible:false},redo:{visible:false}},initialContent:"" });
		var displayView = new DisplayView({model:item});
		$("#oembedDiv_"+showBlockCount).append(displayView.render().el);
		//$("#oembedDiv_"+showBlockCount).find("#subDescription").autosize();//textareaAutoHeight({ minHeight:50, maxHeight:200 });

		var tempMarks = new YoutubeMarkList();
		tempMarks.reset(item.toJSON().annotations);
		tempMarks.each(function(mark){
			var markView = new YoutubeMarkView({model:mark});
			$("#oembedDiv_"+showBlockCount).find("#youtubeMarkView").append(markView.render().el);
		});	
		allMarks.push([showBlockCount,tempMarks]);
				
		item.bind('error',function(model,error){
			alert(error);
		});
	},
	addAll : function(){
		$("#blackBlocks .template").remove();
		$("#blackBlocks .EditBlock").remove();
		Items.each(this.addOne);
	},
	addOneComments : function(item){
		var view = new CommentView({model:item});		
		$("#commentDiv").prepend(view.render().el);
		if(item.toJSON().username != $("#username").html()){
			$(view.render().el).find(".commentToolButton").hide();
		}
	},
	addAllComments : function(){
		Comments.each(this.addOneComments);
	}
});

//comment model
window.Comment = Backbone.Model.extend({
	defaults: function() {
		return {
			username:"",
			datetime:new Date(),
			content:""
		};
	}
});
window.CommentList = Backbone.Collection.extend({
	model:	Comment,
	localStorage:new Store()
});
window.Comments = new CommentList();
window.CommentView = Backbone.View.extend({
	tagName:  "div",
	template: _.template($('#tpl-commentBlock').html()),
	initialize : function(){
		this.model.bind('destroy', this.remove, this);
	},
	events: {
		"click .editComment"	: "editComment",
		"click .saveEditContent"	: "saveEditContent",
		"click .cancelEditContent"	: "cancelEditContent",
		"click .deleteComment"	: "deleteComment"
	},
	render: function(e) {
		$(this.el).html(this.template(this.model.toJSON())); 
		return this;
	},
	remove: function() {
		$(this.el).remove();
	},
	editComment: function(e){
		$(e.currentTarget).parent().parent().find("#contentEdit").show();
		$(e.currentTarget).parent().parent().find("#contentView").hide();
	},
	saveEditContent: function(e){
		if(!$(e.currentTarget).parent().find("#contentInput").val()){ alert("please input a comment!"); return; }
		this.model.datetime = new Date();
		this.model.attributes.content = $(e.currentTarget).parent().find("#contentInput").val();
		$(e.currentTarget).parent().parent().find("#contentView").html($(e.currentTarget).parent().find("#contentInput").val());
		saveComment();
		$(e.currentTarget).parent().parent().find("#contentEdit").hide();
		$(e.currentTarget).parent().parent().find("#contentView").show();
	},
	cancelEditContent: function(e){
		$(e.currentTarget).parent().parent().find("#contentEdit").hide();
		$(e.currentTarget).parent().parent().find("#contentView").show();
	},
	deleteComment: function(e){
		this.model.destroy();
		saveComment();
	}
});


//youtube's mark model
//two property:timestamp and notes
window.YoutubeMark = Backbone.Model.extend({
	defaults: function() {
		return {
			timestamp:0,
			notes:""
		};
	}
});

//the collection for youtubeMark
window.YoutubeMarkList = Backbone.Collection.extend({
	model:	YoutubeMark,
	localStorage:new Store()
});

//youtube's mark View
window.YoutubeMarkView = Backbone.View.extend({
	tagName:  "div",
	template: _.template($('#tpl-youtubeMarkBlock').html()),
	initialize : function(){
		this.model.bind('destroy', this.remove, this);
		this.model.bind('change', this.render, this);
	},
	events: {
		"click .editYoutubeMark"	: "editYoutubeMark",
		"click .saveEditContent"	: "saveEditContent",
		"click .cancelEditContent"	: "cancelEditContent",
		"click .deleteYoutubeMark"	: "deleteYoutubeMark"
	},
	render: function(e) {
		$(this.el).html(this.template(this.model.toJSON())); 
		return this;
	},
	remove: function() {
		$(this.el).remove();
	},
	editYoutubeMark: function(e){		
		$(e.currentTarget).parent().parent().find("#contentEdit").show();
	},
	saveEditContent: function(e){
		if(!$(e.currentTarget).parent().find("#contentInput").val()){ alert("please input a mark content!"); return; }	
		$("#nodeIndexForMark").html($(e.currentTarget).parents(".oembedDiv").attr("id"));
		this.model.save({notes:$(e.currentTarget).parent().find("#contentInput").val()});
		//this.model.attributes.notes = $(e.currentTarget).parent().find("#contentInput").val();	
		$(e.currentTarget).parent().parent().find("#contentEdit").hide();
	},
	cancelEditContent: function(e){		
		$(e.currentTarget).parent().parent().find("#contentEdit").hide();
	},
	deleteYoutubeMark: function(e){
		$("#nodeIndexForMark").html($(e.currentTarget).parents(".oembedDiv").attr("id"));
		this.model.destroy();
	}
});
	
$(document).ready(function(){
	window.onbeforeunload = function() { 
		if($("#content").css("display") != "none"){
			return "You haven't finished your node. Do you want to leave without finishing?"
		}
	}

	window.App = new AppView();

	//if nodeid is empty, don`t load data, create node	
	if($("#nodeid").html() == "newid"){	
		$("#edit").click();	
		$("#showHr_0").click();
		return;
	}
	start($("#username").html(),$("#nodeid").html());
	
	//取得保存的notes
	getNotes4ThisPage(document.location.href);
	initNotePage();
});

//the page init function,call InitData function
function start(username,nodeid){
    if(nodeid == "undefined")
    {
        var basePath = this.location.toString();
        var unlistedcode = basePath.substr(basePath.lastIndexOf("/")+1);
    }
    $.ajax({
        type: 'GET',
        url: apiURL + "/nodeType",
        data: {"nodeid":nodeid},
        dataType: "json",
        success: function(data) {
            var nodeType = data.privacy;
            if(nodeType=="unlisted"){
                $.ajax( {
                    type: 'GET',
                    url: apiURL + "/node/unlisted/" + nodeid,
                    dataType: "json",
                    async: false,
                    success: function(data) {
                        InitData(data);
                    }           
                });
            }else if(username=="publicuser"){
                $.ajax( {
                    type: 'GET',
                    url: apiURL + "/node/" + nodeid,
                    dataType: "json",
                    async: false,
                    success: function(data) {
                        InitData(data);
                    }           
                });
            }else{  
                $.ajax( {
                    type: "GET",
                    url: apiURL + "/users/"+username+"/nodes/" + nodeid,
                    dataType: "json",
                    async: false,
                    success: function(data) {
                        if(!data){ return; }
                        InitData(data);
                        $.ajax({
                            type: "GET",
                            url: apiURL + "/bookmark/" + nodeid,
                            dataType:"json",
                            success: function(data){
                                if(data){                           
                                    $("#icoBookmark").removeClass("icon-star-empty").addClass("icon-star");
                                    $("#btnBookmark").attr("value","1");
                                    $("#lblBookmark").html("&nbsp;unbookmark");
                                }else{
                                    $("#icoBookmark").removeClass("icon-star").addClass("icon-star-empty");
                                    $("#btnBookmark").attr("value","0");
                                    $("#lblBookmark").html("&nbsp;bookmark");
                                }
                            }
                        });
                    }
                });
            }
        }    
    });
}


//get mongodb data ,then fill Div
function InitData(data){
	if(!data){ return; }
	logView(data._id,data.username);
	var jsonData = data.node_data;
	if(data.content==""){
		$("#divTopDescritionEdit").html(inputPathDescNotice);
		$("#divTopDescritionEdit").css("color","darkgray");
	}else{
		$("#divTopDescritionEdit").html(data.content);
		$("#divTopDescritionEdit").css("color","black");
	}
	document.title = data.title;
	$("#topTitle").val(data.title);	
	$('#tagsText').val(data.category.join(', '));
	if(data.privacy == "public"){
		$("#nodePrivacy button[value='private']").removeClass("active");
		$("#nodePrivacy button[value='unlisted']").removeClass("active");
		$("#nodePrivacy button[value='public']").addClass("active");
	}else if(data.privacy == "unlisted"){
		$("#nodePrivacy button[value='public']").removeClass("active");
		$("#nodePrivacy button[value='private']").removeClass("active");
		$("#nodePrivacy button[value='unlisted']").addClass("active");
	}else{
		$("#nodePrivacy button[value='public']").removeClass("active");
		$("#nodePrivacy button[value='unlisted']").removeClass("active");
		$("#nodePrivacy button[value='private']").addClass("active");
	}

	if($("#username").html() == data.username){
		$("#edit").show();
		$("#btnDeleteNode").show();
	}
	
	//tag's button
	var tagButton = "";
	if(data.category != null && data.category.length>0){
		for(var i=0;i<data.category.length;i++){
			if(data.category[i].length>0){
				tagButton += "<button class='btn btn-mini btn-info'>"+data.category[i]+"</button>";
			}
		}
	}
	var content_short = data.content;
	if(data.content.length>350){
		content_short = data.content.substr(0,350)+"...<a href='#' onclick='showAllContent(this)'>more</a>";
	}
	//var unlistedcode = (data.privacy == "unlisted")? "unlisted Code: "+data._id:"";
	
	//replace title ,desc ,updateDate data
	$("#displayblocks").html($("#tpl-viewtopshow").html().replace("#topTitle",data.title).replace("#mltURL",showMoreLikeThis(data._id)).replace("#Description",data.content).replace("#content_short",content_short)
	.replace(/#author/g,data.username).replace("#updateDate",FormatDateTime(data.updateDate)).replace("#tags",tagButton).replace("#views",data.view_total).replace("#bookmark",data.bookmark_num));
	$("#displaytab").show();
	
	//hide edit node mode  
	$("#content").hide();
	
	if(jsonData == null || jsonData.flexEmbeds==undefined || jsonData.flexEmbeds.length<=0){
		return;
	}
	//draw item call addAll function
	Items.reset(jsonData.flexEmbeds);
	
	//set jsscript with jsonData
	Items.each(function(item){
		if(item != undefined){
			var displayBlockView = new DisplayBlockView({model:item});
			if(item.toJSON().provider_type=="link" && item.toJSON().provider_name != "Flickr"){
				$("#displayblocks").append(displayBlockView.render().el).append($("#tpl-urlContentmsg").html().replace(/#urldata/,item.toJSON().inputData));
			}else{
				$("#displayblocks").append(displayBlockView.render().el);
				if(item.toJSON().provider_type=="video" && item.toJSON().provider_name == "YouTube"){
					var YoutubeMarks_view = new YoutubeMarkList();
					YoutubeMarks_view.reset(item.toJSON().annotations);
					var temp = $("<div></div>");
					YoutubeMarks_view.each(function(mark){
						var markView = new YoutubeMarkView({model:mark});
						$(temp).append(markView.render().el);						
					});
					$(displayBlockView.render().el).find(".DisplayBlock").append($(temp));
					$("#displayblocks").find(".editYoutubeMark").hide();
					$("#displayblocks").find(".deleteYoutubeMark").hide();	
				}
			}
		}
	});
	//console.log($("#displayblocks").html());
	if(data.comments){
		Comments.reset(data.comments);
	}else if(!$("#username").html() || $("#username").html() == "publicuser"){
		$("#commentblocksHR").hide();
		$("#commentblocks").hide();	
	}
	
	if(!$("#username").html() || $("#username").html() == "publicuser"){
		$("#nodeComment").parent().hide();
	}else{
		$("#nodeComment").parent().show();
	}
}


//when click showDetail link,call showDetailsData function
function showDetailsData(url,obj){
	if($(obj).attr("state") == "show"){	
		$(obj).attr("state","hide");
		$(obj).html("hide details");
		if($(obj).prev().length>0){//view
			$(obj).parent().prev().find('.DisplayBlock').hide();
		}else{
			$(obj).parent().parent().find('.DisplayBlock').hide();
		}
		
		$(obj).parent().parent().find('#changeImage').hide();
		$(obj).parent().prepend("<div id='tempLink'><a href='"+url+"'>"+url+"</a></div>");
		if($(obj).parent().find(".detailContent").length >0){
			$(obj).parent().find(".detailContent").show();
			$(obj).parent().find("#urlDetail").show();
			$(obj).parent().find("#urlIframe").show();
		}else{
			$(obj).parent().find("#detailsAjaxLoader").show();
			$.ajax({
				type: 'GET',
				url: apiURL + "/getContentByURL",
				data: {url:url},
				success: function(data) {
					if(data && $(data.content).text().length>200){
						var imgBasePath = url.substring(0,url.substr(url.indexOf('http://')+7).indexOf("/")+7);
						$(data.content).find("img").each(function(){
							var tempPath = $(this).attr("src").replace(/(^\s*)/g, "");
							if(tempPath.indexOf('http://')<0 && tempPath.substr(0,2) != "//"){								
								data.content = data.content.replace($(this).attr("src"),imgBasePath + $(this).attr("src"));								
							}
						});
						$(obj).parent().append("<div class='detailContent'>"+data.content+"</div>");
					}else{
						$(obj).parent().append("<div class='detailContent'><iframe style='width:99%; height:500px;' src='"+url+"'></iframe></div>");
					}
					$(obj).parent().find("#detailsAjaxLoader").hide();
				}
			});
		}
	}else{
		$(obj).attr("state","show");
		$(obj).html("show details");
		$(obj).parent().find("#tempLink").remove();
		if($(obj).prev().length>0){//view
			$(obj).parent().prev().find('.DisplayBlock').show();
		}else{
			$(obj).parent().parent().find('.DisplayBlock').show();
		}
		$(obj).parent().parent().find('#changeImage').show();
		$(obj).parent().find(".detailContent").hide();
		$(obj).parent().find("#urlDetail").hide();
		$(obj).parent().find("#urlIframe").hide();
	}

}


//when click the little save button,call the saveItem function 
function SaveItem(obj,model){
	var inputType = "";
	var inputData = "";
	var type = "";
	var resourceContent = "";
	var embedHtmlContent = "";
	var noteContent = "";
	var embed = "";
	var title = "";
	var description = "";
	var thumbnail = "";
	var fullcontent = "";
	var provider_name = "";
	var provider_type = "";
	
	var tabsNewId = $(obj).parent().find(".tabbable");
	var oembedDivId = $(obj).parent().find(".oembedDiv")[0];
	var selected = $(obj).parent().find(".tabbable li").index($(obj).parent().find(".tabbable .active"));
	if($(obj).attr("disabled")) { return; }
	$(obj).attr("disabled","true");
	$(oembedDivId)[0].scrollIntoView(true);
	if(selected==0){		
		var orgiURL = $(tabsNewId).find(".resourceURL").val();
		if(orgiURL==""){
			alert("please give your URL ");
			$(obj).removeAttr("disabled");
			return;
		}		
		inputType="URL";
		inputData = orgiURL;		
		var url = escape(orgiURL) + "&maxwidth=600";
		var api_url = 'http://api.embed.ly/1/oembed?key=' + embedly_key + '&url=' + url + '&callback=?';
		$(tabsNewId).find("#urlLoader").show();
				
		$.getJSON( api_url, function(json) {
			if(json.type!="error"){
				if(json.type=="video"){
					console.log(json);
					thumbnail = json.thumbnail_url;
					embed = json.html + "</br><a href='"+orgiURL+"'>"+orgiURL+"</a>";					
				}else if(json.type=="rich"){//twitter
					embed = json.html+ "</br><a href='"+orgiURL+"'>"+orgiURL+"</a>";
				}else if(json.type=="photo"){
					embed = $('#tpl-imageEmbed').html().replace(/#URL/g,json.url);
					if(json.thumbnail_url){
						thumbnail = json.thumbnail_url;
					}else{
						thumbnail = json.url;
					}
				}else if(json.type=="link"){
					var thumbnail = json.thumbnail_url ? json.thumbnail_url:"";
					var displayUrl = json.url;
					if(json.url.length>150){
						displayUrl = json.url.substr(0,147) + "...";
					}
					embed = $('#tpl-linkWithImageEmbed').html().replace("#Thumbnail",thumbnail).replace(/#URL/g,json.url).replace(/#displayUrl/g,displayUrl);
				}
				title = json.title? json.title:"";
				description = json.description? json.description:"";
				var provider_name = json.provider_name? json.provider_name:"";
				var provider_type = json.type? json.type:"";
				
				if(thumbnail=="" && json.thumbnail_url){
					thumbnail=json.thumbnail_url;
					if(json.thumbnail_url){
						var imgsPath = json.thumbnail_url;
					}
				}
				fullcontent = title + " " + description;
				saveChange(obj,model,inputType,inputData,embed,title,description,thumbnail,fullcontent,provider_name,provider_type);
				$(tabsNewId).find("#urlLoader").hide();
			}
			if(json.type=="error" || (json.type=="link" && json.provider_name != "Flickr")){
				$(oembedDivId).append("<img id='detailContentAjaxLoader' src='/curation/img/ajaxLoader.gif'><img>");
				$.ajax({
					type: 'GET',
					url: apiURL + "/getContentByURL",
					data: {url:orgiURL},
					success: function(data) {
						$(oembedDivId).find("#detailContentAjaxLoader").remove();
						if(data && data.content && data.content.replace(/\n/g,"").replace(/\r/g,"").replace(/\t/g,"").replace(/<noscript>.{0,}<\/noscript>/g,"").length>200){
							var contentText = data.content.replace(/\n/g,"").replace(/\r/g,"").replace(/\t/g,"").replace(/<noscript>.{0,}<\/noscript>/g,"");
							contentText = $(contentText).text().replace(/(^\s*)|(\s*$)/g, "");							
							var imgsPath = json.thumbnail_url ? json.thumbnail_url:"";
							var imgBasePath = inputData.substring(0,inputData.substr(inputData.indexOf('http://')+7).indexOf("/")+7);
							var imagList = new Array();
							$(data.content).find("img").each(function(){
								if($(this).attr("width")>50 || $(this).attr("height")>50){
									var tempPath = $(this).attr("src").replace(/(^\s*)/g, "");
									if(tempPath.indexOf('http://')<0 && tempPath.substr(0,2) != "//"){
										imagList.push(tempPath);
										tempPath = imgBasePath + tempPath;										
									}
									imgsPath += "," + tempPath;
								}
							});
							for(var i=0;i<imagList.length;i++){
								data.content = data.content.replace(imagList[i],imgBasePath + imagList[i]);
							}
							
							var picList = deleteRepeater(imgsPath.split(","));
							imgsPath = picList.join(",");
							var totalpic = picList.length;
							var displayUrl = orgiURL;
							if(orgiURL.length>150){
								displayUrl = orgiURL.substr(0,147) + "...";
							}
							if(totalpic<1){
								embed = $("#tpl-linkEmbed").html().replace(/#URL/g,orgiURL).replace(/#displayUrl/g,displayUrl);					
								$(oembedDivId).find("#imgsPathPanel").html("");
								$(oembedDivId).find("#btnChangePic").hide();
								$(oembedDivId).find("#lblPicNumber").hide();
							}else if(totalpic ==1){								
								embed = $("#tpl-linkWithImageEmbed").html().replace("#Thumbnail",picList[0]).replace(/#URL/g,orgiURL).replace(/#displayUrl/g,displayUrl);						
								$(oembedDivId).append($("#tpl-switchpicture").html().replace("@totalpic",totalpic).replace("@currentPic",1));
								$(oembedDivId).find("#btnChangePic").hide();
								$(oembedDivId).find("#lblPicNumber").hide();
								$(oembedDivId).find("#imgsPathPanel").html(imgsPath);
							}else{
								embed = $("#tpl-linkWithImageEmbed").html().replace("#Thumbnail",picList[0]).replace(/#URL/g,orgiURL).replace(/#displayUrl/g,displayUrl);						
								$(oembedDivId).append($("#tpl-switchpicture").html().replace("@totalpic",totalpic).replace("@currentPic",1));
								$(oembedDivId).find("#imgsPathPanel").html(imgsPath);
								$(oembedDivId).find("#btnChangePic").show();
								$(oembedDivId).find("#lblPicNumber").show();
							}
							if(json.type=="error"){
								title = data.title;								
								description = customSubstr(contentText,200) + "...";
								fullcontent = title;
								thumbnail = picList.length>0 ? picList[0]:"";
								provider_type = "link";
								saveChange(obj,model,inputType,inputData,embed,title,description,thumbnail,fullcontent,provider_name,provider_type);
								$(tabsNewId).find("#urlLoader").hide();
							}
							$(oembedDivId).append($("#tpl-urlContent").html().replace("#urlContent",data.content).replace(/#src/g,orgiURL));
						}else{
							var imgsPath = json.thumbnail_url ? json.thumbnail_url:"";
							if(imgsPath){
								$(oembedDivId).append($("#tpl-switchpicture").html().replace("@totalpic",totalpic).replace("@currentPic",1));
								$(oembedDivId).find("#btnChangePic").hide();
								$(oembedDivId).find("#lblPicNumber").hide();
								$(oembedDivId).find("#imgsPathPanel").html(imgsPath);
							}
							$(oembedDivId).append($("#tpl-urlIframe").html().replace(/#src/g,orgiURL));
						}
					}
				});
			}
		});	
	}
	else if(selected==1){
		var content=$(tabsNewId).find(".Textcontent").attr("value");
		if(content==""){
			alert("please enter your Textcontent");
			return;
		}		
		inputType = "Note";
		inputData = content;
		embed = $('#tpl-noteEmbed').html().replace("#content",content);
		fullcontent = content;
		saveChange(obj,model,inputType,inputData,embed,title,description,thumbnail,fullcontent,provider_name,provider_type);
	}else if(selected==2){
		var question = $(obj).parent().find("#quizQuestion").val();
		if(question==""){
			alert("please enter your queation");
			return;
		}
		var quizObj = {};
		quizObj.question = question;		
		var optionCount = $(obj).parent().find("#tbQuizOption tr").length;
		var tempEmbedStr = "<table cellspacing='10'><tr><td style='font-size:16pt; valign: top;height:40px'>" + question + "</td></tr>";
		var isCorrect = "";
		var isSetCorrect = false;
		var answerOption = [{}];
		var index = 0;
		for(var i=0;i<optionCount;i++){			
			var optionStr = $(obj).parent().find("#tbQuizOption tr:eq("+i+")").find("td").find("input:eq(0)").val();
			if(optionStr == ""){ continue; }
			var correct = $(obj).parent().find("#tbQuizOption tr:eq("+i+")").find(".radio:checked").val();
			if(correct){
				isCorrect = "true";
				isSetCorrect = true;
			}else{
				isCorrect = "false";
			}
			var tempObj = {optionStr:optionStr,isCorrect:isCorrect};
			answerOption[index] = tempObj;
			index++;
			tempEmbedStr += "<tr isCorrect=" +isCorrect+ " class='quizAnswerOption' onclick='correctAnswer(this)' style='height:25px'><td><span class='badge'>" + index + "</span>&nbsp;" + optionStr + "</td></tr>";
		}
		if(!isSetCorrect){
			alert("please set the correct answer");
			return;
		}
		tempEmbedStr += "</table>";
		embed = tempEmbedStr;
		quizObj.answerOption = answerOption;
		inputData = JSON.stringify(quizObj);
		inputType="Quiz";
		title = "Quiz";
		saveChange(obj,model,inputType,inputData,embed,title,description,thumbnail,fullcontent,provider_name,provider_type);
	}else if(selected==3){
		var sourceContent = $(obj).parent().find(".HtmlSourceContent")[0].value;
		if(sourceContent == undefined || sourceContent==""){
			alert("please give your html source ");
			return;
		}			
		inputType = "embeddedHTML";		
		inputData = sourceContent;
		embed = sourceContent;
		fullcontent = sourceContent;
		saveChange(obj,model,inputType,inputData,embed,title,description,thumbnail,fullcontent,provider_name,provider_type);
	}
}

function SaveItemEx(obj,model){
	var receiveUrl = $(obj).parents(".EditBlock").find(".resourceURL").val();
	var embed = $(obj).parents(".EditBlock").find(".DisplayBlock").html();
	var title = $(obj).parents(".EditBlock").find("#subTitle").val();
	saveChange(obj,model,"URL",receiveUrl,embed,title,"",receiveUrl,title);
}


//save item backbone model
function saveChange(obj,model,inputType,inputData,embed,title,description,thumbnail,fullcontent,provider_name,provider_type){
	var item = new Item();
	var attribute = {};
	attribute.inputType = inputType;
	attribute.inputData = inputData;
	attribute.embed = embed;
	attribute.title = title;
	attribute.description = description;
	attribute.thumbnail = thumbnail;
	attribute.fullcontent = fullcontent;
	attribute.provider_name = provider_name;
	attribute.provider_type = provider_type;
	model.save(attribute);
	
	$(obj).parent().find(".oembedDiv").show();
	$(obj).parent().find(".editbtn").show();
	$(obj).parent().find(".dialog-createNew").hide();	
	$(obj).hide();
	$(obj).removeAttr("disabled");
}

function getFinalJsonData(){
	var result = {};
	nodeFullContent = "";
	for(var i=0;i<Items.length;i++){
		nodeFullContent += " " + Items.models[i].attributes.fullcontent;
	}
	var SortableItems = new ItemList();
	for(var i=0;i<$("#blackBlocks .EditBlock").length;i++){
	   var id = $($("#blackBlocks .EditBlock")[i]).attr("itemid");
	   var item = Items.find(function(item){ if(item.toJSON().id==id) return item });
	   SortableItems.add(item);
	}
	if(!nodeThumbnail){
		nodeThumbnail = node_default_thumnail;
	}
	
	result.topTitle = $("#topTitle").val();	
	result.flexEmbeds=SortableItems;	
	if(result.flexEmbeds==undefined || result.flexEmbeds.length<=0){
		return {};
	}
	return result;
}
function saveAllData(){
	if($("#topTitle").val() == ""){
		alert("the node title cannot be empty.");
		return;
	}
	$("#saveAllData").attr("disabled",true);
	$("#saveAllData").html("Saving");
	
	if($("#nodeid").html() == "newid"){
		createNode();
	}else{
		editNode();
	}
}
function createNode(){
	var result = getFinalJsonData();	
	var privacy = $("#nodePrivacy .active").attr("value");
	var unlistcode = privacy == "unlist" ? GuidGenerator() : "";
	var topTitle = $("#topTitle").val();
	var content = $("#divTopDescritionEdit").html()==inputPathDescNotice? "" :  $("#divTopDescritionEdit").html();
	var tagsStr = $('#tagsText').val().replace(/(^\s*)|(\s*$)/g, "").replace(/(^\,*)|(\,*$)/g, "").replace(/\s*,\s*/g,",");
	var tagList = tagsStr.toLowerCase().split(',');
	var canSave = true;
	if(result.flexEmbeds){
		for(var i=0;i<result.flexEmbeds.toJSON().length;i++){
			if(!result.flexEmbeds.toJSON()[i].inputData){
				canSave = false;
			}
		}
	}
	if(!result.flexEmbeds || !canSave){
		alert("There are empty boxes, please edit and input information into the empty boxes.");
		$("#saveAllData").attr("disabled",false);
		$("#saveAllData").html("Save");
		return;
	}	
	$.ajax({
        type: 'POST',
        url: apiURL + "/nodes",
        data: {"data":JSON.stringify(result),"toptitle":topTitle,"content":content,"category":tagList,"privacy":privacy,"thumbnail":nodeThumbnail,"fullcontent":nodeFullContent},
		dataType: "json",
        success: function(data) {
			if(data.error){
				alert("you have logout and cannot save!");
				location="/login";
				return;
			}
			$("#content").hide();
			window.location.href="/nodes/"+data._id;
        }
    });
}
function editNode(){
	var result = getFinalJsonData();
	var privacy = $("#nodePrivacy .active").attr("value");
	var topTitle = $("#topTitle").val();
	var content = $("#divTopDescritionEdit").html()==inputPathDescNotice? "" :  $("#divTopDescritionEdit").html();
	var tagsStr = $('#tagsText').val().replace(/(^\s*)|(\s*$)/g, "").replace(/(^\,*)|(\,*$)/g, "").replace(/\s*,\s*/g,",");
	var tagList = tagsStr.split(',');
	var canSave = true;
	if(result.flexEmbeds){
		for(var i=0;i<result.flexEmbeds.toJSON().length;i++){
			if(!result.flexEmbeds.toJSON()[i].inputData){
				canSave = false;
			}
		}
	}
	if(!result.flexEmbeds || !canSave){
		alert("There are empty boxes, please edit and input information into the empty boxes.");
		$("#saveAllData").attr("disabled",false);
		$("#saveAllData").html("Save");
		return;
	}
	$.ajax( {
        type: 'PUT',
        url: apiURL + "/nodes",
        data: {"id":$("#nodeid").html(),"node_data":JSON.stringify(result),"title":topTitle,"content":content,"category":tagList,"privacy":privacy,"thumbnail":nodeThumbnail,"fullcontent":nodeFullContent},
        dataType: "json",
		success: function(data) {
			if(data.error){
				alert("you have logout and cannot save!");
				location="/login";
				return;
			}
			$.ajax( {
				type: 'GET',
				url: apiURL + "/users/"+$("#username").html()+"/nodes/"+$("#nodeid").html(),
				dataType: "json",
				success: function(data) {
					$("#content").hide();
					window.location.href="/nodes/"+data._id;
				}
			});
        }
    });
}

function addComment(){
	if(!$("#nodeComment").val()){
		alert("please input a comment!");
		return;
	}
	var comment = new Comment({username:$("#username").html(),datetime:new Date().toUTCString() ,content:$("#nodeComment").val()});
	Comments.add(comment);
	saveComment();
	$("#nodeComment").val("");
}

//save the comment data
function saveComment(){
	$.ajax( {
        type: 'PUT',
        url: apiURL + "/nodes",
        data: {"id":$("#nodeid").html(),"comments":Comments.toJSON(),"comment_num":Comments.toJSON().length},
        dataType: "json",
		success: function(data) {
			if(data.error){
				alert("save comment wrong!");
				return;
			}
        }
    });
}

function deleteNode(){
	if(!confirm("Are you sure to delete the node?")){
		return;
	}	
	$.ajax({
		type: 'DELETE',
		url: apiURL + "/nodes/" + $("#nodeid").html(),
		success: function(data) {
			location = "/users/" + $("#username").html();
        },
        dataType: "json",
        async: false,
        complete: function(jqHXR, status ) {
        }
    });
}
function switchBookmark(obj){
	if($("#username").html() == "publicuser"){
		alert("please login first.");
		location = "/login";
	}
    var bookmarkNumber = $("#bookmarkNum").text();
    bookmarkNumber = parseInt(bookmarkNumber);
	//1:insert; 0:remove
	var action = "1";
	if($(obj).attr("value") == "1"){
		var action = "0";
	}
		
	$.ajax( {
        type: 'POST',
        url: apiURL + "/bookmark",
        data: {"nodeid":$("#nodeid").html(),"action":action },
        dataType: "json",
    })
	.done(function(data){
	    var message = data.msg;
	    if(message == 'success')
	    {
    		if(action=="1"){
    			$("#icoBookmark").removeClass("icon-star-empty").addClass("icon-star");
    			$("#btnBookmark").attr("value","1");
    			bookmarkNumber = bookmarkNumber+1;
    			$("#bookmarkNum").text(bookmarkNumber);
    			$("#lblBookmark").html("&nbsp;unbookmark");
    		}else{
    			$("#icoBookmark").removeClass("icon-star").addClass("icon-star-empty");
    			$("#btnBookmark").attr("value","0");
    			bookmarkNumber = bookmarkNumber-1;
    			$("#bookmarkNum").text(bookmarkNumber);
    			$("#lblBookmark").html("&nbsp;bookmark");
    		}
		}
	})
	.fail(function(){});
}

function getSubData(data){
	var start = data.indexOf("\u003Ciframe");
	var end = data.indexOf("\u003E\u003C/iframe\u003E") + 10;
	return data.substring(start,end);
}

function removeOldJSONScriptNodes() {
	var jsonScript = document.getElementById('jsonScript');
	if (jsonScript) {
		jsonScript.parentNode.removeChild(jsonScript);
	}
}


//right search area
function getSearchData(pageIndex,iCPP,source){
	$("#searchResult").show();
	$("#bufferResult").hide();
	$("#searchResult").html("");
	$("#hiddenresult").html("");
	currentPageIndex = pageIndex;
	var start = (pageIndex-1)*iCPP;
	if(source == 1){ //oer		
		$.ajax({
			 url: solrAPI,
			 'data': {'q': $("#keyWork-OER").val(), 'start':start, 'rows':iCPP},
			 dataType: "jsonp",
			 jsonp: 'json.wrf',
			 success: function(data) {
				if(data.response.numFound == 0){
					$("#searchResult").html("");
					$("#Pagination_Search").html("");
					return;
				}

				var start = parseInt(data.responseHeader.params.start);
				var rows = parseInt(data.responseHeader.params.rows);
				var numFound = parseInt(data.response.numFound);
				var page = Math.ceil((start+1)/rows);
				var hasNext = true;
				if((start+rows)>=numFound){ hasNext = false; }
				customPagination(page,hasNext,iCPP,1);
				showSearchData(data,iCPP,1);
			 }
		 });
	}else if(source == 2){	//youtube
		$("#jsonScript").remove();
		var script = document.createElement('script');
		script.setAttribute('src', youtubeAPI.replace('@key',$("#keyWork-YOUTUBE").val()).replace('@start',start+1).replace('@iCPP',iCPP).replace('@callback','showSearchData').replace('@orderby',''));
		script.setAttribute('id', 'jsonScript');
		script.setAttribute('type', 'text/javascript');
		document.documentElement.firstChild.appendChild(script);
		var url = youtubeAPI.replace('@key',$("#keyWork-YOUTUBE").val()).replace('@start',start+1).replace('@iCPP',iCPP).replace('@callback','showSearchData').replace('@orderby','');
	}else if(source == 3){ //twitter
		var url = twitterAPI + "?page="+pageIndex+"&rpp="+iCPP+"&q="+$("#keyWork-TWITTER").val()+"&callback=showSearchData"
		getDataFromTwitter(url);
	}else if(source == 4){ //flickr
		getDataFromFlickr(pageIndex,20);
	}else if(source == 8){ //buffer
	    getDataFromBuffer(pageIndex,10);
	}
	else{
		var type="";
		var key="";
		if(source == 5){ 
			type="Image";
			key = $("#keyWork-IMAGE").val();
		}else if(source == 6){
			type="Web";
			key = $("#keyWork-WEB").val();			
		}else{
			type="News";
			key = $("#keyWork-NEWS").val();
		}
		var path = bingAPI.replace("@key",escape(key)).replace("@type",type).replace("@skip",start).replace("@top",iCPP);
		getDataFromBing(path,10,source);
	}
}


function getDataFromBuffer(pageIndex,pageNum){
	$("#bufferResult").html("");
    $("#searchResult").html("");
    $("#searchResult").hide();
    $("#bufferResult").show();
    var hasNext = true;
    var start = (pageIndex-1)*pageNum;
    $.ajax({
        url: apiURL + "/showUserBuffer",
        dataType: "json",
        data: { "page":start,"pageSize":pageNum },
        success: function(data){
            if(data){
                var contentStr = "";
                for(var i=0;i<data.length;i++){
                    var obj = data[i];
                    var displayURL = "none";
                    var source = obj.source;
                    var uri = obj.href; 
                    var nodeId = obj._id;    
                    var displayUri = uri;
                    if(uri.length > 150){
                        displayUri = uri.substr(0,147) + "...";
                    }
                    contentStr += $("#tpl-bufferLinkEmbed").html().replace("@itemType",source).replace("@URL",uri).replace("@displayUrl",displayUri).replace("@nodeId",nodeId);
                }
                $("#bufferResult").append(contentStr);
                $("#bufferResult").sortable({ connectWith:".sortBlock",appendTo:"#pageDiv", helper:"clone"});
            }
        }
    });
    
     $.ajax({
        url: apiURL + "/userBuffer/count",
        dataType: "json",
        success: function(data){
            if(data){
                var nums = data.num;
                if((start+pageNum)>=nums){ hasNext = false; }
                customPagination(pageIndex,hasNext,pageNum,8);
            }
        }
    });
}


function getDataFromTwitter(url){
	$.ajax({
		 url: url,
		 dataType: "jsonp",
		 jsonp: 'json.wrf'
	});
}
function getDataFromBing(path,iCPP,source){
	$.ajax({
		url: apiURL + "/searchFromBing",
		'data': {'path': path },
		dataType: "json",
		success: function(data){
			if(data){
				showSearchData(data,iCPP,source);
			}
		}
	});	
}
function getDataFromFlickr(page,per_page){
	$.ajax({
		url: flickrAPI + "&page="+page+"&per_page="+per_page,
		'data': {'text': $("#keyWork-FLICKR").val() }, //call back is jsonFlickrApi
		dataType: "jsonp",
		jsonp: 'json.wrf'
	});
}
function jsonFlickrApi(jsonData){
	var contentStr = "";
	var objs = jsonData.photos.photo;
	var pageCount = jsonData.photos.pages;
	var photoIndex = (jsonData.photos.page - 1)*jsonData.photos.perpage;
	for(var i=0;i<objs.length;i++){
		var srcTemp = "http://farm" + objs[i].farm + ".staticflickr.com/" + objs[i].server + "/" + objs[i].id + "_" + objs[i].secret + "_s.jpg"
		var urlForEmbed = "http://www.flickr.com/photos/" + objs[i].owner + "/" + objs[i].id;
		contentStr += $("#tpl-searchPhotoResult-flickr").html().replace("@src",srcTemp).replace("@urlForEmbed",urlForEmbed).replace("@photoIndex", photoIndex+i);
	}
	
	$("#searchResult").html("<ul id='flickrImage' class='sortBlock' style='width:500px'>" + contentStr+ "</ul>");
	
	var hasNext = false;
	if(jsonData.photos.page < jsonData.photos.pages){ hasNext = true; }
	customPagination(jsonData.photos.page,hasNext,20,4)
	
	$('#flickrImage').masonry({
		itemSelector:'.sortBlock li',
		columnWidth:20
	});

	$("#searchResult .sortBlock").sortable({ connectWith:".sortBlock"});
}


//after search,show search Div
function showSearchData(jsonData,iCPP,source){
	var index = 0;
	var objs = null;
	var contentStr = "";
	if(jsonData.feed){
		iCPP=10;
		if(jsonData.feed.openSearch$totalResults.$t == 0){
			$("#searchResult").html("");
			$("#Pagination_Search").html("");
			return;
		}

		var page = Math.ceil((jsonData.feed.openSearch$startIndex.$t)/(jsonData.feed.openSearch$itemsPerPage.$t));
		var hasNext = true;
		if((jsonData.feed.openSearch$startIndex.$t+jsonData.feed.openSearch$itemsPerPage.$t)>=jsonData.feed.openSearch$totalResults.$t){ hasNext = false; }
		customPagination(page,hasNext,iCPP,2);
	
		objs = jsonData.feed.entry;
	}else if(jsonData.results){
		iCPP=10;
		if(jsonData.results.length == 0){
			$("#searchResult").html("");
			$("#Pagination_Search").html("");
			return;
		}

		var hasNext = false;
		if(jsonData.next_page) { hasNext = true; }
		customPagination(jsonData.page,hasNext,iCPP,3);
		
		objs = jsonData.results;
	}else if(source == 1){
		objs = jsonData.response.docs;
	}else if(source==5 || source==6 || source==7){
		var hasNext = false;
		var page = 1;
		if(jsonData.d.__next){
			hasNext = true;
			var parames = Parse_url(jsonData.d.__next);
			page = Math.ceil(parames['skip']/parames['top']);
		}
		customPagination(page,hasNext,iCPP,source);
		objs = jsonData.d.results;
	}

	for(var i=0;i<objs.length;i++){
		var obj = objs[i];
		var displayURL = "none";
		var sourceUrl = "";
		if(jsonData.feed){
			var updatedDate = obj.updated.$t.substr(0,10);
			var author = obj.author[0].name.$t;					
			var uri = obj.link[0].href;		
			var thumbnail = obj.media$group.media$thumbnail[0].url;
			var duration = formatTime(obj.media$group.yt$duration.seconds);
			var content = obj.content.$t;
			var title = obj.title.$t;
		}else if(jsonData.results){
			var updatedDate = obj.created_at.substr(0,25);
			var author = obj.from_user;
			var uri = "https://twitter.com/"+obj.from_user+"/status/"+obj.id_str;
			var userhome = "https://twitter.com/"+obj.from_user
			var thumbnail = obj.profile_image_url;
			var duration = 0;			
			var title = obj.from_user_name;
			var content = obj.text;
		}else if(source == 1){
			var updatedDate = obj.updatedDate.substr(0,10);
			var author = obj.author;
			var uri = obj.uri;
			var thumbnail = obj.thumbnail[0];
			var duration = formatTime(obj.duration);
			var title = obj.title;
			var content = obj.content;
		}else if(source==5){			
			var updatedDate = "";
			var author = "";			
			var uri = obj.MediaUrl;
			var thumbnail = obj.Thumbnail.MediaUrl;
			var duration = "";
			var title = obj.Title;
			var content = "";
		}else if(source==6){
			var updatedDate = "";
			var author = "";
			var uri = obj.Url;
			var thumbnail = "";
			var duration = "";
			var title = obj.Title;
			var content = obj.Description;
			displayURL = "block";
		}else if(source==7){
			var updatedDate = Date;
			var author = "";
			var uri = obj.Url;
			var thumbnail = "";
			var duration = "";
			var title = obj.Title;
			var content = obj.Description;
			displayURL = "block";
		}
		//if(content.length>153){
		//	content = content.substr(0,150) + "...";
		//}
		var displayDuration = "none";
		var displayUri = uri;
		if(duration){
			displayDuration = "block";
		}
		if(uri.length > 150){
			displayUri = uri.substr(0,147) + "...";
		}
		if(jsonData.results){
			contentStr += $("#tpl-searchVideoResult-twitter").html().replace("@src",thumbnail).replace("@uri",uri).replace("@title",title).replace("@updatedDate",updatedDate).replace("@author",author).replace("@content",content).replace(/@userhome/g,userhome).replace("@displayUri",displayUri);
		}else{
			contentStr += $("#tpl-searchVideoResult").html().replace("@src",thumbnail).replace(/@uri/g,uri).replace("@title",title).replace("@updatedDate",updatedDate).replace("@author",author).replace("@content",content).replace("@duration",duration).replace("@displayDuration",displayDuration).replace("@display",displayURL).replace("@sourceUrl",sourceUrl).replace("@displayUri",displayUri);
		}
	}
	$("#searchResult").append(contentStr);
	$("#searchResult").sortable({ connectWith:".sortBlock",appendTo:"#pageDiv", helper:"clone"});
}

function customPagination(page,hasNex,iCPP,source){
	var pagePrev = page - 1;
	var pageNext = page + 1;
	$("#Pagination_Search").html($("#tpl-pageNation").html().replace(/@pagePrev/g,pagePrev).replace(/@pageNext/g,pageNext).replace(/@iCPP/g,iCPP).replace(/@source/g,source));
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

function HighLightShow(obj){
	obj.style.border='0.1cm groove pink';
	obj.style.cursor='pointer';
}
function CancelHighLightShow(obj){
	obj.style.border='0';
	obj.style.cursor='default';
}
function htmlSourceClick(obj){
	obj.style.backgroundColor="white";
	obj.style.color="black"; 
	if(obj.value==htmlSourceInputNotice){
		obj.value="";
	}
}
function htmlSourceBlur(obj){
	if(obj.value==""){
		obj.style.backgroundColor="silver";
		obj.style.color="gray"; 
		obj.value=htmlSourceInputNotice;
	}
}

function initSearchPageNation(source){
    var initPagination = function() {
        var num_entries = $("#hiddenresult div.result").length;
		$("#Pagination_Search").pagination(num_entries, {
            num_edge_entries: 1, 
            num_display_entries: 3, 
            items_per_page:1,
			link_to:"getSearchData(__id__,10," + source + ")"
        });
    }();
}

function logView(nodeid,author){
	$.ajax({
		type: 'POST',
		url: apiURL + "/view",
		data: { "id":nodeid,"author":author },
		dataType: "json",
		success: function(data) {
        }
    });
}

function showView(data){
	$("#displaytab").show();
	$("#content").hide();
	$("#icoBookmark").show();

	var tagButton = "";
	if(data.category){
		for(var i=0;i<data.category.length;i++){
			if(data.category[i].length>0){
				tagButton += "<button class='btn btn-mini btn-info'>"+data.category[i]+"</button>";
			}
		}
	}
	var content_short = data.content;
	if(data.content.length>350){
		content_short = data.content.substr(0,350)+"...<a href='#' onclick='showAllContent(this)'>more</a>";
	}

	var unlistedcode = (data.privacy == "unlisted")? "unlisted Code: "+data._id:"";
	$("#displayblocks").html($("#tpl-viewtopshow").html().replace("#topTitle",data.title).replace("#mltURL",showMoreLikeThis(data._id)).replace("#Description",data.content).replace("#content_short",content_short)
	.replace(/#author/g,data.username).replace("#updateDate",FormatDateTime(data.updateDate)).replace("#tags",tagButton).replace("#views",data.view_total).replace("#bookmark",data.bookmark_num).replace("#unlistedcode",unlistedcode));

	document.title = data.title;
	var nodeData = data.node_data;
	if(!nodeData) { return; }
	
	var items = nodeData.flexEmbeds;
	targetIndex = -1;
	Items.reset(items);	
	Items.each(function(item){
		if(item != undefined){
			var displayBlockView = new DisplayBlockView({model:item});
			$("#displayblocks").append(displayBlockView.render().el);
		}
	});
}

function getStringNumberId(path){
	if(typeof(path) == "undefined" || path.lastIndexOf("_")==-1){
		return -1;
	}
	var lastIndex = path.lastIndexOf("_")+1;
	var id = path.substring(lastIndex,path.length);
	return id;
}
function getParameter(query,param){
	var iLen = param.length;
	var iStart = query.indexOf(param);
	if (iStart == -1)
	return "";
	iStart += iLen + 1;
	var iEnd = query.indexOf("&", iStart);
	if (iEnd == -1)
	  return query.substring(iStart);
	return query.substring(iStart, iEnd);
}
function formatTime(sec){
	hours = parseInt( sec / 3600 ) % 24; 
	minutes = parseInt( sec / 60 ) % 60; 
	seconds = sec % 60;  
	result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
	return result;
}

function removeOption(obj){
	$(obj).parent().parent().remove();
}
function addQuizOption(obj){
	$(obj).parent().parent().parent().append($("#tpl-quizOption").html());
}
function correctAnswer(obj){
	if($(obj).attr("isCorrect") == "true"){
		$("#answerNotice").html("Congratulation! Your answer is correct.");
	}else{
		$("#answerNotice").html("Unfortunately you answer is not correct.");
	}
	$("#modalForQuiz").modal('show');
}

function changeSearchSource(obj){
	$("#Pagination_Search").html("");
	$("#searchResult").html("");
	$("#bufferResult").html("");
	$("#bufferResult").hide();
	$("#searchResult").show();
	var currentKey = $(obj).parent().parent().find(".tab-content").find(".active").find(".input-search").val();
	if(!currentKey){ return; }
	$(obj).parent().parent().find("#" + $(obj).attr("target")).val(currentKey);
	$(obj).parent().parent().find("#" + $(obj).attr("target")).parent().find(".btn-search").click();	
}


function initTopNodeThumbnail(){
	var SortableItems = new ItemList();
	for(var i=0;i<$("#blackBlocks .EditBlock").length;i++){
	   var id = $($("#blackBlocks .EditBlock")[i]).attr("itemid");
	   var item = Items.find(function(item){ if(item.toJSON().id==id) return item });
	   SortableItems.add(item);
	}	
	nodeThumbnail = "";	
	topNodeThumbnails = new Array();
	SortableItems.each(function(item){
		if(item.toJSON().thumbnail){			
			topNodeThumbnails.push(item.toJSON().thumbnail);
		}
	});
	$("#changeTopNodeThumbnail #currentIndex").html("1");
	$("#changeTopNodeThumbnail #sumPic").html(topNodeThumbnails.length);
	if(topNodeThumbnails.length>0){
		nodeThumbnail = topNodeThumbnails[0];
		$("#nodeTopThumbnail").show();
		$("#changeTopNodeThumbnail").show();
		$("#nodeTopThumbnail").attr("src",topNodeThumbnails[0]);
		if(topNodeThumbnails.length == 1){
			$("#changeTopNodeThumbnail #btnTopNodeThumbnail").hide();
			$("#changeTopNodeThumbnail #lblPicNumber").hide();
		}else{
			$("#changeTopNodeThumbnail #btnTopNodeThumbnail").show();
			$("#changeTopNodeThumbnail #lblPicNumber").show();
		}
	}else{
	    $("#nodeTopThumbnail").attr("src","");
	    $("#nodeTopThumbnail").hide();
	    $("#changeTopNodeThumbnail").hide();
	}
}
function getCurrentTopNodeThumbnail(index){
	var sumPic = topNodeThumbnails.length;
	if(index>0 && index<=sumPic){
		nodeThumbnail = topNodeThumbnails[index-1];
		$("#nodeTopThumbnail").attr('src',topNodeThumbnails[index-1]);
	}	
	if(index<=1){
		$("#btnTopNodeThumbnail_Prev").attr("disabled",true);
		$("#btnTopNodeThumbnail_Next").removeAttr("disabled");
	}else if(index>=sumPic){
		$("#btnTopNodeThumbnail_Next").attr("disabled",true);
		$("#btnTopNodeThumbnail_Prev").removeAttr("disabled");
	}else if(index>1 && index<sumPic){
		$("#btnTopNodeThumbnail_Prev").removeAttr("disabled");
		$("#btnTopNodeThumbnail_Next").removeAttr("disabled");
	}	
}
function hideTopNodeThumbnail(obj){
	if(obj.checked){
	    nodeThumbnail = "";
		$("#changeTopNodeThumbnail #btnTopNodeThumbnail").hide();
		$("#changeTopNodeThumbnail #lblPicNumber").hide();
		$("#nodeTopThumbnail").hide();		
	}else{
		$("#nodeTopThumbnail").show();
		initTopNodeThumbnail();
		if(topNodeThumbnails.length == 1){
			$("#changeTopNodeThumbnail #btnTopNodeThumbnail").hide();
			$("#changeTopNodeThumbnail #lblPicNumber").hide();
		}else{
			$("#changeTopNodeThumbnail #btnTopNodeThumbnail").show();
			$("#changeTopNodeThumbnail #lblPicNumber").show();
		}
	}
}

function getCurrentPic(obj,currentPic){
	var imgsPath = $(obj).parent().find("#imgsPathPanel").html();
	var picList = imgsPath.split(",");
	var sumPic = picList.length;
	if(currentPic>0 && currentPic<=sumPic){
		$(obj).parent().parent().parent().find('.embedImage').attr('src',picList[currentPic-1]);
		var itemId = $(obj).parents(".EditBlock").attr("itemid");
		Items.each(function(item){
			if(item.toJSON().id==itemId){			
				item.attributes.thumbnail = picList[currentPic-1];
				item.attributes.embed = $(obj).parents(".oembedDiv").find(".DisplayBlock").html();
			}
		});
	}
	if(currentPic==1){
		$(obj).parent().find(".UIThumbPagerControl_Button_Left").attr("disabled",true);
		$(obj).parent().find(".UIThumbPagerControl_Button_Right").removeAttr("disabled");
	}else if(currentPic==sumPic){
		$(obj).parent().find(".UIThumbPagerControl_Button_Right").attr("disabled",true);
		$(obj).parent().find(".UIThumbPagerControl_Button_Left").removeAttr("disabled");
	}else if(currentPic>1 && currentPic<sumPic){
		$(obj).parent().find(".UIThumbPagerControl_Button_Left").removeAttr("disabled");
		$(obj).parent().find(".UIThumbPagerControl_Button_Right").removeAttr("disabled");
	}
	console.log(Items);
	initTopNodeThumbnail();
}
function hidePic(obj){
	if(obj.checked){
		$(obj).parent().parent().parent().find('.embedImage').hide();
		$(obj).parent().parent().find('#btnChangePic').hide();
		$(obj).parent().parent().find('.UIThumbPagerControl_Text').hide();
	}else{
		$(obj).parent().parent().parent().find('.embedImage').show();
		var picNum = $(obj).parent().parent().parent().find('#sumPic').html();
		if(parseInt(picNum)>1){			
			if($(obj).parent().parent().find('#imgsPathPanel').html()){
				$(obj).parent().parent().find('#btnChangePic').show();
				$(obj).parent().parent().find('.UIThumbPagerControl_Text').show();
			}
		}else{
			if($(obj).parent().parent().find('#imgsPathPanel').html()){
				$(obj).parent().parent().find('#btnChangePic').hide();
				$(obj).parent().parent().find('.UIThumbPagerControl_Text').hide();
			}
		}		
	}
}
function showDetailIframe(obj,src){
	var top = $(obj).parent().parent();
	if(obj.checked){
		$(top).find("#urlDetailContent").hide();
		if($(top).find("#urlDetailIframe").html()){
			$(top).find("#urlDetailIframe").show();
		}else{
			$(top).find("#urlDetailIframe").html("<iframe style='width:99%; height:500px;' src=\'"+src+"\'></iframe>");
		}
	}else{
		$(top).find("#urlDetailContent").show();
		$(top).find("#urlDetailIframe").hide();
	}
}

function saveItemsToBuffer(obj){
    var urlObj = $(obj).parent().parent().find('.uri');
    var activeObj = $("#searchPanel").find(".active");
    var source = "OER";
    var sourceUrl,href;
    if(activeObj){
       source = getSourceByTarget(activeObj.attr("target"));
    }
    if(urlObj)
    {
        href = urlObj.attr("href");
        if(!href)
        {
            href = urlObj.attr("sourceUrl");
        }
    }
    $.ajax( {
        url: apiURL + "/bufferItem",
        data: {"href":href},
        dataType: "json",
        success: function(data) {
            if(!data)
            {
                saveBufferBySource(source,href);
            }
        }
    });
}

//save the Buffer data
function saveBufferBySource(source,href){
    $.ajax( {
        type: 'POST',
        url: apiURL + "/bufferItem",
        data: {"id":$("#nodeid").html(),"source":source,"href":href},
        dataType: "json",
        success: function(data) {
            if(data.error){
                alert("save bufferData wrong!");
                return;
            }
        }
    });
}


function removeItemsFromBuffer(obj){
    var urlObj = $(obj).parent().parent().find('.uri');
    var bufferId = "";
    if(urlObj)
    {
        bufferId = urlObj.attr("nodeId");
    }
    $.ajax( {
        type: 'DELETE',
        url: apiURL + "/bufferItem",
        data: {"id":bufferId},
        dataType: "json",
        success: function(data) {
            if(data.msg == 'success'){
                $(obj).parent().parent().parent().remove();
            }
            if(data.error){
                alert("delete bufferData wrong!");
                return;
            }
        }
    });
}


function getSourceByTarget(target){
    var source = "";
    source = target.replace(/keyWork-/g,"");
    return source;
}

function playYoutubeVideo(obj,sec){
	var iframeId = "";
	if($(obj).parents(".oembedDiv").length>0){
		iframeId = "youtubePlayer" + $(obj).parents(".oembedDiv").attr("id").substr(9);
	}else{
		iframeId = "youtubePlayer_" + $("#displayblocks .tbDisplay").find("iframe").index($(obj).parents(".tbDisplay").find("iframe"));
	}
	if(!player || player.a.id != iframeId){
		$(obj).parents(".tbDisplay").find("iframe").attr("id",iframeId);
		player = new YT.Player(iframeId, {
			events: {
				'onReady': function(event){ 
					player.seekTo(sec,true);
					player.playVideo();
				}
			}
		});
	}else{
		player.seekTo(sec,true);
		player.playVideo();
	}
}
function deleteRepeater(arr){
	var obj={};
	var a = []; 
	for(var i=0;i<arr.length;i++){
		if(arr[i] && (!((arr[i]) in obj))){
			a.push(arr[i]);
		}
		obj[arr[i]]="";
	}
	return a;
}

function customSubstr(str,index){
	var resultIndex = 0;
	tempStr = str.substr(0,200);
	if(str[199] == " "||str[199] == ","||str[199] == "."){ return tempStr; }
	resultIndex = tempStr.lastIndexOf(" ");
	resultIndex = (tempStr.lastIndexOf(",")>resultIndex)? tempStr.lastIndexOf(","):resultIndex;
	resultIndex = (tempStr.lastIndexOf(".")>resultIndex)? tempStr.lastIndexOf("."):resultIndex;
	resultIndex = (str.indexOf(" ",index)-200<Math.abs(200-resultIndex))? str.indexOf(" ",index):resultIndex;
	resultIndex = (str.indexOf(",",index)-200<Math.abs(200-resultIndex))? str.indexOf(",",index):resultIndex;
	resultIndex = (str.indexOf(".",index)-200<Math.abs(200-resultIndex))? str.indexOf(".",index):resultIndex;	
	return str.substr(0,resultIndex);
}

function makeSignedRequest(ck,cks,encodedurl) { 
	var accessor = { consumerSecret: cks, tokenSecret: ""};          
	var message = { action: encodedurl, method: "GET", parameters: [["oauth_version","1.0"],["oauth_consumer_key",ck]]}; 
	OAuth.setTimestampAndNonce(message);
	OAuth.SignatureMethod.sign(message, accessor); 
	var parameterMap = OAuth.getParameterMap(message);
	var baseStr = OAuth.decodeForm(OAuth.SignatureMethod.getBaseString(message));           
	var theSig = "";
 
	if (parameterMap.parameters) {
		for (var item in parameterMap.parameters) {
			for (var subitem in parameterMap.parameters[item]) {
				if (parameterMap.parameters[item][subitem] == "oauth_signature") {
					theSig = parameterMap.parameters[item][1];                    
					break;                      
				}
			}
		}
	}
 
	var paramList = baseStr[2][0].split("&");
	paramList.push("oauth_signature="+ encodeURIComponent(theSig));
	paramList.sort(function(a,b) {
		if (a[0] < b[0]) return -1;
		if (a[0] > b[0]) return 1;
		if (a[1] < b[1]) return  -1;
		if (a[1] > b[1]) return 1;
		return 0;
	});
 
	var locString = "";
	for (var x in paramList) {
		locString += paramList[x] + "&";                
	} 
	var finalStr = baseStr[1][0] + "?" + locString.slice(0,locString.length - 1); 
	return finalStr;
};

function selectText() {
	if (document.selection) {//IE
		return document.selection.createRange().text;
	}else{//标准
		return window.getSelection().toString();
	}
}
function myExecCommand(commondName,mode,value){
	document.designMode = "On";
	document.contentEditable = true;
	document.execCommand(commondName,mode,value);
	document.designMode = "Off";
	document.contentEditable = false;
}

function getNotes4ThisPage(url){
	$.ajax({
		type: 'GET',
		url: apiURL + "/getNotesByUrl",
		data: { "pageurl":document.location.href },
		dataType: "json",
		success: function(data) {
			if(!data){ return; }
			for(var i=0;i<data.length;i++){
				if(!data[i].text){ continue; }
				var hightLightList = data[i].text.split("\n");
				for(var j=0;j<hightLightList.length;j++){					
					findInPage(hightLightList[j]);
					yellowBgApplier.toggleSelection();
					window.getSelection().removeAllRanges();
				}
			}
		}
	});
}
function initNotePage(){
	rangy.init();
	var cssClassApplierModule = rangy.modules.CssClassApplier;
	 if (rangy.supported && cssClassApplierModule && cssClassApplierModule.supported) {
		yellowBgApplier = rangy.createCssClassApplier("yellowBg", {
			tagNames: ["span", "a", "b"]
		});
	}

	$(document).bind("mouseup", function (e) {
		var e = $.event.fix(e);
		var iX = e.pageX,
		iY = e.pageY;
		if(selectText().length > 8) {
			setTimeout(function () {
				$("#sendHighlightText").css({
					"left": iX + "px",
					"top": iY + "px"
				}).fadeIn();
			}, 200);
		} else {
			$("#sendHighlightText").hide();
		}
	});

	$(document).click(function () { $("#sendHighlightText").hide(); });
			
	$("#sendHighlightText").click(function (e) {
		setTimeout(function () {$("#sendHighlightText").hide();}, 200);
		$.ajax({
			type: 'POST',
			url: apiURL + "/saveNotesForPage",
			data: { "pageurl":document.location.href,"text":selectText() },
			dataType: "json",
			success: function(data) {
				//myExecCommand('BackColor',false,'red');
				yellowBgApplier.toggleSelection();
			}
		});
		
		e.preventDefault();
		return false;
	});
}

function findInPage(str) {

    var win = window;
    var DOM = (document.getElementById) ? 1 : 0;
    var NS4 = (document.layers) ? 1 : 0;
    var IE4 = 0;
    if (document.all) {
        IE4 = 1;
        DOM = 0;
    }
    var txt, i, found;
    if (str == "") return false;
    if (DOM) {
		win.find(str, false, false);
        return true;
    }
    if (NS4) {
        if (!win.find(str)) while (win.find(str, false, false)) searchIndex++;
        else searchIndex++;
    }
    if (IE4) {
        txt = win.document.body.createTextRange();
        for (i = 0; i <= searchIndex && (found = txt.findText(str)) != false; i++) {
            txt.moveStart("character", 1);
            txt.moveEnd("textedit");
        }
        if (found) {
            txt.moveStart("character", -1);
            txt.findText(str);
            txt.select();
            searchIndex++;
        } else {
            if (searchIndex > 0) {
                searchIndex = 0;
                findInPage(str);
            }
        }
    }	
	
    return false;
}

var imgReady = (function () {
    var list = [], intervalId = null,
    tick = function () {
        var i = 0;
        for (; i < list.length; i++) {
            list[i].end ? list.splice(i--, 1) : list[i]();
        };
        !list.length && stop();
    },
    stop = function () {
        clearInterval(intervalId);
        intervalId = null;
    };

    return function (url, ready, load, error) {
        var onready, width, height, newWidth, newHeight,
            img = new Image();

        img.src = url;
        if (img.complete) {
            ready.call(img);
            load && load.call(img);
            return;
        };
        width = img.width;
        height = img.height;
        img.onerror = function () {
            error && error.call(img);
            onready.end = true;
            img = img.onload = img.onerror = null;
        };
        onready = function () {
            newWidth = img.width;
            newHeight = img.height;
            if (newWidth !== width || newHeight !== height ||
                newWidth * newHeight > 1024
            ) {
                ready.call(img);
                onready.end = true;
            };
        };
        onready();
        img.onload = function () {
            !onready.end && onready();
            load && load.call(img);
            img = img.onload = img.onerror = null;
        };
        if (!onready.end) {
            list.push(onready);
            if (intervalId === null) intervalId = setInterval(tick, 40);
        };
    };
})();