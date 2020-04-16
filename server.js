const express = require('express')
const app = express()

var logged_in = false

app.use(express.static(__dirname + '/public'));

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

app.get('/hotel-room', function (req, res) {
	res.render('hotel-room.html');
});

app.get('/list_property', function (req, res) {
	if(logged_in) {
		res.render('list_property.html');
	} else {
		res.redirect('/login');
	}
});

app.post('/login', function (req, res) { 
	logged_in = true
	res.redirect('/');
});

app.listen(3000)