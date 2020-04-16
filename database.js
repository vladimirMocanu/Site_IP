var mysql = require('mysql');

var con = mysql.createConnection({
	host: "localhost",
	user: "mjpm",
	password: "penis",
	database: "mydb"
});




con.connect(function (err) {
	if (err) throw err;
	console.log("Connected!");
	deleteAll();
	con.query("CREATE TABLE user(id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, email VARCHAR(50), pass VARCHAR(50))", function (err, result) {
		if (err) throw err;
		console.log("Table created");
	});
	insertUser('w@w.com', 'w')
});

function insertUser(email, pass) {
	con.query("INSERT INTO user (email, pass) VALUES ?", [[[email, pass]]], function (err, result) {
		if (err) throw err;
	});
	con.query("SELECT * FROM user", function (err, result) {
		if (err) throw err;
		console.log(result);
	});
}

function deleteAll() {
	con.query("DROP TABLE user", function (err, result) {
		if (err) throw err;
	});
}

function hasUser(email, callback) {
	con.query("SELECT * FROM user WHERE email = ?", [email], 
	function (err, result) {
		callback(result);
	});
}

exports.insertUser = insertUser;
exports.hasUser = hasUser;