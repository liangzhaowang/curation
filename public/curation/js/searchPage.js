var conf = configSingleton();
var baseURL = conf.get_SOLR_VIDEOSEARCH_URL();
var sourceTemp = new Array();
var DataTypeTemp = new Array();
var tagTemp = new Array();
var contentTemp = new Array();
var moreContentTemp = new Array();
var currentTemp = new Array();

var cloudObj = {"author":["MIT",22730,"UCBerkeley",3920,"khanacademy",3027,"OreillyMedia",2651,"EmoryUniversity",1583,"UHouston",1471,"OUlearn",1438,"UCtelevision",1436,"UCBerkeleyEvents",1401,"UCLA",1230,"StanfordUniversity",1206,"UChannel",1149,"GoogleDevelopers",1140,"VanderbiltUniversity",1107,"case",1073,"brightstorm2",1061,"EducatorVids",1033,"Northeastern",1024,"UCF",1000,"erbao05",1000,"YaleCourses",994,"JCCCvideo",956,"BiolaUniversity",938,"CSUDHTV",919,"stanfordbusiness",913,"Dartmouth",876,"PurdueUniversity",876,"columbiauniversity",862,"UMichDent",860,"TbirdKnowledgeNet",851,"yuantengfeinet",848,"NottmUniversity",845,"KyoDaiOcw",823,"LeedsMetUni",802,"DardenMBA",720,"EnderlePhD",712,"Harvard",712,"NorthwesternU",699,"NDdotEDU",698,"PCCvideos",697,"YaleUniversity",690,"USCAnnenberg",651,"MissouriState",635,"UToledo",613,"patrickJMT",613,"Arizona",609,"UOregon",606,"HofstraUniversity",605,"keiouniversity",602,"OregonStateUniv",601,"lsewebsite",595,"thenewschoolnyc",592,"nyu",587,"Rutgers",572,"MSLawdotedu",565,"Papapodcasts",559,"UNSWCommunity",551,"SFUNews",536,"MichiganStateU",534,"TIT",532,"WesternUniversity",531,"um",531,"NCState",520,"CovStudent",502,"Wesleyan",502,"MontereyInstitute",499,"UniSouthAustralia",486,"ConcordiaUni",484,"BentleyUniversity",482,"NewMexicoStateU",482,"springarboru",479,"StPetersburgCollege",476,"CACommunityColleges",463,"villanovauniversity",463,"PennState",462,"IUPVideo1875",460,"UtahValleyUniversity",455,"IMD",449,"FloridaInternational",447,"ColumbiaBusiness",440,"ClemsonUniversity",439,"UChicago",439,"CUNYMedia",430,"pepperdine",429,"CSUSonoma",428,"UniversidadUNIR",424,"UCDavis",422,"uofmemphisvideos",418,"njit",413,"essec",407,"CollegeofCharleston",401,"ConcordiaUniversity",389,"UMKC",385,"ceuhungary",385,"ECU",383,"ThayerSchool",378,"UniversityofMinn",373,"UNSWelearning",372,"UWTV",372,"unccharlottevideo",370],"category":["education",95888,"university",20848,"college",10424,"tech",9462,"http://gdata.youtube.com/schemas/2007#playlist",9186,"of",7851,"school",6571,"science",5707,"news",5531,"uc",5347,"berkeley",4842,"business",4697,"sports",4582,"ucberkeley",4337,"students",4305,"lecture",4268,"student",4255,"people",4209,"research",3724,"cal",3702,"state",3415,"webcast.berkeley",3376,"technology",3230,"music",2851,"math",2785,"engineering",2601,"video",2600,"mba",2444,"health",2370,"entertainment",2275,"campus",2223,"educational",2214,"and",2121,"nonprofit",2093,"management",1962,"learning",1917,"the",1898,"tutorial",1885,"conference",1873,"community",1850,"public",1753,"art",1745,"history",1743,"learn",1740,"leadership",1693,"global",1677,"new",1631,"arts",1613,"environment",1609,"help",1606,"usc",1595,"politics",1563,"international",1553,"graduation",1541,"chemistry",1522,"law",1504,"ucla",1471,"economics",1470,"event",1463,"film",1463,"alumni",1457,"study",1436,"open university",1433,"virginia",1424,"example",1423,"design",1394,"center",1391,"innovation",1360,"faculty",1342,"athletics",1326,"football",1319,"google",1310,"oreilly",1291,"lesson",1289,"energy",1287,"opencourseware",1280,"media",1268,"teaching",1265,"2011",1252,"problem",1240,"calculus",1223,"medicine",1215,"commencement",1214,"biology",1212,"sustainability",1193,"development",1173,"basketball",1153,"computer",1142,"professor",1129,"economy",1119,"social",1118,"physics",1107,"for",1102,"tutor",1100,"sample",1071,"oreillymedia",1064,"academic",1059,"institute",1056,"degree",1051]};

