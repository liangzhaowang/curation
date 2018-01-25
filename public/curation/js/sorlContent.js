var baseURL = conf.get_SOLR_URL() + '/browse';
var sourceTemp = new Array();
var tagTemp = new Array();
var contentTemp = new Array();
var moreContentTemp = new Array();
var currentTemp = new Array();
var searchNum = 0;
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
			getData(1,10);
		},
		render: function() {	
		  this.$el.html(this.template(this.model.toJSON()));     
		  return this;
		}
	});

	var SolrData = Backbone.Model.extend({   
    defaults: function() {	
      return {
		id:"",
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
	tagName:  "tr",
	template: _.template($('#searchResultHasVideo').html()),      
	render: function() {	
		$(this.el).html(this.template(this.model.toJSON()));     
			return this;
		}  	
	});
	
	window.MoreLikeThisView = Backbone.View.extend({  
	tagName:  "tr",
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
   if(!search_result.facet_counts){ return; }
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
	url = decodeURI(url);
	var urlstr = url.substring(0,url.indexOf('?'));
	var reg = url.indexOf("&")>-1 ? /\&q=(.{0,})&{1,}/ : /\?q=(.{0,})&{0,}/;
	var reg2 = /\&q=(.{0,})&{0,}/;
	var result = reg.exec(url) ==null ? "" : reg.exec(url)[1];
	if(result !="" && result.indexOf("&")>-1){
		result = result.substring(0,result.indexOf("&"));
	}
	result = result.replace(/%20/g," ").replace(/%22/g,"\"");
	var result2 = reg2.exec(url) ==null ? "" : reg2.exec(url)[1];
	
	if($("#searchScope").length>0){
		if($("#defaultCondition").html().indexOf("privacy")>-1){
			$("#searchScope option[value='1']").attr("selected","selected");
		}else{
			$("#searchScope option[value='2']").attr("selected","selected");
		}
	}
	result = result.substr(1,result.length-2);
	$("#xlInput").val(result);	
	if(url.indexOf("&sort=")>-1){
		$("#sortBy").val("0");
	}else{
		$("#sortBy").val("1");
	}
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
	}
	else{
		str = '<li style="display: inline;"><span><a href="'+urlstr+'">ALL</a></span> <span class="divider">/</span></li>';
	}
	
	var path = "";
	if(url.indexOf('&')>0){
		path = url.substring(url.indexOf('&'));
	}
	path = path.replace(/&fq=/g,'#@*');
	path = path.replace(/&updatedDate/g,'#@*updatedDate');
	var fqValue = new Array();
	fqValue = path.split('#@*');
	fqValue = deleteRepeater(fqValue);
	if(fqValue.length != null){
		for(var i=3;i<fqValue.length-1;i++){
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
}

function getData(pageIndex,iCPP){
	var localURL = this.location.toString();
	var url = baseURL;
	if(localURL.indexOf('?')>0){
		url += localURL.substring(localURL.indexOf('?'));
	}
	if($("#mltCondition").html() != "undefined"){
		//url = baseURL + "?q=id:"+$("#mltCondition").html()+"&mlt=true";
		if(url.indexOf("?")>-1){
		url += "&q=id:"+$("#mltCondition").html()+"&mlt=true";
		}else{
		url += "?q=id:"+$("#mltCondition").html()+"&mlt=true";
		}
	}
	if($("#tagCondition").html()  != "undefined"){
		//url = baseURL + "?fq=category:" + $("#tagCondition").html();
		if(url.indexOf("?")>-1){
		url += "&fq=category:" + $("#tagCondition").html();
		}else{
		url += "?fq=category:" + $("#tagCondition").html();
		}
	}
	url += "&fq=type:curation_node";
	url += "&fq=" + $("#defaultCondition").html();
	if($("#sortBy").find("option:selected").val() ==0){
		url += "&sort=updatedDate desc";
	}
	$("#searchContent").html("");
	$("#hiddenresult").html("");
	if(localURL.indexOf('?')<0){
		localURL += '?';
	}else{
		localURL += '&';
	}
	var start = (pageIndex-1)*iCPP;
	if(url.indexOf("&mlt=true")>-1){
		$.ajax({
		 url: url,
		 'data': {'wt':'json'},
		 dataType: "jsonp",
		 jsonp: 'json.wrf',
		 success: function(data) {
			if(data.response.numFound == 0){
				$("#searchContent").html($("#tpl-searchEmpty").html());
				$("#Pagination_Search").html("");			
				$("#lblRecordCount").html("<strong>0</strong>&nbsp;&nbsp;results found in  ");
				$("#lblTimeCount").html("<strong>1</strong>&nbsp;&nbsp;ms");
				return;
			}
			searchNum = data.response.numFound;
			sourceTemp = new Array();
			tagTemp = new Array();
			contentTemp = new Array();
			moreContentTemp = new Array();
			currentTemp = new Array();
			$("#source").html("");
			$("#tag").html("");
			$("#data-list").html("");			
			showMLTNode(data);
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
					if(moresorldata.length>0){
						$("#morelikethis-list").append("<tr><td colspan='2' style='background-color:#FAFAFA; height: 30px;vertical-align:bottom'><h4>Similar Items<h4><td><tr>");
					}
				}
			});
			moresorldata.each(function(item){
				if(item != undefined){
					var moreLikeThisView = new MoreLikeThisView({model:item});					
					$("#morelikethis-list").append(moreLikeThisView.render().el);
				}
			});
			createPagenationStr(searchNum,10,pageIndex);
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
				$("#Pagination_Search").html("");			
				$("#lblRecordCount").html("<strong>0</strong>&nbsp;&nbsp;results found in  ");
				$("#lblTimeCount").html("<strong>1</strong>&nbsp;&nbsp;ms");
				return;
			},
			success: function(data) {
				if(data.response.numFound == 0){				
					$("#searchContent").html($("#tpl-searchEmpty").html());
					$("#Pagination_Search").html("");			
					$("#lblRecordCount").html("<strong>0</strong>&nbsp;&nbsp;results found in  ");
					$("#lblTimeCount").html("<strong>1</strong>&nbsp;&nbsp;ms");
					return;
				}
				var start = parseInt(data.responseHeader.params.start);
				var rows = parseInt(data.responseHeader.params.rows);
				var numFound = parseInt(data.response.numFound);
				var page = Math.ceil((start+1)/rows);
				var hasNext = true;
				if((start+rows)>=numFound){ hasNext = false; }
				//customPagination(page,hasNext,iCPP);
				searchNum = numFound;
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
						var sorlView = new SorlView({model:item});
						$("#data-list").append(sorlView.render().el);
					}
				});
			    createPagenationStr(searchNum,10,pageIndex);
			}
		});
	}
}

