var conf = configSingleton();
var baseURL = conf.get_SOLR_VIDEOSEARCH_URL();


(function ($) {
    function processRawData(plot, series, datapoints) {
		var handlers = {
			image: function (ctx, x, y, radius, shadow) {		
				var img = new Image();
				img.src =  series.points.image.pop();
				img.style.cursor = "pointer";
				img.onload = function(){
					ctx.drawImage(img,x+16,y-24,50,50);
				}
			}
		}	
        var s = series.points.symbol;
        if (handlers[s]){
			series.points.symbol = handlers[s];			
		}
    }   
    function init(plot) {
        plot.hooks.processDatapoints.push(processRawData);
    }   
    $.plot.plugins.push({
        init: init,
        name: 'symbol',
        version: '1.0'
    });
})(jQuery);

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

    window.AppView = Backbone.View.extend({ 
		initialize: function() {
			var localURL = window.location.toString();
			//if(localURL.indexOf("?")<0){ 
			//	getCloudData();
			//	return; 
			//}
			getData(1,20);	
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
 
	window.appView = new AppView();	
})(jQuery);	

function getData(pageIndex,iCPP){
	$("#AjaxLoader").show();
	var localURL = this.location.toString();
	var url = baseURL;
	if(localURL.indexOf('?')>0){
		var paramStr = localURL.substring(localURL.indexOf('?'));
		if(paramStr !="" && paramStr.indexOf("http://")>-1){
			paramStr = paramStr.replace(/http:\/\//,"%22http%3A%2F%2F").replace(/\//g,"%2F").replace(/#/g,"%23");
			paramStr+="%22";
		}
		url += paramStr;
		url+="&fq=-privacy:private";
	}else{
		url+="?fq=-privacy:private";
	}
	var reg = /&sort=(.*?)(&|$)/;
	var result = reg.exec(url) ==null ? "" : reg.exec(url)[1];
	if(url.indexOf("&sort=updatedDate")>-1){
		url = url.replace(result,'updatedDate%20desc');
	}
	$("#searchContent").html("");
	$("#hiddenresult").html("");
	var start = (pageIndex-1)*iCPP;
	
	$.ajax({
		 url: url,
		 'data': {'wt':'json', 'start':start, 'fq':'type:video'}, //'rows':iCPP,
		 dataType: "jsonp",
		 jsonp: 'json.wrf',
		 error: function(){
			$("#searchContent").html($("#tpl-searchEmpty").html());
			$("#Pagination_Search").html("");			
			$("#lblRecordCount").html("<strong>0</strong>&nbsp;results found in  ");
			$("#lblTimeCount").html("<strong>1</strong>&nbsp;ms");
			return;
		},
		success: function(data) {
			$("#AjaxLoader").hide();
			if(data.response.numFound == 0){								
				$("#searchContent").html($("#tpl-searchEmpty").html());
				$("#Pagination_Search").html("");		
				$("#lblRecordCount").html("<strong>0</strong>&nbsp;results found in  ");
				$("#lblTimeCount").html("<strong>1</strong>&nbsp;ms");
				return;
			}
			var start = (pageIndex-1)*iCPP;
			var numFound = parseInt(data.response.numFound);
			var page = Math.ceil((start+1)/iCPP);
			var hasNext = true;
			if((start+iCPP)>=numFound){ hasNext = false; }
			//customPagination(page,hasNext,iCPP);		
			show(data,iCPP);								
		}
	});	
}

function show(jsonData,iCPP){
	var objs = null;
	var imgTable = "";
	objs = jsonData.response.docs;
	$("#lblRecordCount").html("<strong>"+jsonData.response.numFound+"</strong>&nbsp;results found in  ");
	$("#lblTimeCount").html("<strong>"+jsonData.responseHeader.QTime+"</strong>&nbsp;ms");
	$("#sortSelect").show();
	var url=this.location.toString();
	var d1 = [];
	var tempthumList = [];
	var thumbnailList = [];
	var minY = objs[0].duration;
	var maxY = objs[0].duration;
	for(var i=0;i<objs.length;i++){			
		var dataTemp = objs[i];
		var currentPath = url;
		if(dataTemp !=undefined && null != dataTemp.thumbnail  ){
			dataTemp.thumbnail = dataTemp.thumbnail[0];
		}
		minY = minY>dataTemp.duration ? dataTemp.duration:minY;
		maxY = maxY<dataTemp.duration ? dataTemp.duration:maxY;
		d1.push([i+1,(dataTemp.duration)]);
		tempthumList.push(dataTemp.thumbnail);
	}
	while(tempthumList.length>0){
		thumbnailList.push(tempthumList.pop());
	}
	var series = [{
		data : d1,
		//lines:{show:true},
		points: { show:true,symbol:"image",image:thumbnailList }
	}];
	var options = {
		grid: {
			hoverable: true,
			clickable: true,
			mouseActiveRadius: 25,
		},
		yaxis: { min:minY-400,max:maxY+400 }, //,axisLabel:'video duration(s)',axisLabelUseCanvas:false 
		xaxis: { min:0,max:objs.length+1 } //,axisLabel:'video rank',axisLabelUseCanvas:false
	};
	
    $.plot($("#flotShow"), series,options);
	$("#flotShow").bind("plotclick",function(event, pos, item){
		window.open(objs[item.dataIndex].uri);
	});
	$("#flotShow").bind("plothover",function(event, pos, item){
		if(!item){ return; }
		if($("body").find("#x_"+item.pageX+"y_"+item.pageY).length<1){
			$("body").append("<img id='x_"+item.pageX+"y_"+item.pageY+"' src='"+objs[item.dataIndex].thumbnail+"' style='width:50px;height:50px;position:absolute;cursor:pointer;top:"+(item.pageY-25)+"px;left:"+(item.pageX-25)+"px'></img>")
			$("#x_"+item.pageX+"y_"+item.pageY).bind("click",function(){
				window.open(objs[item.dataIndex].uri);
			});
			
			$("#x_"+item.pageX+"y_"+item.pageY).bind("mouseenter",function(){
				var obj = objs[item.dataIndex];				
				var displayUri = (obj.uri.length>150)? (obj.uri.substr(0,147) + "..."):obj.uri;
				var duration = formatTime(obj.duration);
				var displayDuration = duration ? "block":"none";				
				var displayURL = "block";
				var sourceUrl = "";
				$("body").append($("#tpl-searchVideoResult").html().replace("@top",item.pageY-25).replace("@left",item.pageX-25).replace("@src",obj.thumbnail).replace(/@uri/g,obj.uri).replace("@title",obj.title).replace("@updatedDate",obj.updatedDate).replace("@author",obj.author).replace("@content",obj.content).replace("@duration",duration).replace("@displayDuration",displayDuration).replace("@display",displayURL).replace("@sourceUrl",sourceUrl).replace("@displayUri",displayUri));
				$("body").find("#videoInfoWindow").mouseleave(function(){
					$("body").find("#videoInfoWindow").remove();
				});
			});
			
			//$("#x_"+item.pageX+"y_"+item.pageY).bind("mouseleave",function(){
			//	$("body").find("#videoInfoWindow").remove();
			//});
		}		
	});
}

function searchData(){
	var urlstr = this.location.toString();
	var regStr = urlstr.indexOf("&")>0? /\?q=.{0,}&{1,}/g : /\?q=.{0,}&{0,}/g;
	var newurl = urlstr.indexOf('?')>0? urlstr.replace(regStr,"?q="+$("#xlInput").val()+"&"):urlstr+="?q="+$("#xlInput").val();
	if(newurl.lastIndexOf('&')==newurl.length-1){newurl=newurl.substr(0,newurl.length-1);}
	window.location.href = newurl;
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
		var reg = /&sort=(.*?)(&|$)/;
		var temp = reg.exec(newurl)[0];
		newurl = newurl.replace(temp,"&");
	}
	window.location.href = newurl;
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

function showAllContent(obj){
	$(obj).parent().hide();
	$(obj).parent().parent().find(".fullContent").show();
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

function formatTime(sec){
	hours = parseInt( sec / 3600 ) % 24; 
	minutes = parseInt( sec / 60 ) % 60; 
	seconds = sec % 60;  
	result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
	return result;
}