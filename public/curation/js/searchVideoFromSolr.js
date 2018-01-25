var baseURL = 'http://133.164.60.100/solr/browse';
var sourceTemp = new Array();
var tagTemp = new Array();
var contentTemp = new Array();
var moreContentTemp = new Array();
var currentTemp = new Array();
(function($){
	window.Item = Backbone.Model.extend({   
		defaults: function() {	
		  return {
			name: "",
			num: "",
			url: ""	,
			urlvalue: "",
			point: "",
			path: "",
			currentPath: ""
		  };
		}	
	});
	window.ItemList = Backbone.Collection.extend({  
		model: Item,  
		initialize: function() {
		}
	});
	window.SourceView = Backbone.View.extend({  
		tagName:  "li",
		template: _.template($('#source-template').html()),      
		render: function() {	
			$(this.el).html(this.template(this.model.toJSON()));     
		return this;
		}  	
	});  
	window.TagView = Backbone.View.extend({  
		tagName:  "li",
		template: _.template($('#tag-template').html()),      
		render: function() {	
			$(this.el).html(this.template(this.model.toJSON()));     
		return this;
		}  	
	}); 

    window.AppView = Backbone.View.extend({ 
		initialize: function() {
			NavigationParam();
			getData(1,6);	
		},
		render: function() {	
		  this.$el.html(this.template(this.model.toJSON()));     
		  return this;
		}
	});

	var SolrData = Backbone.Model.extend({   
    defaults: function() {	
      return {
        type: "",
        uri: "",
		title: "",
		content: "",
		thumbnail: "",
		author: "",
		category: "",
		updatedDate: ""
      };
    }	
  });
  
  window.solrDataList = Backbone.Collection.extend({  
    model: SolrData,  
	initialize: function() {
    }
  });
	window.SorlView = Backbone.View.extend({  
	tagName:  "li",
	template: _.template($('#searchResultHasVideo').html()),      
	render: function() {	
		$(this.el).html(this.template(this.model.toJSON()));     
			return this;
		}  	
	});  
	window.SorlView2 = Backbone.View.extend({  
	tagName:  "li",
	template: _.template($('#searchResultHasVideo2').html()),      
	render: function() {	
		$(this.el).html(this.template(this.model.toJSON()));     
			return this;
		}  	
	});
	
	window.MoreLikeThisView = Backbone.View.extend({  
	tagName:  "li",
	template: _.template($('#moreLikeThis').html()),      
	render: function() {	
		$(this.el).html(this.template(this.model.toJSON()));     
			return this;
		}  	
	});
	window.appView = new AppView();	
})(jQuery);	

