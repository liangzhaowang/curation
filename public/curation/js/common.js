_.templateSettings = {
	interpolate: /\<\@\=(.+?)\@\>/gim,
	evaluate: /\<\@(.+?)\@\>/gim
};
var conf = configSingleton();
var host = conf.get_HOST();
var apiURL = conf.get_API_URL();

$.fn.extend({
    textareaAutoHeight: function (options) {
        this._options = {
            minHeight: 0,
            maxHeight: 1000
        }
        this.init = function () {
            for (var p in options) {
                this._options[p] = options[p];
            }
            if (this._options.minHeight == 0) {
                this._options.minHeight=parseFloat($(this).height());
            }
            for (var p in this._options) {
                if ($(this).attr(p) == null) {
                    $(this).attr(p, this._options[p]);
                }
            }
            $(this).keyup(this.resetHeight).change(this.resetHeight).focus(this.resetHeight);
        }
        this.resetHeight = function () {
            var _minHeight = parseFloat($(this).attr("minHeight"));
            var _maxHeight = parseFloat($(this).attr("maxHeight"));

            if (!$.browser.msie) {
                $(this).height(0);
            }
            var h = parseFloat(this.scrollHeight);
            h = h < _minHeight ? _minHeight : h > _maxHeight ? _maxHeight : h;
            $(this).height(h).scrollTop(h);
            if (h >= _maxHeight) {
                $(this).css("overflow-y", "scroll");
            }
            else {
                $(this).css("overflow-y", "hidden");
            }
        }
        this.init();
    }
});
function switchBookmark(username,obj){
	if(username == "publicuser" || username=="undefined"){
		alert("please login first.");
		location = "/login";
	}
	//1:insert; 0:remove
	var action = "1";
	if($(obj).attr("value") == "1"){
		var action = "0";
	}
		
	$.ajax( {
        type: 'POST',
        url: apiURL + "/bookmark",
        data: {"nodeid":$(obj).attr("id"),"action":action },
        dataType: "json"
    })
	.done(function(){
		if(action ==1){
			$(obj).attr("title","unbookmark");
			$(obj).addClass("icon-star");
			$(obj).removeClass("icon-star-empty");
		}else{
			$(obj).attr("title","bookmark");
			$(obj).addClass("icon-star-empty");
			$(obj).addClass("icon-star");
		}
	})
	.fail(function(){});
}

function hasBookmarked(nodeid,obj){
	$.ajax({
		type: "GET",
		url: apiURL + "/bookmark/" + nodeid,
		dataType:"json",
		success: function(data){			
			if(data != null){
				$(obj).attr("title","unbookmark");
				$(obj).addClass("icon-star");
				$(obj).removeClass("icon-star-empty");
			}else{
				$(obj).attr("title","bookmark");
				$(obj).addClass("icon-star-empty");
				$(obj).removeClass("icon-star");
			}
		}
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

function showMoreLikeThis(nodeid){
	var url = host + "/searchpage/mlt/" + nodeid;
	return url;
}

function showAllContent(obj){
	$(obj).parent().hide();
	$(obj).parent().parent().find(".fullContent").show();
}


function GuidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function Parse_url(url){
	var pattern = /(\w+)=(\w+)/ig;
	var parames = {};
	url.replace(pattern, function(a, b, c){
		parames[b] = c;
	});
	return parames;
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