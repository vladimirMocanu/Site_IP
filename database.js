const mysql = require('mysql')

const pool = mysql.createPool({
	connectionLimit: 10,
	host: "localhost",
	user: "mjpm",
	password: "penis",
	database: "mydb",
	port: "3306"
})

let usersDB = {}

usersDB.createTable = () => {
	pool.query("CREATE TABLE user(id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, email VARCHAR(60), password VARCHAR(60))", (err, result) => {
		if (err) throw err;
		console.log("Table created");
	});
}

usersDB.deleteTable = () => {
	pool.query("DROP TABLE user", function (err, result) {
		if (err) throw err;
	});
}

usersDB.all = () => {
	return new Promise((resolve, reject) => {
		pool.query('SELECT * FROM user', (err, result) => {
			if (err) {
				return reject(err)
			}

			return resolve(result)
		})
	})
}

usersDB.getUser = (email) => {
	return new Promise((resolve, reject) => {
		pool.query('SELECT * FROM user WHERE email = ?', [email], (err, result) => {
			if (err) {
				return reject(err)
			}
			return resolve(result)
		})
	})
}


usersDB.insertUser = (email, password) => {
	return new Promise((resolve, reject) => {
		pool.query("INSERT INTO user (email, password) VALUES ?", [[[email, password]]], (err, result) => {
			if (err) {
				return reject(err)
			}

			return resolve(result)
		})
	})
}

usersDB.getUserByEmail = async (email) => {
	try {
		let results = await usersDB.getUser(email)
		
		if (results.length == 0) return null

		return ({id: results[0].id, email: results[0].email, password: results[0].password})
	} catch(e) {
		console.log(e)
	}
}

module.exports = usersDB