function showNavigation(search_result){
   var str = "";
   var facet_fields = search_result.facet_counts.facet_fields;		 
   var url=this.location.toString(); 
   if(url.indexOf("&mlt=true&")>0){
	url = url.replace(/&mlt=true&/g,"&");
   }
   var fq_list = url.indexOf('?')>0 ? url+"&":url+"?q=&";
   for(var facet_field in facet_fields){ 		
		for(var j=0;j<facet_fields[facet_field].length ;j=j+2){
			var name = facet_fields[facet_field][j] ;
			var num = facet_fields[facet_field][j+1]+"";
			var urlvalue = facet_fields[facet_field][j];
			var point = facet_fields[facet_field][j];
			if((name.length + num.length)>25){
				var length = (25 - num.length);				
				name = name.substring(0,length);
				name +="...";
			}
			if(urlvalue !="" && urlvalue.indexOf("http://")>-1){
				urlvalue = urlvalue.replace(/http:\/\//,"%22http%3A%2F%2F").replace(/\//g,"%2F").replace(/#/g,"%23");
				urlvalue+="%22";
			}
			if (facet_field == 'author'){
				var dataTemp = {};
				dataTemp.name = name;
				dataTemp.urlvalue = urlvalue;
				if(name.indexOf("...")>0){
				dataTemp.point = point;
				}
				dataTemp.num = facet_fields[facet_field][j+1];				
				dataTemp.url = fq_list;
				sourceTemp.push(dataTemp);
				
			}else if(facet_field == 'category'){
				var dataTemp2 = {};
				dataTemp2.name = name;
				dataTemp2.urlvalue = urlvalue;
				if(name.indexOf("...")>0){
				dataTemp2.point = point;
				}
				dataTemp2.num = facet_fields[facet_field][j+1];
				dataTemp2.url = fq_list;
				tagTemp.push(dataTemp2);
			}else{				
			}
		}		
	}	
 }

function NavigationParam(){
	var url=this.location.toString();
	var urlstr = url.substring(0,url.indexOf('?'));
	var reg = url.indexOf("&")>-1 ? /\?q=(.{0,})&{1,}/ : /\?q=(.{0,})&{0,}/;
	var reg2 = /\?q=(.{0,})&{0,}/;
	var result = reg.exec(url) ==null ? "" : reg.exec(url)[1];
	if(result !="" && result.indexOf("&")>-1){
	result = result.substring(0,result.indexOf("&"));
	}
	result = result.replace(/%20/g," ").replace(/%22/g,"\"");
	var result2 = reg2.exec(url) ==null ? "" : reg2.exec(url)[1];
	$("#xlInput").val(result);	
	var inputstr ="";	
	if(url.indexOf("id:")>-1 && result2 != ""){
		inputstr = result2.substring(result2.indexOf(":")+1,result2.indexOf("&"));
		$("#xlInput").val("id:"+inputstr);
	}
	var str = "";
	if("" != result){
		  if(inputstr !="" && url.indexOf(inputstr)>-1){
			str = '<li style="display: inline;"><span><a href="'+urlstr+'?q=id:'+inputstr+'&mlt=true">'+inputstr+'</a></span> <span class="divider">/</span></li>';
		 }else{
			if(result=="id"){
				str = '<li style="display: inline;"><span><a href="'+urlstr+'?q=">'+result+'</a></span> <span class="divider">/</span></li>';
			}
			str = '<li style="display: inline;"><span><a href="'+urlstr+'?q='+result+'">'+result+'</a></span> <span class="divider">/</span></li>';
		 }		
	}else{
		 str = '<li style="display: inline;"><span><a href="'+urlstr+'">ALL</a></span> <span class="divider">/</span></li>';
	}
	
	var path = "";
	if(url.indexOf('&')>0){
		path = url.substring(url.indexOf('&'));
	}
	path = path.replace(/&fq=/g,'#@*');
	var fqValue = new Array();
	fqValue = path.split('#@*');
	fqValue = deleteRepeater(fqValue);
	if(fqValue.length != undefined){
		for(var i=1;i<fqValue.length-1;i++){
			if(result=="id"){
				result ='&fq='+fqValue[i];
			}
			else{
			result = result + '&fq='+fqValue[i];
			}
			 str += '<li style="display: inline;"><span><a href='+urlstr+'?q='+result+'>'+fqValue[i]+'</a></span> <span class="divider">/</span></li>';			
		}
	}
	if(url.indexOf("&fq")>-1){
	str = str + '<p>'+fqValue[fqValue.length-1]+'</p>'
	}
	
	$("#navigation2").html(str);
}

function getData(pageIndex,iCPP){
	var localURL = this.location.toString();
	var url = baseURL;
	if(localURL.indexOf('?')>0){
		url += localURL.substring(localURL.indexOf('?'));
	}
	$("#searchContent").html("");
	$("#hiddenresult").html("");
	currentPageIndex = pageIndex;
	var start = (pageIndex-1)*iCPP;
	if(url.indexOf("mlt=true")>-1){
		$.ajax({
		 url: url,
		 'data': {'wt':'json'},
		 dataType: "jsonp",
		 jsonp: 'json.wrf',
		 success: function(data) {	 
			if(data.response.numFound == 0){
				$("#searchContent").html($("#tpl-searchEmpty").html());
				$("#Pagination_bottom").html("");			
				$("#lblRecordCount").html("<strong>0</strong>&nbsp;&nbsp;results found in  ");
				$("#lblTimeCount").html("<strong>1</strong>&nbsp;&nbsp;ms");
				return;
			}
			pageCount = Math.ceil((data.response.numFound)/iCPP);
			if(pageIndex == 1){
				var pageDiv = "";
				for(var i=0;i<pageCount;i++){
					pageDiv += "<div class='result'></div>"
				}
				$("#hiddenresult").html(pageDiv);
				initPageNation();
			}
			sourceTemp = new Array();
			tagTemp = new Array();
			contentTemp = new Array();
			moreContentTemp = new Array();
			currentTemp = new Array();
			$("#source").html("");
			$("#tag").html("");
			$("#data-list").html("");			
			showMoreLikeThis(data);			
			var Sources = new ItemList();
			var Tags = new ItemList();
			var sorldata = new solrDataList();
			var moresorldata = new solrDataList();
			Sources.reset(sourceTemp);	
			Tags.reset(tagTemp);
			sorldata.reset(currentTemp);			
			moresorldata.reset(moreContentTemp);			
			Sources.each(function(item){
				if(item != undefined){
					var sourceView = new SourceView({model:item});
					$("#source").append(sourceView.render().el);
				}
			});
			Tags.each(function(item){
				if(item != undefined){
					var tagView = new TagView({model:item});
					$("#tag").append(tagView.render().el);
				}
			});
			sorldata.each(function(item){
				if(item != undefined){
					var moreLikeThisView = new MoreLikeThisView({model:item});					
					$("#morelikethis-list").append(moreLikeThisView.render().el);
					$("#morelikethis-list").append("<br/><h5>Similar Items</h5>");
				}
			});
			moresorldata.each(function(item){
				if(item != undefined){
					var moreLikeThisView = new MoreLikeThisView({model:item});					
					$("#morelikethis-list").append(moreLikeThisView.render().el);
				}
			});
			
			}
		});
	
	}else{
		$.ajax({
		 url: url,
		 'data': {'wt':'json', 'start':start, 'rows':iCPP},
		 dataType: "jsonp",
		 jsonp: 'json.wrf',
		 error: function(){
				$("#searchContent").html($("#tpl-searchEmpty").html());
				$("#Pagination_bottom").html("");			
				$("#lblRecordCount").html("<strong>0</strong>&nbsp;&nbsp;results found in  ");
				$("#lblTimeCount").html("<strong>1</strong>&nbsp;&nbsp;ms");
				return;
		},
		 success: function(data) {
			if(data.response.numFound == 0){				
				$("#searchContent").html($("#tpl-searchEmpty").html());
				$("#Pagination_bottom").html("");			
				$("#lblRecordCount").html("<strong>0</strong>&nbsp;&nbsp;results found in  ");
				$("#lblTimeCount").html("<strong>1</strong>&nbsp;&nbsp;ms");
				return;
			}
			pageCount = Math.ceil((data.response.numFound)/iCPP);
			if(pageIndex == 1){
				var pageDiv = "";
				for(var i=0;i<pageCount;i++){
					pageDiv += "<div class='result'></div>"
				}
				$("#hiddenresult").html(pageDiv);
				initPageNation();
			}
			sourceTemp = new Array();
			tagTemp = new Array();
			contentTemp = new Array();
			$("#source").html("");
			$("#tag").html("");
			$("#data-list").html("");
			
			show(data,iCPP);			
			var Sources = new ItemList();
			var Tags = new ItemList();
			var sorldata = new solrDataList();
			Sources.reset(sourceTemp);	
			Tags.reset(tagTemp);
			sorldata.reset(contentTemp);
			Sources.each(function(item){
				if(item != undefined){
					var sourceView = new SourceView({model:item});
					$("#source").append(sourceView.render().el);
				}
			});
			Tags.each(function(item){
				if(item != undefined){
					var tagView = new TagView({model:item});
					$("#tag").append(tagView.render().el);
				}
			});
			sorldata.each(function(item){
				if(item != undefined){
					var sorlView2 = new SorlView2({model:item});
					$("#data-list").append(sorlView2.render().el);
				}
			});
			
			}
		});
	}	
	
}


function initPageNation(){  
	var num_entries = $("#hiddenresult div.result").length;
	$("#Pagination_bottom").pagination(num_entries, {
		num_edge_entries: 1, 
		num_display_entries: 10, 
		items_per_page:1,
		link_to:"getData(__id__,12)"
	});   
}


function show(jsonData,iCPP){
	var index = 0;
	var objs = null;
	var imgTable = "";
	objs = jsonData.response.docs;
	showNavigation(jsonData);	
	$("#lblRecordCount").html("<strong>"+jsonData.response.numFound+"</strong>&nbsp;&nbsp; results found in  ");
	$("#lblTimeCount").html("<strong>"+jsonData.responseHeader.QTime+"</strong>&nbsp;&nbsp; ms");
	var url=this.location.toString();
	for(var i=0;i<iCPP;i++){			
		if(objs.length>index){
			var obj = objs[index];
			if(jsonData.feed != undefined){	
			}else{
				var type = obj.type;						
				var uri = obj.uri;
				var title = obj.title;						
				var content = obj.content;
				var id = obj.id;
				var currentPath = url;
				var author = obj.author;
				var category = obj.category;
				var updatedDate =obj.updatedDate;
			}
			var thumbnail =null;
			if(obj !=undefined && null != obj.thumbnail  ){
			thumbnail = obj.thumbnail[0];
			}			
			var dataTemp = {};
			dataTemp.type = type;
			dataTemp.uri = uri;
			dataTemp.title = title;
			dataTemp.content = content;
			dataTemp.thumbnail = thumbnail;	
			var regStr = url.indexOf("&")>0? /\?q=.{0,}&{1,}/g : /\?q=.{0,}&{0,}/g;
			dataTemp.path = url.indexOf('?')>0 ? url.replace(regStr,"?q=id:"+id+"&mlt=true&") : url+"?q=id:"+id+"&mlt=true";		
			dataTemp.author = author;
			dataTemp.category = category;
			dataTemp.updatedDate = updatedDate;
			contentTemp.push(dataTemp); 
			index++;				
		}
	}
}

function showMoreLikeThis(jsonData){
	var index = 0;
	var objs = null;
	var imgTable = "";
	var url=this.location.toString();	
	var reg2 = /\?q=(.{0,})&{0,}/;	
	var result2 = reg2.exec(url) ==null ? "" : reg2.exec(url)[1];
	showNavigation(jsonData);
	$("#lblRecordCount").html("<strong>"+jsonData.response.numFound+"</strong>&nbsp;&nbsp; results found in  ");
	$("#lblTimeCount").html("<strong>"+jsonData.responseHeader.QTime+"</strong>&nbsp;&nbsp; ms");
	var bean = jsonData.response.docs[0];	
	var thumbnail =null;
	if(bean !=undefined && null != bean.thumbnail  ){
	thumbnail = bean.thumbnail[0];
	}			
	var temp = {};
	temp.type = bean.type;
	temp.uri = bean.uri;
	temp.title = bean.title;
	temp.content = bean.content;
	temp.thumbnail = thumbnail;
	var regStr = url.indexOf("&")>0? /\?q=.{0,}&{1,}/g : /\?q=.{0,}&{0,}/g;
	temp.path = url.indexOf('?')>0 ? url.replace(regStr,"?q=id:"+bean.id+"&") : url+"?q=id:"+bean.id;
	temp.currentPath = url;
	temp.author = bean.author;
	temp.category = bean.category;
	temp.updatedDate = bean.updatedDate;
	currentTemp.push(temp);
	var Idstr ="";	
	if(url.indexOf("id:")>-1 && result2 !=""){
		Idstr = result2.substring(result2.indexOf(":")+1,result2.indexOf("&"));	
	}
	objs = jsonData.moreLikeThis[Idstr].docs;	
	if(objs.length != undefined){
		for(var i=0;i<objs.length;i++){
			if(objs[i] !=undefined && null != objs[i].thumbnail  ){
				objs[i].thumbnail = objs[i].thumbnail[0];
			}
			var regStr = url.indexOf("&")>0? /\?q=.{0,}&{1,}/g : /\?q=.{0,}&{0,}/g;
			objs[i].path = url.indexOf('?')>0 ? url.replace(regStr,"?q=id:"+objs[i].id+"&") : url+"?q=id:"+objs[i].id;	
		}
		moreContentTemp = objs;
	}
}

function searchData(){
	var urlstr = this.location.toString();
	var regStr = urlstr.indexOf("&")>0? /\?q=.{0,}&{1,}/g : /\?q=.{0,}&{0,}/g;
	var newurl = urlstr.indexOf('?')>0? urlstr.replace(regStr,"?q="+$("#xlInput").val()+"&"):urlstr+="?q="+$("#xlInput").val();
	if(newurl.lastIndexOf('&')==newurl.length-1){newurl=newurl.substr(0,newurl.length-1);}
	window.location.href = newurl;
}

function deleteRepeater(arr){
 var obj={};
 var a = []; 
 for(var i=0;i<arr.length;i++){
	if(!((arr[i]) in obj)){
       a.push(arr[i]);
     }
	 obj[arr[i]]="";
	 }
 return a;
}
