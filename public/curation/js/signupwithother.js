var conf = configSingleton();
var apiURL = conf.get_API_URL();

function checkName(obj){
	$(obj).attr("isExist","true");
	var username = $("#id_username").val();
	if(username == ""){
		$("#usernameprompt").html("This field is required.").css("color","red");		
	}else if(!/^\w{1,32}$/.test(username)){
		$("#usernameprompt").html("This value may contain only letters, numbers and underscores.").css("color","red");		
	}else if(username != "" && /^\w{1,32}$/.test(username)){
		$("#usernameprompt").html("");
		$.ajax( {
			type: 'POST',
			url: apiURL + "/checkName",
			data: {"data":username},
			success: function(data) {
				if(data != null && data.username == $("#id_username").val()){
					$("#usernameprompt").html("A user with that username already exists.").css("color","red");
				}else{
					$(obj).attr("isExist","false");
					$("#usernameprompt").html("");
				}
			},
			dataType: "json",
			complete: function(jqHXR, status ) {
			}
		});	
	}
}

function register(){
	if($("#id_username").attr("isExist") == "true"){ return; }
	
	var result = {};
	result.username = $("#id_username").val();
	result.provider_id = $("#provider_id").html();
	result.provider = $("#connprovider").html();
	result.email = $("#connemail").html();
	result.displayname = $("#provider_displayname").html();	
	result.password = null;
	result.photo = "";
	
	$.ajax( {
		type: 'POST',
		url: apiURL + "/register",
		data: {"data":JSON.stringify(result)},
		success: function(data) {
			window.location.href="/auth/"+$("#connprovider").html();
		},
		dataType: "json",
		complete: function(jqHXR, status ) {
		}
	});
}