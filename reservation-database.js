const mysql = require('mysql')

const pool = mysql.createPool({
	connectionLimit: 10,
	host: "localhost",
	user: "root",
	password: "",
	database: "mjpm",
	port: "3306"
})

let reservationsDB = {}

reservationsDB.createTable = () => {
	pool.query("CREATE TABLE reservation(id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, userid INT(6), roomid INT(6))", (err, result) => {
		if (err) throw err;
		console.log("Table reservation created");
	});
}

reservationsDB.deleteTable = () => {
	pool.query("DROP TABLE reservation", function (err, result) {
		if (err) throw err;
	});
}

reservationsDB.insertReservation = (userid, roomid) => {
	pool.query("INSERT INTO reservation (userid, roomid) VALUES ?", [[[userid, roomid]]], (err, result) => {
		if (err) {
			return 1
		}

		return 0
	})
}

module.exports = reservationsDB