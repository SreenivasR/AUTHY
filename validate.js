/*
	Dependencies
 */
var http = require('http');
var request = require('request');
var HttpDispatcher = require('httpdispatcher');
var dispatcher     = new HttpDispatcher();

//Lets define a port we want to listen to
const PORT=8922;

//Create a server
var server = http.createServer(handleRequest);

//We need a function which handles requests and send response
function handleRequest(request, response){
	try {
		if(request.url=="/"){
			response.end("");
			return;
		}
        //log the request on console
        console.log(request.url);
        //Disptach the request to handle different URL paths
        dispatcher.dispatch(request, response);
    } catch(err) {
        console.log(err);
        response.end("ERROR "+err.message);
    }
}

//Lets start our server
server.listen(PORT, function(){
    console.log("Server running in port", PORT);
});

//AUTHY credentials
AUTHY = function(){
	return {
		"Phone":{
		"Verification":{
			"url" : "https://api.authy.com/protected/json/phones/verification/",
			"apiKey" : "yzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyz" // 32 character apiKey
			}
		}
	}
};

/*
	function to start verfication of phonenumber
 */
dispatcher.onPost("/register", function(req, res) {
	initVerification(JSON.parse(req.body),res);
});
/*
	function to vaidate the user input code against API validate mechanism
 */
dispatcher.onGet("/verify", function(req, res) {
	VerifyPhoneNumber(req.params ,res);
});    

function initVerification(requestObject, responseObject){
	const registerOptions = {
		method: 'POST',
		headers: [{
		      name: 'content-type',
		      value: 'application/json'
		    }],
		url: AUTHY().Phone.Verification.url+'start?api_key='+AUTHY().Phone.Verification.apiKey,
		json: true,
		body: {
		        via:'sms',
		        phone_number: requestObject.phone_number,
		        country_code: requestObject.country_code,
		        locale:'en'
		    }
	};
	return doRequest(registerOptions , responseObject);
}

function VerifyPhoneNumber(requestObject, responseObject){
	const verifyOptions = {
		method: 'GET',
		url: AUTHY().Phone.Verification.url+'check?api_key='+AUTHY().Phone.Verification.apiKey,
		qs: {
			  	phone_number:requestObject.phone_number,
			  	country_code:requestObject.country_code,
			  	verification_code:requestObject.verification_code
			}
	};
	return doRequest(verifyOptions, responseObject);
}

function doRequest(options, responseObject){
	request(options, function (error, resp, body) {
		if(resp){
			responseObject.writeHead(200, {'Content-Type': 'application/json'});
			responseObject.end(JSON.stringify(body));
		}else{
			responseObject.writeHead(error.error_code, {'Content-Type': 'application/json'});
			responseObject.end(JSON.stringify(error));
		}
	});
}