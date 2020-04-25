const mysql = require('mysql')

const pool = mysql.createPool({
	connectionLimit: 10,
	host: "localhost",
	user: "mjpm",
	password: "penis",
	database: "mydb",
	port: "3306"
})

let roomsDB = {}

roomsDB.createTable = () => {
	pool.query("CREATE TABLE room(id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, hotel INT(6) UNSIGNED, name VARCHAR(60), price INT(6), description VARCHAR(300))", (err, result) => {
		if (err) throw err;
		console.log("Table room created");
	});
}

roomsDB.deleteTable = () => {
	pool.query("DROP TABLE room", function (err, result) {
		if (err) throw err;
	});
}

roomsDB.all = (id) => {
	return new Promise((resolve, reject) => {
		pool.query('SELECT * FROM room WHERE hotel = ?', [id], (err, result) => {
			if (err) {
				return reject(err)
			}

			return resolve(result)
		})
	})
}

roomsDB.insertRoom = (hotel, name, price, description) => {
	pool.query("INSERT INTO room (hotel, name, price, description) VALUES ?", [[[hotel, name, price, description]]], (err, result) => {
		if (err) {
			return 1
		}

		return 0
	})
}


module.exports = roomsDB