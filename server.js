var Express = require("express");
var request = require("request");
var querystring = require("querystring");
var crypto = require("crypto");
var fs = require("fs");

var app = Express.createServer()

var apiKey = "af5c8f0b117d6ba71218e8be9daf95d1f9f72989"

console.log("Loading word list...");
var words = fs.readFileSync("words.list").toString().split("\n");
console.log("Done")

var Handler = {
	sendMessage: function(from, to, content, callback) {
		query = querystring.stringify({
			to: to,
			from: from,
			content: content,
			key: apiKey
		});
		request.post(
			"https://api.mediaburst.co.uk/http/send.aspx?" + query,
			function(e, r, body) {
				console.log("Sent message to " + to);
				if (callback) { callback() }
			}
		)
	},

	hashPhrase: function(phrase) {
		var hash = crypto.createHash("md5").update(phrase).digest("hex")
		var i = parseInt(hash.slice(0,5), 16) % words.length;
		var j = parseInt(hash.slice(6,8), 16) % 90 + 10;
		var k = parseInt(hash.slice(9,14), 16) % words.length;
		var password = words[i] + j + words[k];
		return password;
	}
}

app.use(Express.static("public"));

app.all("/message", function(req, res, next) {
	var content = req.param("content");
	var from = req.param("from");
	var to = req.param("to");
	res.send(200);
	if (from && content) {
		Handler.sendMessage(to, from, Handler.hashPhrase(content.toLowerCase()))
	}
})

app.listen(80)
