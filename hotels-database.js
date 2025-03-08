const pool = require('./db-config')

let hotelsDB = {}

hotelsDB.createTable = () => {
	pool.query("CREATE TABLE hotel(id INT(6) NOT NULL AUTO_INCREMENT PRIMARY KEY, owner INT(6) UNSIGNED, name VARCHAR(60), location VARCHAR(60), description VARCHAR(300))", (err, result) => {
		if (err) throw err
		console.log("Table hotel created")
	})
}

hotelsDB.deleteTable = () => {
	pool.query("DROP TABLE hotel", function (err, result) {
		if (err) throw err
	})
}

hotelsDB.all = () => {
	return new Promise((resolve, reject) => {
		pool.query('SELECT * FROM hotel', (err, result) => {
			if (err) {
				return reject(err)
			}

			return resolve(result)
		})
	})
}

hotelsDB.insertHotel = (owner, name, location, description, callback) => {
	return pool.query("INSERT INTO hotel (owner, name, location, description) VALUES ?", [[[owner, name, location, description]]], (err, result) => {
		if (err) {
			return 1
		}
		
		callback(result.insertId)
		return 0
	})
}

module.exports = hotelsDB