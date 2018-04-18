var http = require("http");
var fs = require("fs");
var qs = require("querystring");
var mongodb = require("mongodb");
var MongoClient = require("mongodb").MongoClient;
var server = http.createServer();
server.setMaxListeners(0);

var mongodbServer = new mongodb.Server("localhost", 27017, { auto_reconnect: true, poolSize: 10 });
var db = new mongodb.Db("mydb", mongodbServer);

var triedLogin = false, isLoginSuccessful = false;
var users = "";
var server = http.createServer(function(request, response) {
    if (request.method == "POST") {
		// Switch msg into a JSON object
        var formData = "", msg = "", obj = "";
        return request.on("data", function(data) {
			formData += data;
			return request.on("end", function() {
				var user;
				user = qs.parse(formData);
				msg = JSON.stringify(user);
				response.writeHead(200, {
				  "Content-Type": "application/json",
				  "Content-Length": msg.length
				});
				obj = JSON.parse(msg);
				console.log(msg);
				
				
				
				// Prevent signup page runs this part
				if (request.url == "/login.html") {
					if(obj.gender == null){
					triedLogin = true;
					// Handle data received from login page
					var username = obj.username;
					var pass =  obj.pass;
					var email = obj.email;
					var phone = obj.phone;
					var skype = obj.skype;

					console.log(username);
					// Get data from database
					MongoClient.connect("mongodb://localhost:27017/mydb", function (err, db) {
						db.collection("user", function (err, collection) {
							collection.find().toArray(function(err, items) {
								if(err) throw err;
								// Check whether there is data in the database
								if (items != "") {
									// Check whether the user account exists
									for (var i=0; i<items.length; i++) {
										if (username == items[i].username && pass == items[i].pass) {
											users = items[i].username;
											console.log(items[i].pass);
											console.log("Login successful");
											isLoginSuccessful = true;
										}
									}
								}
							});
						});	
					});
				}}
				
				
		
				if(request.url == "/pinterest-style.html")
				{
				if(obj.action=="signout"){
					isLoginSuccessful = false;
					}
				}
				
				
				
				
				// Prevent login page runs this part
				if (obj.gender != null) {
					// Send obj data to database
					

					db.open(function() {
						db.collection("user", function(err, collection) {
											console.log("preper "+obj.gender+"     " + obj.username +"   "+ obj.email +"    " + obj.pass +"      " + obj.phone+"      " +obj.skype);
						if(err) throw err;
							collection.insert({
								gender: obj.gender,
								username: obj.username,
								pass: obj.pass,
								email: obj.email,
								phone: obj.phone,
								skype: obj.skype,
							}, function(err, data) {
								
								if (data) {
									
									
									console.log("Successfully Insert Data");
					
								} else {
									console.log("Failed to Insert");
								}
							});
						});
					});
				}
				
				
				
				return response.end();
			});
        });
    } 
	
	else {
		// Get
		
		fs.readFile("./" + request.url, function (err, data) {
			var dotoffset = request.url.lastIndexOf(".");
			var mimetype = dotoffset == -1
				? "text/plain"
				: {
					".html": "text/html",
					".ico" : "image/x-icon",
					".jpg" : "image/jpeg",
					".png" : "image/png",
					".gif" : "image/gif",
					".css" : "text/css",
					".js"  : "text/javascript"
				}[request.url.substr(dotoffset)];
			if (!err) {
				response.setHeader("Content-Type", mimetype);
				response.end(data);
				console.log(request.url, mimetype);
			} else {
				response.writeHead(302, {"Location": "http://localhost:5432/index.html"});
				response.end();
			}
		});
		
		
		
		
		
		
		
		
    }
});

server.listen(5432);

console.log("Server running at http://127.0.0.1:5432/");

// IO is used to send message between server an client
var io = require("socket.io").listen(server);
	
function update() {
	
	if (isLoginSuccessful == true) {
		// Send message if login is successful
		console.log(users);
		io.emit("login_successful", { message: "login_successful", username: users});
		//isLoginSuccessful = false;
	} else {
		if (triedLogin == true) {
			console.log("Xs");
			io.emit("login_failed", { message: "login_failed" });
			triedLogin = false;
		}
		else{
		console.log("x");
		io.emit("logout_successful", { message: "logout_successful" });
		
		}
	}
	
}
	
setInterval(update, 500);