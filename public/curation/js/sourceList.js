var conf = configSingleton();
var baseUrl = conf.get_API_URL();
(function($){
	window.Item = Backbone.Model.extend({   
		defaults: function() {	
		  return {
			author: "",
			video_num: "",
			playlist_num: ""	,
			course_num: "",
			lecturenote_num: "",
			total_num: ""
		  };
		}	
	});
	window.ItemList = Backbone.Collection.extend({  
		model: Item,  
		initialize: function() {
		}
	});
	
	Items =  new ItemList();
	window.AuthorstatView = Backbone.View.extend({  
		tagName:  "tr",
		template: _.template($('#tpl-sourceStat').html()), 
		render: function() {	
			$(this.el).html(this.template(this.model.toJSON()));     
			return this;
		}  	
	}); 

    window.AppView = Backbone.View.extend({ 
		initialize: function() {
			Items.bind('reset', this.addAll, this);
			getData(1,100);	
		},
		addAll: function(){
			$("#authorstatList").html($("#tpl-thSource").html());
			Items.forEach(function(item){
				var view = new AuthorstatView({model:item});
				$("#authorstatList").append(view.render().el);
			});			
		},
		render: function() {	
		  this.$el.html(this.template(this.model.toJSON()));     
		  return this;
		}
	});
	window.appView = new AppView();	
})(jQuery);	

function searchData(){
	if($("#xlInput").val()){
		this.location="/curation/searchPage.html?q=\"" + $("#xlInput").val()+"\"";
	}else{
		this.location="/curation/searchPage.html?q=" + $("#xlInput").val();
	}
}

function getData(pageIndex, numPerPage){
	var start = (pageIndex-1)*numPerPage;
	var rows = start + numPerPage;
	$.ajax({
		url:baseUrl + "/authorstat/count",
		dataType: "json",
		success: function(dataMsg){
			if(dataMsg.num>0){
				$.ajax({
					url:baseUrl + "/authorstat/start/" + start + "/rows/" + numPerPage,
					dataType: "json",
					success: function(data){
						$("#AjaxLoader").hide();
						if(data){
							Items.reset(data);						
						}
						if(dataMsg.num == 0){	
						$("#Pagination_Search").html("");
						return;
						}
						var start = (pageIndex-1)*numPerPage;
						var numFound = parseInt(dataMsg.num);
						var page = Math.ceil((start+1)/numPerPage);
						var hasNext = true;
						if((start+numPerPage)>=numFound){ hasNext = false; }
						customPagination(page,hasNext,numPerPage);
					}
				});
			}else{
				$("#AjaxLoader").hide();
			}
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