function show(jsonData,iCPP){
	var index = 0;
	var imgTable = "";
	contentTemp = jsonData.response.docs;
	showNavigation(jsonData);	
	$("#lblRecordCount").html("<strong>"+jsonData.response.numFound+"</strong>&nbsp;&nbsp; results found in  ");
	$("#lblTimeCount").html("<strong>"+jsonData.responseHeader.QTime+"</strong>&nbsp;&nbsp; ms");
	$("#sortSelect").show();
}

function showMLTNode(jsonData){
	var index = 0;
	var objs = null;
	var imgTable = "";
	var url=this.location.toString();	
	var reg2 = /\?q=(.{0,})&{0,}/;	
	var result2 = reg2.exec(url) ==null ? "" : reg2.exec(url)[1];
	showNavigation(jsonData);
	$("#sortSelect").show();
	if(!jsonData.response){ return; }
	var bean = jsonData.response.docs[0];
	$("#lblRecordCount").html("<strong>"+jsonData.moreLikeThis[bean.id].numFound+"</strong>&nbsp;&nbsp; results found in  ");
	$("#lblTimeCount").html("<strong>"+jsonData.responseHeader.QTime+"</strong>&nbsp;&nbsp; ms");
		
	var thumbnail =null;
	if(bean !=undefined && null != bean.thumbnail  ){
		thumbnail = bean.thumbnail[0];
	}
	var temp = {};
	temp.id = bean.id;
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
	
	objs = jsonData.moreLikeThis[bean.id].docs;	
	if(objs.length >0){
		for(var i=0;i<objs.length;i++){
			if(objs[i]  && objs[i].thumbnail  ){
				objs[i].thumbnail = objs[i].thumbnail[0];
			}
			var regStr = url.indexOf("&")>0? /\?q=.{0,}&{1,}/g : /\?q=.{0,}&{0,}/g;
			objs[i].path = url.indexOf('?')>0 ? url.replace(regStr,"?q=id:"+objs[i].id+"&") : url+"?q=id:"+objs[i].id;	
		}
		moreContentTemp = objs;
	}
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


function sortResearch(obj){
	var newurl = this.location.toString();	
	if($(obj).find("option:selected").val() ==0){	
		if(newurl.indexOf('sort=')<0){
			if(newurl.indexOf("?")>-1){
				newurl += "&sort=updatedDate desc";
			}else{
				newurl += "?q=&sort=updatedDate desc";
			}
		}
	}else{
		var reg = /sort=(.*?)(&|$)/;
		var temp = reg.exec(newurl)[0];
		newurl = newurl.replace(temp,"");
	}
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


function createPagenationStr(count,numPerPage,pageIndex){
    $(".pagination").html("");
    $(".pagination").append("<ul></ul>");
    var index = Math.ceil(pageIndex/10) -1;
    var prevActive = pageIndex>1 ? "":"disabled";
    var nextActive = pageIndex<Math.ceil(count/numPerPage) ? "":"disabled";         
    if(prevActive == "disabled"){
        $(".pagination ul").append("<li class='prev "+prevActive+"'><a onclick=''>Prev</a></li>");
    }else{
        $(".pagination ul").append("<li class='prev "+prevActive+"'><a onclick='getData("+(pageIndex-1)+","+numPerPage+")'>Prev</a></li>");
    }
    for(var i=0;i<10;i++){
        if(index*10+i+1 > Math.ceil(count/numPerPage)) { break; }
        if((index*10+i+1) == pageIndex){
            $(".pagination ul").append("<li class='active'><a onclick='getData("+(index*10+i+1)+","+numPerPage+")'>"+(index*10+i+1)+"</a></li>");
        }else{
            $(".pagination ul").append("<li><a onclick='getData("+(index*10+i+1)+","+numPerPage+")'>"+(index*10+i+1)+"</a></li>");
        }
    }
    if(nextActive == "disabled"){
        $(".pagination ul").append("<li class='next "+nextActive+"'><a onclick=''>Next</a></li>");
    }else{
        $(".pagination ul").append("<li class='next "+nextActive+"'><a onclick='getData("+(pageIndex+1)+","+numPerPage+")'>Next</a></li>");
    }
}
