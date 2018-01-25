var conf = configSingleton();
var baseUrl = conf.get_API_URL();
var dataAll = [];
$(document).ready(function(){
	getUpdatedDateStatData(7,'authorGraph-1');
	$("#tabgraph-2").one("click",function(){getUpdatedDateStatData(30,'authorGraph-2')});
	$("#tabgraph-3").one("click",function(){getUpdatedDateStatData(90,'authorGraph-3')});
	$("#tabgraph-4").one("click",function(){getUpdatedDateStatData(0,'authorGraph-4')});
});

function searchData(){
	if($("#xlInput").val()){
		this.location="/curation/searchPage.html?q=\"" + $("#xlInput").val()+"\"";
	}else{
		this.location="/curation/searchPage.html?q=" + $("#xlInput").val();
	}
}

function getUpdatedDateStatData(days,elmentId){
	$.ajax({
		url:baseUrl + "/updatedDateStat/days/"+days,
		dataType: "json",
		success: function(data){
			if(!data){ return; }
			initGraph(data,elmentId);
		}
	});
}

function initGraph(data,elmentId){	
	var container = document.getElementById(elmentId);
	var data_Total=[], data_Video=[], data_Playlist=[], data_Course=[], data_Lecturenote=[], graph;

	for(var i=0;i<data.length;i++){
		var now = new Date(new Date().toDateString());
		var date = new Date(data[i].updated_date);
		var days = (date-now)/1000/3600/24;
		data_Total.push([days,data[i].total_num]);
		//data_Video.push([days,data[i].video_num]);
		//data_Playlist.push([days,data[i].playlist_num]);
		//data_Course.push([days,data[i].course_num]);
		//data_Lecturenote.push([days,data[i].lecturenote_num]);
	}
	graph = Flotr.draw(container, [ {data:data_Total,label:" Total count ",lines:{show:true},points:{show:true}}
			//,{data:data_Video,label:" Video count ",lines:{show:true},points:{show:true}}
			//,{data:data_Playlist,label:" Playlist count ",lines:{show:true},points:{show:true}}
			//,{data:data_Course,label:" Course count ",lines:{show:true},points:{show:true}}
			//,{data:data_Lecturenote,label:" Lecturenote count ",lines:{show:true},points:{show:true}}
		], 
		{ xaxis : {
			tickFormatter: function(x) {
				var x = parseInt(x);							
				return FormatDateTime(new Date(new Date().getTime()+x*24*3600*1000).toDateString());
			}
		}}
	);
}

function FormatDateTime(date){
	var temp = new Date(date);
	var format = 'yyyy/MM/dd';
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