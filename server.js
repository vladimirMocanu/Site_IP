const express = require('express')
const database = require('./database')

var app = express()

var logged_in = false

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }))

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', (req, res) => {
	res.render('index.html')
})

app.get('/header', function (req, res) {
	res.render('header.html');
});

app.get('/subscribe', function (req, res) {
	res.render('subscribe.html');
});

app.get('/footer', function (req, res) {
	res.render('footer.html');
});

app.get('/login', function (req, res) {
	res.render('login.html');
});

app.get('/signup', function (req, res) {
	res.render('signup.html');
});

app.get('/about', function (req, res) {
	res.render('about.html');
});

app.get('/contact', function (req, res) {
	res.render('contact.html');
});

app.get('/hotels', function (req, res) {
	res.render('hotels.html');
});

app.get('/hotel', function (req, res) {
	res.render('hotel.html');
});

app.get('/hotelpage', function (req, res) {
	res.render('hotelpage.html');
});

app.get('/room', function (req, res) {
	res.render('room.html');
});

app.get('/list_property', function (req, res) {
	if (logged_in) {
		res.render('list_property.html');
	} else {
		res.redirect('/login');
	}
});

app.get('/booknow', function (req, res) {
	if (logged_in) {
		console.log('it was a scam! thank you for the money');
		res.redirect('/');
	} else {
		res.redirect('/login');
	}
});

app.post('/login', function (req, res) {
	console.log(req.headers.referer);
	if(logged_in === false) {
		database.hasUser(req.body.email, function(result) {
			if (result.length != 0 && result[0].pass === req.body.pass) {
				logged_in = true;

			} else {
				res.redirect('/login');
			}
		});
	} else {
		res.redirect('/login');
	}
});

app.post('/signup', function (req, res) { 
	if( req.body.pass === req.body.confpass) {
		database.hasUser(req.body.email, function(result){
			if (result.length == 0) {
				database.insertUser(req.body.email, req.body.pass);
				res.redirect('/');
			} else {
				res.redirect('/signup');
			}
		});
		

	} else {
		res.redirect('/signup');
	}

	
});

app.listen(3000)