(function($){
    
    if($("#searchScope").length>0){
        if($("#defaultCondition").html().indexOf("oerPrivacy")>-1){
            $("#searchScope option[value='3']").attr("selected","selected");
        }else{
            $("#searchScope option[value='1']").attr("selected","selected");
        }
    }
    
    
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
	
	window.DataTypeView = Backbone.View.extend({  
		tagName:  "li",
		template: _.template($('#dataType-template').html()), 
		render: function() {	
			$(this.el).html(this.template(this.model.toJSON()));     
		return this;
		}  	
	});  
	
    window.AppView = Backbone.View.extend({ 
		initialize: function() {
			var localURL = window.location.toString();
			if(localURL.indexOf("?")<0){ 
				getCloudData();
				return; 
			}
			$("#cloudShow").hide();
			$("#naviBarShow").show();
			$(".sidebar").show();
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
 
	window.SorlView2 = Backbone.View.extend({  
	tagName:  "tr",
	template: _.template($('#searchResultHasVideo2').html()),      
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
   var facet_fields = search_result.facet_counts.facet_fields;
   var objs = search_result.response.docs;
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
			}else if(facet_field == 'type'){
				var typetemp = {};
				typetemp.name = facet_fields[facet_field][j];
				typetemp.urlvalue = facet_fields[facet_field][j];				
				typetemp.num = facet_fields[facet_field][j+1];
				typetemp.url = fq_list;
				DataTypeTemp.push(typetemp);
			}		
			else{				
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
			str = '<li style="display: inline;float:left;line-height:18px;"><span><a href="'+urlstr+'?q=id:'+inputstr+'&mlt=true">'+inputstr+'</a></span> <span class="divider">/</span></li>';
		 }else{
			if(result=="id"){
				str = '<li style="display: inline;float:left;line-height:18px;"><span><a href="'+urlstr+'?q=">'+result+'</a></span> <span class="divider">/</span></li>';
			}
			str = '<li style="display: inline;float:left;line-height:18px;"><span><a href="'+urlstr+'?q='+result+'">'+result+'</a></span> <span class="divider">/</span></li>';
		 }		
	}else{
		 str = '<li style="display: inline;float:left;line-height:18px;"><span><a href="'+urlstr+'?q=">ALL</a></span> <span class="divider">/</span></li>';
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
			str += '<li style="display: inline;float:left;line-height:18px;"><span><a href=\"'+urlstr+'?q='+result+'\">'+fqValue[i]+'</a></span><span class="divider">/</span></li>';
		}
	}
	if(url.indexOf("&fq")>-1){
	str = str + '<p>'+fqValue[fqValue.length-1]+'</p>'
	}
	
	$("#navigation2").html(str);
}

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
	if(url.indexOf("mlt=true")>-1){
		$.ajax({
		 url: url,
		 'data': {'wt':'json'},
		 dataType: "jsonp",
		 jsonp: 'json.wrf',
		 success: function(data) {
			$("#AjaxLoader").hide();
			if(data.response.numFound == 0){
				$("#searchContent").html($("#tpl-searchEmpty").html());
				$("#Pagination_Search").html("");			
				$("#lblRecordCount").html("<strong>0</strong>&nbsp;results found in  ");
				$("#lblTimeCount").html("<strong>1</strong>&nbsp;ms");
				return;
			}			
			sourceTemp = new Array();
			tagTemp = new Array();
			DataTypeTemp = new Array();
			contentTemp = new Array();
			moreContentTemp = new Array();
			currentTemp = new Array();
			$("#source").html("");
			$("#tag").html("");
			$("#type").html("");
			$("#data-list").html("");			
			showMoreLikeThis(data);
			var Sources = new ItemList();
			var Tags = new ItemList();
			var DataTypeMsg = new ItemList();
			var sorldata = new solrDataList();
			var moresorldata = new solrDataList();
			Sources.reset(sourceTemp);	
			Tags.reset(tagTemp);
			DataTypeMsg.reset(DataTypeTemp);
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
			DataTypeMsg.each(function(item){
				if(item != undefined){
					var dataTypeView = new DataTypeView({model:item});
					$("#type").append(dataTypeView.render().el);
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
			customPagination(page,hasNext,iCPP);
			sourceTemp = new Array();
			tagTemp = new Array();			
			DataTypeTemp = new Array();
			contentTemp = new Array();
			$("#source").html("");
			$("#tag").html("");
			$("#type").html("");
			$("#data-list").html("");			
			show(data,iCPP);
			var Sources = new ItemList();
			var Tags = new ItemList();
			var DataTypeMsg = new ItemList();
			var sorldata = new solrDataList();
			Sources.reset(sourceTemp);	
			Tags.reset(tagTemp);
			DataTypeMsg.reset(DataTypeTemp);
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
			DataTypeMsg.each(function(item){
				if(item != undefined){
					var dataTypeView = new DataTypeView({model:item});
					$("#type").append(dataTypeView.render().el);
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

function formatTime(sec){
	hours = parseInt( sec / 3600 ) % 24; 
	minutes = parseInt( sec / 60 ) % 60; 
	seconds = sec % 60;  
	result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
	return result;
}

function show(jsonData,iCPP){
	var index = 0;
	var objs = null;
	var imgTable = "";
	objs = jsonData.response.docs;
	showNavigation(jsonData);	
	$("#lblRecordCount").html("<strong>"+jsonData.response.numFound+"</strong>&nbsp;results found in  ");
	$("#lblTimeCount").html("<strong>"+jsonData.responseHeader.QTime+"</strong>&nbsp;ms");
	$("#sortSelect").show();
	var url=this.location.toString();
	for(var i=0;i<iCPP;i++){			
		if(objs.length>index){
			var dataTemp = objs[index];
			var currentPath = url;
			if(dataTemp !=undefined && null != dataTemp.thumbnail  ){
				dataTemp.thumbnail = dataTemp.thumbnail[0];
			}
			var regStr = url.indexOf("&")>0? /\?q=.{0,}&{1,}/g : /\?q=.{0,}&{0,}/g;
			dataTemp.path = url.indexOf('?')>0 ? url.replace(regStr,"?q=id:"+dataTemp.id+"&mlt=true&") : url+"?q=id:"+dataTemp.id+"&mlt=true";		
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
	$("#lblRecordCount").html("<strong>"+jsonData.response.numFound+"</strong>&nbsp;results found in  ");
	$("#lblTimeCount").html("<strong>"+jsonData.responseHeader.QTime+"</strong>&nbsp;ms");
	$("#sortSelect").show();
	var bean = jsonData.response.docs[0];	
	if(bean !=undefined && null != bean.thumbnail  ){
		bean.thumbnail = bean.thumbnail[0];
	}
	if(bean.title){
		document.title=bean.title;
	}
	var temp = bean;
	var regStr = url.indexOf("&")>0? /\?q=.{0,}&{1,}/g : /\?q=.{0,}&{0,}/g;
	temp.path = url.indexOf('?')>0 ? url.replace(regStr,"?q=id:"+bean.id+"&") : url+"?q=id:"+bean.id;
	temp.currentPath = url;
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
	if($("#xlInput").val()){
		var newurl = urlstr.indexOf('?')>0? urlstr.replace(regStr,"?q="+$("#xlInput").val()+"&"):urlstr+="?q="+$("#xlInput").val();
	}else{
		var newurl = urlstr.indexOf('?')>0? urlstr.replace(regStr,"?q="+$("#xlInput").val()+"&"):urlstr+="?q="+$("#xlInput").val();
	}
	if(newurl.lastIndexOf('&')==newurl.length-1){newurl=newurl.substr(0,newurl.length-1);}
	window.location.href = newurl;
}

function searchTestData(){
    var urlstr = this.location.toString();
    var regStr = urlstr.indexOf("&")>0? /\?q=.{0,}&{1,}/g : /\?q=.{0,}&{0,}/g;
    if($("#xlInput").val()){
        var newurl = urlstr.indexOf('?')>0? urlstr.replace(regStr,"?q=\""+$("#xlInput").val()+"\"&"):urlstr+="?q=\""+$("#xlInput").val()+"\"";
    }else{
        var newurl = urlstr.indexOf('?')>0? urlstr.replace(regStr,"?q="+$("#xlInput").val()+"&"):urlstr+="?q="+$("#xlInput").val();
    }
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

function getCloudData(){
	showCloudData(cloudObj);
}
function showCloudData(cloudObj){
	var str = "";
	var authors = cloudObj.author;
	var tags = cloudObj.category;
	
   var tagStr ="";
   var authorStr ="";
	
	for(var j=0;j<authors.length ;j=j+2){
		var name = authors[j] ;
		var num = authors[j+1]+"";
		
		if((name.length + num.length)>25){
			var length = (25 - num.length);				
			name = name.substring(0,length);
			name +="...";
		}

		if(num <= 3000){
			tagStr +="<div data-weight='14' >"+name+"</div>";
		}	
		if(num>3000 && num <5000){
			tagStr +="<div  data-weight='20' >"+name+"</div>";
		}
		if(num>=5000 && num<10000){
			tagStr +="<div  data-weight='32' >"+name+"</div>";
		}
		if(num>=10000 && num<90000){
			tagStr +="<div  data-weight='46' >"+name+"</div>";
		}
		if(num>=90000){
			tagStr +="<div  data-weight='60' >"+name+"</a></div>";
		}
	}
	
	for(var j=0;j<tags.length ;j=j+2){
		var name = tags[j] ;
		var num = tags[j+1]+"";
		
		if((name.length + num.length)>25){
			var length = (25 - num.length);				
			name = name.substring(0,length);
			name +="...";
		}

		if(num <= 3000){
			authorStr +="<div data-weight='14' >"+name+"</div>";
		}	
		if(num>3000 && num <5000){
			authorStr +="<div  data-weight='20' >"+name+"</div>";
		}
		if(num>=5000 && num<10000){
			authorStr +="<div  data-weight='32' >"+name+"</div>";
		}
		if(num>=10000 && num<90000){
			authorStr +="<div  data-weight='46' >"+name+"</div>";
		}
		if(num>=90000){
			authorStr +="<div  data-weight='60' >"+name+"</a></div>";
		}
	}	

	$("#cloud_Tags").html(tagStr);
	$("#cloud_Sources").html(authorStr);
	
	$(".cloud_homePage").awesomeCloud({
		"size" : {
			"grid" : 1,
			"factor" : 3
		},
		"color" : {
			"background" : "#FAFAFA"
		},
		"options" : {
			"color" : "random-dark",
			"rotationRatio" : 0.45,
			"printMultiplier" : 3
		},
		"font" : "'Times New Roman', Times, serif",
		"shape" : "circle"
	});
 }



function getTagsButtonStr(taglist){
	var tagButton = "";	
	var list = null;
	if(taglist.length>0){
		if(typeof(taglist) == 'object'){		
			list = taglist;
		}else{
			list = taglist.split(',');
		}
		for(var i=0;i<list.length;i++){
			if(list[i].length>0){
				tagButton += "<button class='btn btn-mini btn-info'>"+list[i]+"</button>";
			}
		}
	}
	return tagButton;
}

function FormatDateTime(datetime){
	var temp = new Date(datetime);
	var format = 'yyyy/MM/dd hh:mm:ss';
	var o =
	{
		"M+" : temp.getMonth()+1,
		"d+" : temp.getDate(),
		"h+" : temp.getHours(),
		"m+" : temp.getMinutes(),
		"s+" : temp.getSeconds(),
		"q+" : Math.floor((temp.getMonth()+3)/3),
		"S" : temp.getMilliseconds()
	}
	if(/(y+)/.test(format))
	format=format.replace(RegExp.$1,(temp.getFullYear()+"").substr(4 - RegExp.$1.length));
	for(var k in o)
	if(new RegExp("("+ k +")").test(format))
	format = format.replace(RegExp.$1,RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
	return format;
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

function saveItemsToBuffer(obj){
    var urlObj = $(obj).parent().parent().parent();
    var spanObj = urlObj.find('.label');
    var aObj = urlObj.find('#bufferUrl');
    var activeObj = $("#searchPanel").find(".active");
    var source = "OER";
    var href;
    if(spanObj)
    {
        source = spanObj.text();
    }
    if(aObj)
    {
        href = aObj.attr("href");
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
    });}

//save the Buffer data
function saveBufferBySource(source,href){
    $.ajax( {
        type: 'POST',
        url: apiURL + "/bufferItem",
        data: {"source":source,"href":href},
        dataType: "json",
        success: function(data) {
            if(data.error){
                alert("save bufferData wrong!");
                return;
            }
        }
    });
}
