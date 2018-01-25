var baseSolrURL = conf.get_SOLR_URL() + "/browse?wt=json&fq=type:curation_node";
var baseURL = host + "/solrData?wt=json&fq=type:curation_node&q=";
var tagTemp = new Array();
var tagArray = new Array();
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
			getData();	
		},
		render: function() {	
		  this.$el.html(this.template(this.model.toJSON()));     
		  return this;
		}
	});	
	window.appView = new AppView();	
})(jQuery);	

function showNavigation(search_result){
   var str = "";
   var facet_fields = search_result.facet_counts.facet_fields;		 
   var url=baseURL; 
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
			if(facet_field == 'category'){
				var dataTemp2 = {};
				dataTemp2.name = name;
				dataTemp2.urlvalue = urlvalue;
				if(name.indexOf("...")>0){
				dataTemp2.point = point;
				}
				dataTemp2.num = facet_fields[facet_field][j+1];
				dataTemp2.url = fq_list;
				tagTemp.push(dataTemp2);				
			}
		}
	}	
 } 
function getData(){
	var url = baseSolrURL;	
	var data = { };
	if($("#nodeAuthor").html()){
		data = { 'fq': 'author:' + $("#nodeAuthor").html() };
	}else{
		data = { 'fq': 'privacy:public'};
	}
	$.ajax({
		url: url,
		'data': data,
		dataType: "jsonp",
		jsonp: 'json.wrf',
		success: function(data) {	
			showNavigation(data);
			var Tags = new ItemList();
			//tagTemp = tagTemp.slice(0,20);
			Tags.reset(tagTemp);
			Tags.each(function(item){
				var obj_str = JSON.stringify(item);
				var obj_json = JSON.parse(obj_str);			
				if(item != undefined){
					var tagView = new TagView({model:item});
					if(obj_json.num<=2000){
						$(tagView.render().el).attr("value","8");
					}
					if(obj_json.num>2000 && obj_json.num<=5000){
						$(tagView.render().el).attr("value","14");
					}
					if(obj_json.num>5000){
						$(tagView.render().el).attr("value","15");
					}
					$("#tag").append(tagView.render().el);						
				}
			});
			$("#tag").tagcloud({type:"list",sizemin:13}).find("li").tsort();
		}
	});	
}