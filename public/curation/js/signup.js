var conf = configSingleton();
var apiURL = conf.get_API_URL();
$(".signup").addClass("active");
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
function checkPassword(obj){
	$(obj).attr("isExist","true");
    var password = $("#id_password").val();
	if(password == ""){
		$("#passwordprompt").html("This field is required.").css("color","red");
		return false;
	}else if(!/^\w{1,32}$/.test(password)){
		$("#passwordprompt").html("This value may contain only letters, numbers and underscores.").css("color","red");		
		return false;
	}else if(password != "" && /^\w{1,32}$/.test(password)){
		$(obj).attr("isExist","false");
	    $("#passwordprompt").html("");
	}
}
function checkEmail(obj){
	$(obj).attr("isExist","true");
	var email = $("#id_email").val();
	if(email == ""){
		$("#emailprompt").html("This field is required.").css("color","red");		
	}else if(!/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-+.]\w+)*$/.test(email)){
		$("#emailprompt").html("Enter a valid e-mail address.").css("color","red");		
		return false;
	}else if(email != "" && /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-+.]\w+)*$/.test(email)){
		$("#emailprompt").html("");
		$.ajax( {
			type: 'POST',
			url: apiURL + "/checkEmail",
			data: {"data":email},
			success: function(data) {
				if(data != null && data.email == $("#id_email").val()){
				 $("#emailprompt").html("A user with that email already exists.").css("color","red");
				}else{
					$(obj).attr("isExist","false");
					$("#emailprompt").html("");
				}
			},
			dataType: "json",
			complete: function(jqHXR, status ) {
			}
		});
	}
}
function register(){
	if($("#id_username").attr("isExist") == "true") { return; }	
	if($("#id_email").attr("isExist") == "true") { return; }
	if($("#id_password").attr("isExist") == "true") { return; }
	
	var result = {};
	result.username = $("#id_username").val();
	result.provider_id = "";
	result.provider = "local";	
	result.email = $("#id_email").val();
	result.displayname = $("#id_username").val();
	result.password = hex_sha1($("#id_password").val());
	result.photo = "";
	
	$.ajax({
		type: 'POST',
		url: apiURL + "/register",
		data: {"data":JSON.stringify(result)},
		success: function(data) {
			$.ajax({
				type: 'POST',
				url: "/login",
				data:{ username:$("#id_username").val(),password:result.password },
				success: function(data){
					window.location.href="/users/"+$("#id_username").val();
				}
			});
		},
		dataType: "json",
		complete: function(jqHXR, status ) {
		}
	});  
}
