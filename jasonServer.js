var http = require('http');
var fs = require('fs');
var ip = '127.0.0.1';
var port = 3000;
var config = JSON.parse(fs.readFileSync("confign.json"));

var server = http.createServer(function(req,res){

console.log('request was made: ' + req.url);
fs.readFile("./pub" + req.url, function(error,data){
		if (error){
			res.writeHead(404,{"Content-Type": "text/plain"});
			res.end("404");
		}
		else	
		{
			res.writeHead(200,{"Content-Type": "text/plain"});
			res.end(data);
		}
	});
});

fs.watchFile("config.json",function(){
	config = JSON.parse(fs.readFileSync("config.json));
	server.close();
	ip = config.ip;
	port = config.port;
	server.listen(port,ip,function(){
	console.log("Server running at " + ip + " : " + port);
	});


});




server.listen(3000,ip function(){
console.log("Server running at " + ip + " : " + port);
});
 